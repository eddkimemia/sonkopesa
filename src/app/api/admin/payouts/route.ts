import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const forbidden = await requireAdmin()
  if (forbidden) return forbidden

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const status = searchParams.get("status")

    const where: any = {}
    if (status) where.status = status

    const skip = (page - 1) * limit

    const [payouts, total] = await Promise.all([
      db.payout.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, phone: true },
          },
        },
      }),
      db.payout.count({ where }),
    ])

    return NextResponse.json({
      payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin payouts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdmin()
  if (forbidden) return forbidden

  try {
    const body = await request.json()
    const { payoutId, action, approvedBy } = body

    if (!payoutId || !action) {
      return NextResponse.json(
        { error: "Payout ID and action are required" },
        { status: 400 }
      )
    }

    const payout = await db.payout.findUnique({
      where: { id: payoutId },
      include: { user: true },
    })

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }

    if (action === "approve") {
      // Use FIFO to deduct exactly payout.amount from pending commissions (partial payout safe)
      const pendingCommissions = await db.commission.findMany({
        where: { userId: payout.userId, status: "pending" },
        orderBy: { createdAt: "asc" },
      })
      const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0)
      if (totalPending < payout.amount) {
        return NextResponse.json({ error: `Insufficient pending commissions. Available KES ${totalPending.toFixed(2)}, requested KES ${payout.amount.toFixed(2)}` }, { status: 400 })
      }

      let remaining = payout.amount
      // Wrap deductions in a transaction for atomicity
      await db.$transaction(async (tx) => {
        for (const comm of pendingCommissions) {
          if (remaining <= 0) break
          if (comm.amount <= remaining) {
            await tx.commission.update({
              where: { id: comm.id },
              data: { status: "paid", description: `${comm.description || ""} [Paid via payout ${payout.id}]`.trim() },
            })
            remaining -= comm.amount
          } else {
            // Split commission: reduce original pending, create a new paid commission for the partial amount
            const leftover = comm.amount - remaining
            await tx.commission.update({
              where: { id: comm.id },
              data: { amount: leftover },
            })
            await tx.commission.create({
              data: {
                userId: comm.userId,
                referralId: comm.referralId,
                amount: remaining,
                type: comm.type,
                status: "paid",
                description: `${comm.description || ""} [Partial paid ${remaining.toFixed(2)} via payout ${payout.id}]`.trim(),
              },
            })
            // Also create a compensating transaction for audit?
            remaining = 0
            break
          }
        }

        await tx.payout.update({
          where: { id: payoutId },
          data: {
            status: "approved",
            approvedBy: approvedBy || "admin",
            approvedAt: new Date(),
          },
        })

        await tx.transaction.create({
          data: {
            userId: payout.userId,
            type: "payout",
            amount: payout.amount,
            status: "completed",
            reference: `POUT-${payout.id}`,
            description: `Payout approved - KES ${payout.amount.toFixed(2)} to ${payout.phone}`,
          },
        })
      })

      const updated = await db.payout.findUnique({ where: { id: payoutId } })
      return NextResponse.json({ payout: updated })
    } else if (action === "reject") {
      const updated = await db.payout.update({
        where: { id: payoutId },
        data: {
          status: "rejected",
          approvedBy: approvedBy || "admin",
          approvedAt: new Date(),
        },
      })

      return NextResponse.json({ payout: updated })
    } else {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Admin payout action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
