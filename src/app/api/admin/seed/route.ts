import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { generateReferralCode } from "@/lib/utils"

// POST /api/admin/seed?secret=YOUR_SECRET
// Secret must match SEED_SECRET env or fallback to NEXTAUTH_SECRET
// If no admin exists, allow unauthenticated init for first deploy (fixes Vercel Invalid credentials)
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  const expected = process.env.SEED_SECRET || process.env.NEXTAUTH_SECRET

  // Allow unauthenticated seed if no admin exists yet (first deploy)
  let adminExists = false
  try {
    adminExists = (await db.user.count({ where: { role: "admin" } })) > 0
  } catch {}
  const isSecretValid = secret && expected && secret === expected
  if (adminExists && !isSecretValid) {
    return NextResponse.json({ error: "Unauthorized - invalid secret. Use ?secret=NEXTAUTH_SECRET" }, { status: 401 })
  }

  try {
    // Check DB connection and push is assumed done; if tables missing, this will throw P2021
    const adminEmail = "admin@sonkopesa.co.ke"
    const adminPassword = "Admin123!"
    let admin = await db.user.findUnique({ where: { email: adminEmail } })
    if (!admin) {
      const hash = await bcrypt.hash(adminPassword, 10)
      let code = generateReferralCode()
      while (await db.user.findUnique({ where: { referralCode: code } })) code = generateReferralCode()
      const adminCode = (await db.user.findUnique({ where: { referralCode: "ADMIN" } })) ? code : "ADMIN"
      admin = await db.user.create({
        data: {
          name: "Admin",
          email: adminEmail,
          phone: "0700000000",
          password: hash,
          role: "admin",
          referralCode: adminCode,
          status: "active",
        },
      })
    } else if (admin.role !== "admin") {
      admin = await db.user.update({ where: { email: adminEmail }, data: { role: "admin", status: "active" } })
    }

    const usersToSeed = [
      { name: "Grace Wanjiku", email: "grace.wanjiku@example.com", phone: "0711223344", password: "Member123!" },
      { name: "James Otieno", email: "james.otieno@example.com", phone: "0722334455", password: "Member123!" },
    ]

    const results = []
    for (const u of usersToSeed) {
      const existing = await db.user.findFirst({ where: { OR: [{ email: u.email }, { phone: u.phone }] } })
      if (existing) {
        results.push({ email: u.email, status: "exists", id: existing.id })
        continue
      }
      const hash = await bcrypt.hash(u.password, 10)
      let code = generateReferralCode()
      while (await db.user.findUnique({ where: { referralCode: code } })) code = generateReferralCode()
      const user = await db.user.create({
        data: {
          name: u.name,
          email: u.email,
          phone: u.phone,
          password: hash,
          referralCode: code,
          referredBy: admin.id,
          status: "active",
          mpesaNumber: u.phone,
        },
      })
      const referral = await db.referral.create({
        data: { referrerId: admin.id, refereeId: user.id, status: "completed", level: 1 },
      })
      const commission = await db.commission.create({
        data: { userId: admin.id, referralId: referral.id, amount: 200, type: "direct", status: "pending", description: `Direct commission for referring ${u.name}` },
      })
      await db.transaction.create({
        data: { userId: admin.id, type: "commission", amount: 200, status: "pending", reference: `DIR-${commission.id}`, description: `Direct referral commission - KES 200.00` },
      })
      const bonus = await db.commission.create({
        data: { userId: user.id, amount: 200, type: "signup_bonus", status: "locked", description: `Signup airtime bonus - KES 200 (unlock after 5 referrals)` },
      })
      await db.transaction.create({
        data: { userId: user.id, type: "bonus", amount: 200, status: "locked", reference: `BONUS-${bonus.id}`, description: `Signup bonus KES 200 - locked until 5 referrals` },
      })
      await db.transaction.create({
        data: { userId: user.id, type: "payment", amount: 500, status: "completed", reference: `SEED-${user.id.slice(-6).toUpperCase()}`, description: `M-Pesa payment of KES 500.00 (seeded)` },
      })
      results.push({ email: u.email, status: "created", id: user.id, referralCode: code })
    }

    const total = await db.user.count()
    return NextResponse.json({ message: "Seed completed", admin: admin.email, totalUsers: total, results })
  } catch (e: any) {
    console.error("Seed error:", e)
    // P2021 means tables don't exist - need db push
    if (e.code === "P2021") {
      return NextResponse.json({ error: "Tables do not exist. Run prisma db push against production DATABASE_URL first.", code: e.code, meta: e.meta }, { status: 500 })
    }
    return NextResponse.json({ error: e.message || "Seed failed", code: e.code }, { status: 500 })
  }
}

// Also allow GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request)
}
