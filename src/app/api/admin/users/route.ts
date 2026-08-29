import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { requireAdmin } from "@/lib/auth-helpers"
import { createSignupBonus, processReferralCommission } from "@/lib/commission-engine"

export async function GET(request: NextRequest) {
  const forbidden = await requireAdmin()
  if (forbidden) return forbidden

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const search = searchParams.get("search") || ""
    const statusFilter = searchParams.get("status")

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (statusFilter && ["active", "pending", "suspended"].includes(statusFilter)) {
      where.status = statusFilter
    }

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          referralCode: true,
          status: true,
          referredBy: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              referrals: true,
              transactions: true,
              commissions: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdmin()
  if (forbidden) return forbidden

  try {
    const body = await request.json()
    const { userId, status, name, email, phone, referralCode, newPassword } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (status !== undefined) {
      if (!["active", "pending", "suspended"].includes(status)) {
        return NextResponse.json({ error: "Status must be 'active', 'pending', or 'suspended'" }, { status: 400 })
      }
      updateData.status = status
    }
    if (name !== undefined) updateData.name = name || null
    if (email !== undefined) {
      // allow clearing email
      if (email) {
        const existing = await db.user.findFirst({ where: { email, NOT: { id: userId } } })
        if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })
        updateData.email = email
      } else {
        updateData.email = null
      }
    }
    if (phone !== undefined) {
      if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 })
      const existing = await db.user.findFirst({ where: { phone, NOT: { id: userId } } })
      if (existing) return NextResponse.json({ error: "Phone already in use" }, { status: 409 })
      if (!/^07\d{8}$/.test(phone)) return NextResponse.json({ error: "Phone must be valid Kenyan 07..." }, { status: 400 })
      updateData.phone = phone
      // keep mpesaNumber in sync if it was same as old phone
      if (user.mpesaNumber === user.phone) updateData.mpesaNumber = phone
    }
    if (referralCode !== undefined) {
      if (!referralCode || referralCode.length < 3) return NextResponse.json({ error: "Referral code must be at least 3 chars" }, { status: 400 })
      const existing = await db.user.findFirst({ where: { referralCode, NOT: { id: userId } } })
      if (existing) return NextResponse.json({ error: "Referral code already in use" }, { status: 409 })
      updateData.referralCode = referralCode.toUpperCase()
    }
    if (newPassword !== undefined && newPassword !== "") {
      if (newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        referralCode: true,
        status: true,
        referredBy: true,
      },
    })

    if (status === "active" && user.status === "pending") {
      // Use membership_fee from settings if available
      const feeSetting = (await db.setting.findUnique({ where: { key: "membership_fee" } }))?.value || "500"
      const feeAmount = parseFloat(feeSetting) || 500
      await db.transaction.create({
        data: {
          userId,
          type: "payment",
          amount: feeAmount,
          status: "completed",
          reference: `ADMIN-ACTIVATE-${Date.now()}`,
          description: `Manual activation by admin - KES ${feeAmount.toFixed(2)}`,
        },
      })

      // Credit signup bonus for manually activated user
      await createSignupBonus(userId)

      if (user.referredBy) {
        await processReferralCommission(userId)
      }
    }

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("Admin update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdmin()
  if (forbidden) return forbidden

  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await db.$transaction([
      db.commission.deleteMany({ where: { userId } }),
      db.transaction.deleteMany({ where: { userId } }),
      db.payout.deleteMany({ where: { userId } }),
      db.payoutMethod.deleteMany({ where: { userId } }),
      db.mpesaTransaction.deleteMany({ where: { userId } }),
      db.referral.deleteMany({ where: { referrerId: userId } }),
      db.referral.deleteMany({ where: { refereeId: userId } }),
      db.user.delete({ where: { id: userId } }),
    ])

    return NextResponse.json({ message: "User deleted" })
  } catch (error) {
    console.error("Admin delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
