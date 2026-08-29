import { db } from "@/lib/db"

const FALLBACK_FEE = 500
const FALLBACK_RATE = 0.4

async function getSetting(key: string, fallback: string): Promise<string> {
  const s = await db.setting.findUnique({ where: { key } })
  if (s?.value) return s.value
  if (key === "minimum_payout") {
    const legacy = await db.setting.findUnique({ where: { key: "min_payout" } })
    if (legacy?.value) return legacy.value
  }
  return fallback
}

async function getCommissionConfig() {
  const [feeStr, rateStr] = await Promise.all([
    getSetting("membership_fee", String(FALLBACK_FEE)),
    getSetting("direct_commission", String(FALLBACK_RATE * 100)),
  ])
  return {
    fee: parseFloat(feeStr) || FALLBACK_FEE,
    rate: (parseFloat(rateStr) || FALLBACK_RATE * 100) / 100,
  }
}

export async function calculateCommission(amount: number, level: number): Promise<number> {
  if (level !== 1) return 0
  const cfg = await getCommissionConfig()
  return amount * cfg.rate
}

export async function distributeCommissions(
  referralId: string,
  refereeId: string
): Promise<void> {
  const referral = await db.referral.findUnique({
    where: { id: referralId },
  })
  if (!referral) return

  const cfg = await getCommissionConfig()
  const level1Amount = await calculateCommission(cfg.fee, 1)
  const level1Commission = await db.commission.create({
    data: {
      userId: referral.referrerId,
      referralId,
      amount: level1Amount,
      type: "direct",
      status: "pending",
      description: `Level 1 commission - KES ${level1Amount.toFixed(2)}`,
    },
  })

  await db.transaction.create({
    data: {
      userId: referral.referrerId,
      type: "commission",
      amount: level1Amount,
      status: "pending",
      reference: `L1-${level1Commission.id}`,
      description: `Level 1 referral commission - KES ${level1Amount.toFixed(2)}`,
    },
  })
}

export async function processPayout(
  userId: string,
  amount: number
): Promise<{ success: boolean; reference?: string }> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")

  const [pendingCommissions, pendingPayouts] = await Promise.all([
    db.commission.aggregate({ where: { userId, status: "pending" }, _sum: { amount: true } }),
    db.payout.aggregate({ where: { userId, status: "pending" }, _sum: { amount: true } }),
  ])

  const grossPending = pendingCommissions._sum.amount || 0
  const reserved = pendingPayouts._sum.amount || 0
  const availableBalance = Math.max(0, grossPending - reserved)

  if (amount > availableBalance) {
    throw new Error(`Insufficient withdrawable balance. Available KES ${availableBalance.toFixed(2)} (Gross KES ${grossPending.toFixed(2)} minus KES ${reserved.toFixed(2)} pending payouts)`)
  }

  const payout = await db.payout.create({
    data: {
      userId,
      amount,
      status: "pending",
      method: "mpesa",
      phone: user.mpesaNumber || user.phone,
    },
  })

  return {
    success: true,
    reference: payout.id,
  }
}
