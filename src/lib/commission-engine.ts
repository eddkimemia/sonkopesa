import { db } from "@/lib/db"

// Fallback constants (used if settings not configured)
const FALLBACK_REFERRAL_FEE = 500
const FALLBACK_DIRECT_RATE = 0.4 // 40%
const FALLBACK_BONUS_AMOUNT = 200
const FALLBACK_BONUS_REQUIRED = 5

export let SIGNUP_BONUS_AMOUNT = FALLBACK_BONUS_AMOUNT
export let SIGNUP_BONUS_REQUIRED_REFERRALS = FALLBACK_BONUS_REQUIRED

async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const s = await db.setting.findUnique({ where: { key } })
    if (s?.value) return s.value
    // legacy fallback for minimum_payout
    if (key === "minimum_payout") {
      const legacy = await db.setting.findUnique({ where: { key: "min_payout" } })
      if (legacy?.value) return legacy.value
    }
    return fallback
  } catch {
    return fallback
  }
}

export async function getCommissionConfig() {
  const [feeStr, rateStr, bonusStr, requiredStr] = await Promise.all([
    getSetting("membership_fee", String(FALLBACK_REFERRAL_FEE)),
    getSetting("direct_commission", String(FALLBACK_DIRECT_RATE * 100)),
    getSetting("signup_bonus_amount", String(FALLBACK_BONUS_AMOUNT)),
    getSetting("signup_bonus_required_referrals", String(FALLBACK_BONUS_REQUIRED)),
  ])
  const fee = parseFloat(feeStr) || FALLBACK_REFERRAL_FEE
  const ratePct = parseFloat(rateStr) || FALLBACK_DIRECT_RATE * 100
  const bonus = parseFloat(bonusStr) || FALLBACK_BONUS_AMOUNT
  const required = parseInt(requiredStr) || FALLBACK_BONUS_REQUIRED
  // Keep exported constants in sync for callers that import them
  SIGNUP_BONUS_AMOUNT = bonus
  SIGNUP_BONUS_REQUIRED_REFERRALS = required
  return {
    REFERRAL_FEE: fee,
    DIRECT_COMMISSION_RATE: ratePct / 100,
    SIGNUP_BONUS_AMOUNT: bonus,
    SIGNUP_BONUS_REQUIRED_REFERRALS: required,
  }
}

export async function createSignupBonus(userId: string) {
  try {
    const existing = await db.commission.findFirst({
      where: { userId, type: "signup_bonus" },
    })
    if (existing) return existing

    const cfg = await getCommissionConfig()

    const bonus = await db.commission.create({
      data: {
        userId,
        amount: cfg.SIGNUP_BONUS_AMOUNT,
        type: "signup_bonus",
        status: "locked",
        description: `Signup airtime bonus - KES ${cfg.SIGNUP_BONUS_AMOUNT} (unlock after ${cfg.SIGNUP_BONUS_REQUIRED_REFERRALS} referrals)`,
      },
    })

    await db.transaction.create({
      data: {
        userId,
        type: "bonus",
        amount: cfg.SIGNUP_BONUS_AMOUNT,
        status: "locked",
        reference: `BONUS-${bonus.id}`,
        description: `Signup bonus KES ${cfg.SIGNUP_BONUS_AMOUNT} - locked until ${cfg.SIGNUP_BONUS_REQUIRED_REFERRALS} referrals`,
      },
    })

    return bonus
  } catch (error) {
    console.error("Signup bonus creation error:", error)
  }
}

export async function checkAndUnlockSignupBonus(userId: string) {
  try {
    const lockedBonus = await db.commission.findFirst({
      where: { userId, type: "signup_bonus", status: "locked" },
    })
    if (!lockedBonus) return

    const cfg = await getCommissionConfig()
    const referralCount = await db.referral.count({
      where: { referrerId: userId, status: "completed" },
    })

    if (referralCount >= cfg.SIGNUP_BONUS_REQUIRED_REFERRALS) {
      await db.commission.update({
        where: { id: lockedBonus.id },
        data: { status: "pending", description: `Signup airtime bonus - KES ${cfg.SIGNUP_BONUS_AMOUNT} (unlocked after ${referralCount} referrals)` },
      })

      await db.transaction.updateMany({
        where: { userId, type: "bonus", status: "locked" },
        data: { status: "pending", description: `Signup bonus KES ${cfg.SIGNUP_BONUS_AMOUNT} - unlocked! Available for withdrawal` },
      })
    }
  } catch (error) {
    console.error("Bonus unlock check error:", error)
  }
}

export async function processReferralCommission(refereeId: string) {
  try {
    const referee = await db.user.findUnique({ where: { id: refereeId } })
    if (!referee) return

    const referral = await db.referral.findFirst({
      where: { refereeId, status: "completed" },
      include: {
        referrer: true,
      },
    })

    if (!referral) return

    const cfg = await getCommissionConfig()
    const directAmount = cfg.REFERRAL_FEE * cfg.DIRECT_COMMISSION_RATE

    const directCommission = await db.commission.create({
      data: {
        userId: referral.referrerId,
        referralId: referral.id,
        amount: directAmount,
        type: "direct",
        status: "pending",
        description: `Direct commission for referring ${referee.name || referee.phone}`,
      },
    })

    await db.transaction.create({
      data: {
        userId: referral.referrerId,
        type: "commission",
        amount: directAmount,
        status: "pending",
        reference: `DIR-${directCommission.id}`,
        description: `Direct referral commission - KES ${directAmount.toFixed(2)}`,
      },
    })

    // Check if referrer's signup bonus can be unlocked after this referral
    await checkAndUnlockSignupBonus(referral.referrerId)
  } catch (error) {
    console.error("Commission processing error:", error)
  }
}
