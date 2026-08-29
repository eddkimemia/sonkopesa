"use client"

import { useEffect, useState } from "react"
import { Save, Settings as SettingsIcon, Loader2, AlertCircle, CheckCircle2, Lock, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const [membershipFee, setMembershipFee] = useState("500")
  const [directCommission, setDirectCommission] = useState("40")
  const [signupBonus, setSignupBonus] = useState("200")
  const [signupRequired, setSignupRequired] = useState("5")
  const [minPayout, setMinPayout] = useState("200")
  // Legacy upline kept for migration but disabled (0)
  const [uplineOverride, setUplineOverride] = useState("0")

  // Admin self password
  const [curPwd, setCurPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState("")
  const [pwdError, setPwdError] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d })
      .then((d) => {
        if (d.settings) {
          setMembershipFee(d.settings.membership_fee || "500")
          setDirectCommission(d.settings.direct_commission || "40")
          setUplineOverride(d.settings.upline_override || "0")
          // handle both keys for minimum_payout
          setMinPayout(d.settings.minimum_payout || d.settings.min_payout || "200")
          setSignupBonus(d.settings.signup_bonus_amount || "200")
          setSignupRequired(d.settings.signup_bonus_required_referrals || "5")
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg("")
    setError("")
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            membership_fee: membershipFee,
            direct_commission: directCommission,
            upline_override: uplineOverride,
            minimum_payout: minPayout,
            min_payout: minPayout, // keep legacy sync
            signup_bonus_amount: signupBonus,
            signup_bonus_required_referrals: signupRequired,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Failed to save")
      else setMsg("Settings saved successfully — commission engine now uses these values.")
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdMsg("")
    setPwdError("")
    if (!curPwd || !newPwd) { setPwdError("Current and new password required"); return }
    if (newPwd.length < 6) { setPwdError("New password must be at least 6 characters"); return }
    if (newPwd !== confirmPwd) { setPwdError("Passwords do not match"); return }
    setPwdSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }),
      })
      const data = await res.json()
      if (!res.ok) setPwdError(data.error || "Failed to update password")
      else {
        setPwdMsg("Password updated successfully")
        setCurPwd(""); setNewPwd(""); setConfirmPwd("")
      }
    } catch { setPwdError("Network error") }
    finally { setPwdSaving(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-lux-gold" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-lux-navy">Platform Settings</h1>
        <p className="text-lux-text-light mt-1">Configure platform fees, commissions, and payout rules. Commission engine reads these live.</p>
      </div>

      <Card className="border-lux-gold/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-lux-navy flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-lux-gold" />
            Commission & Fee Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6 max-w-lg">
            {msg && <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"><CheckCircle2 className="h-4 w-4 flex-shrink-0" />{msg}</div>}
            {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="membership-fee" className="text-lux-text">Membership Fee (KES)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-lux-text-light">KES</span>
                <Input id="membership-fee" type="number" className="pl-12 input-glow" value={membershipFee} onChange={(e) => setMembershipFee(e.target.value)} />
              </div>
              <p className="text-xs text-lux-text-light">One-time fee new members pay to join. Current: 500</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direct-commission" className="text-lux-text">Direct Commission (%)</Label>
              <div className="relative">
                <Input id="direct-commission" type="number" className="pr-10 input-glow" value={directCommission} onChange={(e) => setDirectCommission(e.target.value)} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-lux-text-light">%</span>
              </div>
              <p className="text-xs text-lux-text-light">Percentage the direct referrer earns. 40% of 500 = KES 200. Commission engine uses this live.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signup-bonus" className="text-lux-text">Signup Bonus (KES)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-lux-text-light">KES</span>
                  <Input id="signup-bonus" type="number" className="pl-12 input-glow" value={signupBonus} onChange={(e) => setSignupBonus(e.target.value)} />
                </div>
                <p className="text-xs text-lux-text-light">Airtime bonus credited on join.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-required" className="text-lux-text">Bonus Unlock Refs</Label>
                <Input id="signup-required" type="number" className="input-glow" value={signupRequired} onChange={(e) => setSignupRequired(e.target.value)} />
                <p className="text-xs text-lux-text-light">Referrals needed to unlock.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-payout" className="text-lux-text">Minimum Payout (KES)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-lux-text-light">KES</span>
                <Input id="min-payout" type="number" className="pl-12 input-glow" value={minPayout} onChange={(e) => setMinPayout(e.target.value)} />
              </div>
              <p className="text-xs text-lux-text-light">Minimum amount a member can request. Fixes key mismatch: saved as <code>minimum_payout</code> + <code>min_payout</code>.</p>
            </div>

            <div className="space-y-2 opacity-60">
              <Label htmlFor="upline-override" className="text-lux-text">Upline Override (%) — Deprecated</Label>
              <div className="relative">
                <Input id="upline-override" type="number" className="pr-10 input-glow" value={uplineOverride} onChange={(e) => setUplineOverride(e.target.value)} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-lux-text-light">%</span>
              </div>
              <p className="text-xs text-lux-text-light">Removed: 150 upline commission disabled. Keep 0.</p>
            </div>

            <Button type="submit" disabled={saving} className="bg-lux-gold hover:bg-lux-gold-dark text-white font-heading font-bold">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-lux-gold/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-lux-navy flex items-center gap-2">
            <Shield className="h-5 w-5 text-lux-gold" />
            Admin Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            {pwdMsg && <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{pwdMsg}</div>}
            {pwdError && <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{pwdError}</div>}
            <div className="space-y-2">
              <Label htmlFor="cur-pwd" className="text-lux-text">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-lux-text-light" />
                <Input id="cur-pwd" type="password" className="pl-10 input-glow" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} />
              </div>
            </div>
            <Separator className="bg-lux-gold/10" />
            <div className="space-y-2">
              <Label htmlFor="new-pwd" className="text-lux-text">New Password</Label>
              <Input id="new-pwd" type="password" className="input-glow" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pwd" className="text-lux-text">Confirm New Password</Label>
              <Input id="confirm-pwd" type="password" className="input-glow" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
            </div>
            <Button type="submit" disabled={pwdSaving} className="bg-lux-navy hover:bg-lux-navy-light text-white font-heading font-bold">
              {pwdSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
              Update Admin Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
