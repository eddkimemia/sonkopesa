"use client"

import { useState } from "react"
import Link from "next/link"
import { DollarSign, TrendingUp, Users, ArrowRight, CheckCircle, XCircle, Clock, Zap, Shield, Headphones, Lock, HelpCircle, BarChart3, Target, Sparkles, ChevronRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { FadeIn, FadeInScale, SectionHeading } from "@/components/landing/shared"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const breakdownData = [
  { name: "Direct Referral Commission (40%)", value: 200, color: "#0EA5E9", label: "KES 200" },
  { name: "Platform & Operations (60%)", value: 300, color: "#0F2847", label: "KES 300" },
]

const earningRoles = [
  { title: "Signup Bonus", amount: "KES 200", desc: "Get KES 200 airtime bonus credited instantly after you pay KES 500. You’re already 40% back on day one. Unlocks after 5 referrals. No waiting. No risk.", color: "text-lux-gold-dark", bg: "bg-lux-gold-pale", icon: Sparkles },
  { title: "Direct Referrer", amount: "KES 200", desc: "You earn 40% commission on every person you directly refer. KES 200 hits your M-Pesa in 60 seconds. No delays, no thresholds, no forms. Just share your link and get paid.", color: "text-lux-navy", bg: "bg-lux-navy/10", icon: Users },
]

const quickRefData = [
  { referrals: 1, direct: "KES 200", total: "KES 200" },
  { referrals: 5, direct: "KES 1,000", total: "KES 1,000" },
  { referrals: 10, direct: "KES 2,000", total: "KES 2,000" },
  { referrals: 20, direct: "KES 4,000", total: "KES 4,000" },
  { referrals: 50, direct: "KES 10,000", total: "KES 10,000" },
]

const comparisonRows = [
  { label: "Startup Cost", zuri: "KES 500 (one-time)", side: "KES 2,000 - 10,000", emp: "KES 0 (time)" },
  { label: "Income Potential", zuri: "Unlimited (no cap)", side: "Limited by product", emp: "Fixed salary" },
  { label: "Time Commitment", zuri: "Flexible (few hrs/wk)", side: "Hours per day", emp: "40+ hrs/week" },
  { label: "Risk Level", zuri: "Low (one-time fee)", side: "Medium (stock/invest)", emp: "Low (stable)" },
  { label: "Earning Potential", zuri: "KES 200 - 70,000+/mo", side: "KES 500 - 30,000/mo", emp: "KES 15,000 - 100,000/mo" },
  { label: "Flexibility", zuri: "100% remote & mobile", side: "Varies", emp: "On-site" },
  { label: "Payment Speed", zuri: "Instant M-Pesa", side: "Weekly/monthly", emp: "Monthly" },
  { label: "Skills Required", zuri: "None (just sharing)", side: "Sales/marketing", emp: "Qualifications" },
  { label: "Growth Potential", zuri: "Linear & scalable", side: "Linear (your effort)", emp: "Promotion-based" },
  { label: "Passive Income", zuri: "Single Level", side: "Rarely", emp: "No" },
]

const faqData = [
  {
    q: "When do I get paid?",
    a: "Instantly. The moment someone uses your referral link to join SonkoPesa, KES 200 is sent directly to your registered M-Pesa number. There is no waiting period, no monthly payout cycle, and no minimum balance requirement. This instant payout model is one of the reasons our members trust SonkoPesa — you see the results of your effort immediately, not at the end of the month.",
  },
  {
    q: "Is there a limit to how much I can earn?",
    a: "There is absolutely no earning cap at SonkoPesa. You can earn KES 200 per direct referral and there is no upper limit on how many people you can refer. Some of our top earners are making over KES 70,000 per month by consistently sharing their link. Whether you refer 5 people or 5,000 people, the commission structure remains the same.",
  },
  {
    q: "Can my earnings grow over time without referring more people myself?",
    a: "With SonkoPesa's single-level model, you earn only from your direct referrals. This keeps the system simple and transparent - you know exactly where every shilling comes from. Focus on sharing your link consistently, and your earnings will reflect your effort. No complex team structures, no hidden levels.",
  },
  {
    q: "How do I withdraw my earnings?",
    a: "Withdrawals are fully automatic. Every commission you earn is sent directly to your M-Pesa account the moment the referral is completed. There is no separate withdrawal step, no request form, no minimum payout threshold, and no processing delay. The money simply arrives as an M-Pesa notification on your phone.",
  },
]

const earningsTiers = [
  { name: "Part-Time", referrals: "5 - 10/mo", monthly: "KES 1,000 - KES 2,000", annual: "KES 12,000 - KES 24,000", desc: "Perfect for students, employees, or anyone looking to supplement their income. Share your link with friends and family during your free time. Just 5-10 referrals per month can cover your daily transport, lunch, or even your rent.", icon: Clock, color: "from-sky-400 to-sky-600" },
  { name: "Full-Time", referrals: "20 - 50/mo", monthly: "KES 4,000 - KES 10,000", annual: "KES 48,000 - KES 120,000", desc: "Treat SonkoPesa like a part-time job and watch your earnings rival traditional employment. At this level, you are actively sharing your link on social media, WhatsApp groups, and within your community.", icon: Target, color: "from-sky-500 to-sky-700" },
  { name: "High Performer", referrals: "50+/mo", monthly: "KES 10,000+", annual: "KES 120,000+", desc: "Your focus is on consistent direct referrals. Your monthly earnings can easily exceed KES 20,000 when you stay consistent. This is where SonkoPesa becomes life-changing income.", icon: BarChart3, color: "from-lux-navy to-blue-800" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 shadow-xl border border-lux-gold/20">
        <p className="font-heading font-bold text-sm text-lux-navy">{payload[0].name}</p>
        <p className="text-lg font-bold text-lux-gold-dark">{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function EarningsPage() {
  const [directReferrals, setDirectReferrals] = useState(10)

  const directEarnings = directReferrals * 200
  const totalMonthly = directEarnings
  const annualProjection = totalMonthly * 12

  return (
    <div className="min-h-screen bg-lux-cream overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lux-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-lux-navy/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, #0F2847 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      {/* Hero - HARD MARKETING */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-lux-gold to-lux-gold-light text-white border-0 font-bold shadow-md">KES 200 Bonus Instantly • 40% Payout • No Cap</Badge>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-lux-navy">
              Invest <span className="text-lux-gold">500</span>. Get <span className="text-lux-gold">200</span> Back. Earn <span className="text-gradient">Unlimited.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="mt-8 text-lg sm:text-xl text-lux-navy max-w-3xl mx-auto leading-relaxed font-semibold">
              Pay <strong>KES 500 once</strong> → <span className="bg-lux-gold text-white px-2 py-1 rounded-full text-sm">KES 200 bonus instantly</span> + <strong>KES 200</strong> per referral for life. <span className="text-lux-gold-dark">3 referrals = profit.</span> No cap. No monthly fees. Paystack & M-Pesa instant.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <div className="bg-lux-navy text-white rounded-full px-6 py-3 font-bold">KES 200 Direct</div>
              <div className="bg-lux-gold text-white rounded-full px-6 py-3 font-bold">KES 200 Bonus</div>
              <div className="bg-green-600 text-white rounded-full px-6 py-3 font-bold">40% Payout</div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pie Chart + Earning Roles */}
      <section className="py-8 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeInScale>
              <Card className="border-0 shadow-lg card-lift">
                <CardContent className="p-6 lg:p-8">
                  <h3 className="font-heading font-bold text-xl text-lux-navy mb-2">KES 200 of KES 500 Goes to You</h3>
                  <p className="text-sm text-lux-text-light mb-6">40% of every membership fee is paid directly as referral commission</p>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {breakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={60}
                          formatter={(value: string) => (
                            <span className="text-sm text-lux-text font-medium">{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-sm text-lux-text-light mt-4">
                    <span className="font-bold text-lux-navy">You earn KES 200</span> out of KES 500 (40% direct commission)
                  </p>
                </CardContent>
              </Card>
            </FadeInScale>

            <div className="space-y-6">
              {earningRoles.map((role, i) => {
                const Icon = role.icon
                return (
                  <FadeIn key={role.title} delay={i * 100}>
                    <Card className="border-0 shadow-md card-lift border-l-4" style={{ borderLeftColor: i === 0 ? "#0F2847" : "#0EA5E9" }}>
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${role.bg} flex-shrink-0`}>
                          <Icon className={`h-5 w-5 ${role.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-heading font-bold text-lux-navy">{role.title}</h4>
                            <span className={`font-heading font-bold text-lg ${role.color}`}>{role.amount}</span>
                          </div>
                          <p className="text-sm text-lux-text-light mt-1">{role.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )
              })}
              <FadeIn delay={200}>
                <Card className="border-0 shadow-md card-lift bg-sky-50 border-l-4" style={{ borderLeftColor: "#0284C7" }}>
                  <CardContent className="p-5">
                    <h4 className="font-heading font-bold text-lux-navy">Single Level • 100% Transparent</h4>
                    <p className="text-sm text-lux-text-light mt-1">Earnings are simple: you earn only from people YOU directly refer. No complex calculations, no hidden levels.</p>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Calculator Explanation */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FadeIn className="text-center mb-12">
              <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-lux-gold-pale text-lux-gold-dark border border-lux-gold/20">Commission Calculator</span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-lux-navy heading-underline">How Your Earnings Add Up</h2>
              <p className="mt-6 text-lg text-lux-text-light max-w-3xl mx-auto leading-relaxed">
                Understanding the math behind your commissions is the first step to building a sustainable income with SonkoPesa. Here is exactly how every referral translates into real money in your pocket.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <FadeInScale delay={100}>
                <Card className="border-0 shadow-lg card-lift h-full">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lux-navy/10">
                        <Users className="h-5 w-5 text-lux-navy" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-lux-navy">Direct Referral</h3>
                    </div>
                    <p className="text-lux-text leading-relaxed">
                      When you share your unique referral link and someone clicks it and completes their KES 500 membership, you earn KES 200 immediately. This is your direct referral commission, and it represents 40% of the membership fee. The payment lands in your M-Pesa account within seconds of their registration — no forms, no delays, no minimum thresholds.
                    </p>
                    <div className="mt-4 p-3 bg-lux-navy/5 rounded-lg">
                      <p className="text-sm font-medium text-lux-navy">Example: 10 direct referrals = KES 2,000 in your pocket</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeInScale>

              <FadeInScale delay={200}>
                <Card className="border-0 shadow-lg card-lift h-full bg-sky-50">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                        <Zap className="h-5 w-5 text-lux-gold-dark" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-lux-navy">Simple Single Level</h3>
                    </div>
                    <p className="text-lux-text leading-relaxed">
                      We keep it simple and fair: you earn KES 200 only for people YOU bring in. No second-level or hidden fees. Every shilling you see is directly tied to YOUR effort — transparent, instant, and easy to track on your dashboard.
                    </p>
                    <div className="mt-4 p-3 bg-white rounded-lg border border-sky-100">
                      <p className="text-sm font-medium text-lux-gold-dark">Simple math: 5 referrals = KES 1,000 • 20 referrals = KES 4,000</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeInScale>
            </div>

            <FadeIn delay={300}>
              <div className="bg-lux-navy rounded-xl p-6 lg:p-8 text-center">
                <h3 className="font-heading font-bold text-2xl text-white mb-3">The Total Opportunity</h3>
                <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  When someone pays KES 500 to join SonkoPesa, KES 200 goes directly to you as the person who referred them (40% direct commission). The remaining KES 300 keeps the platform running — servers, support, M-Pesa integration fees, security, and continuous improvement. Plus you get a KES 200 airtime bonus (unlock after 5 referrals) as a welcome reward.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Calculate Your Earnings"
            title="Earnings Calculator"
            subtitle="See exactly how much you could earn based on your referrals."
          />

          <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto mt-8">
            <div className="lg:col-span-3">
              <FadeInScale delay={200}>
                <Card className="border-0 shadow-lg card-lift">
                  <CardContent className="p-6 lg:p-8">
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Sliders */}
                      <div className="space-y-8">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="font-heading font-semibold text-lux-navy">Direct Referrals</label>
                            <span className="font-heading font-bold text-2xl text-lux-gold-dark">{directReferrals}</span>
                          </div>
                          <Slider
                            value={[directReferrals]}
                            onValueChange={([v]) => setDirectReferrals(v)}
                            min={1}
                            max={100}
                            step={1}
                            className="[&_[data-slot=slider-range]]:bg-lux-gold [&_[data-slot=slider-thumb]]:border-lux-gold"
                          />
                          <div className="flex justify-between mt-1 text-xs text-lux-text-light">
                            <span>1</span>
                            <span>50</span>
                            <span>100</span>
                          </div>
                          <p className="text-sm text-lux-text-light mt-2">
                            Direct earnings: <strong className="text-lux-navy">KES {directEarnings.toLocaleString()}/mo</strong>
                          </p>
                        </div>
                      </div>

                      {/* Results */}
                      <div className="bg-lux-navy rounded-xl p-6 flex flex-col justify-center">
                        <p className="text-gray-400 text-sm font-medium">Your Monthly Earnings</p>
                        <p className="font-heading font-bold text-4xl lg:text-5xl text-lux-gold mt-2">
                          KES {totalMonthly.toLocaleString()}
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Annual Projection</span>
                            <span className="font-heading font-bold text-white">KES {annualProjection.toLocaleString()}/year</span>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-400">Direct ({directReferrals} x KES 200)</span>
                            <span className="text-lux-gold">KES {directEarnings.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-3">+ KES 200 signup bonus unlocks after 5 referrals</p>
                        </div>
                        <Link href="/register" className="mt-6">
                          <Button className="w-full bg-lux-gold hover:bg-lux-gold-dark text-white font-heading font-bold h-12 rounded-lg shadow-lg shadow-lux-gold/25 btn-shine">
                            Start Earning Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInScale>
            </div>

            {/* Why This Matters */}
            <div className="lg:col-span-2">
              <FadeInScale delay={300}>
                <Card className="border-0 shadow-lg card-lift h-full bg-lux-gold-pale/30">
                  <CardContent className="p-6 lg:p-8">
                    <h3 className="font-heading font-bold text-xl text-lux-navy mb-4">Why These Numbers Matter</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lux-gold/20 flex-shrink-0 mt-0.5">
                          <Sparkles className="h-4 w-4 text-lux-gold-dark" />
                        </div>
                        <div>
                          <p className="font-semibold text-lux-navy text-sm">Low Entry, High Return</p>
                          <p className="text-sm text-lux-text-light mt-0.5">Your total investment is KES 500. 3 referrals (KES 600) and you are in profit.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lux-gold/20 flex-shrink-0 mt-0.5">
                          <TrendingUp className="h-4 w-4 text-lux-gold-dark" />
                        </div>
                        <div>
                          <p className="font-semibold text-lux-navy text-sm">Simple & Transparent</p>
                          <p className="text-sm text-lux-text-light mt-0.5">One level, one rate: KES 200 per direct referral. No hidden tiers.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lux-gold/20 flex-shrink-0 mt-0.5">
                          <DollarSign className="h-4 w-4 text-lux-gold-dark" />
                        </div>
                        <div>
                          <p className="font-semibold text-lux-navy text-sm">Instant Liquidity</p>
                          <p className="text-sm text-lux-text-light mt-0.5">No waiting for end of month. Every commission hits your M-Pesa instantly.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lux-gold/20 flex-shrink-0 mt-0.5">
                          <BarChart3 className="h-4 w-4 text-lux-gold-dark" />
                        </div>
                        <div>
                          <p className="font-semibold text-lux-navy text-sm">Scalable Income</p>
                          <p className="text-sm text-lux-text-light mt-0.5">Whether you want KES 1,000 or KES 10,000 per month, the math works the same.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInScale>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Potential Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-lux-gold-pale text-lux-gold-dark border border-lux-gold/20">Earnings Potential</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-lux-navy heading-underline">What You Can Realistically Earn</h2>
            <p className="mt-6 text-lg text-lux-text-light max-w-3xl mx-auto leading-relaxed">
              Your income with SonkoPesa depends entirely on how much time and energy you invest. Here are realistic projections based on direct referrals only.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {earningsTiers.map((tier, i) => {
              const Icon = tier.icon
              return (
                <FadeInScale key={tier.name} delay={i * 100}>
                  <Card className="border-0 shadow-lg card-lift h-full overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
                    <CardContent className="p-6 lg:p-8 text-center">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${tier.color} text-white mb-4 shadow-lg`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="font-heading font-bold text-2xl text-lux-navy">{tier.name}</h3>
                      <p className="text-sm text-lux-text-light mt-1">{tier.referrals}</p>
                      <p className="font-heading font-bold text-lux-gold-dark text-2xl mt-3">{tier.monthly}</p>
                      <p className="text-sm text-lux-text mt-1">per month</p>
                      <div className="mt-3 p-2 bg-lux-navy/5 rounded-lg">
                        <p className="text-sm font-semibold text-lux-navy">{tier.annual} / year</p>
                      </div>
                      <p className="text-sm text-lux-text-light mt-4 leading-relaxed text-left">{tier.desc}</p>
                    </CardContent>
                  </Card>
                </FadeInScale>
              )
            })}
          </div>

          <FadeIn delay={300}>
            <div className="mt-12 p-6 lg:p-8 bg-lux-navy rounded-xl text-center">
              <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
                These figures are direct referral commissions only — KES 200 per person you invite. Consistent sharing is the key. Members earning KES 10,000+ per month simply started sooner and stayed consistent.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick Reference Table */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-lux-gold-pale text-lux-gold-dark border border-lux-gold/20">Quick Reference</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-lux-navy heading-underline">Earnings at a Glance</h2>
            <p className="mt-6 text-lg text-lux-text-light max-w-2xl mx-auto leading-relaxed">
              See how your earnings grow as you refer more people. Simple single-level math.
            </p>
          </FadeIn>

          <FadeInScale delay={200}>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-lux-navy">
                    <th className="py-4 px-4 font-heading font-bold text-white text-lg">Referrals</th>
                    <th className="py-4 px-4 font-heading font-bold text-lux-gold text-lg">Direct Earnings</th>
                    <th className="py-4 px-4 font-heading font-bold text-lux-gold text-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quickRefData.map((row) => (
                    <tr key={row.referrals} className="border-b border-gray-100 hover:bg-lux-gold-pale/50 transition-colors">
                      <td className="py-4 px-4 font-heading font-bold text-xl text-lux-navy">{row.referrals}</td>
                      <td className="py-4 px-4 text-lux-text">{row.direct}</td>
                      <td className="py-4 px-4 font-heading font-bold text-lux-gold-dark text-lg">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm text-lux-text-light mt-4">
              * Single level - KES 200 per direct referral.
            </p>
          </FadeInScale>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-lux-gold-pale text-lux-gold-dark border border-lux-gold/20">Why Choose SonkoPesa</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-lux-navy heading-underline">SonkoPesa vs Other Options</h2>
            <p className="mt-6 text-lg text-lux-text-light max-w-2xl mx-auto leading-relaxed">
              Compare what SonkoPesa offers versus traditional side hustles and employment.
            </p>
          </FadeIn>

          <FadeInScale delay={200}>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-lux-navy">
                    <th className="py-4 px-4 font-heading font-bold text-white">Factor</th>
                    <th className="py-4 px-4 font-heading font-bold text-lux-gold">SonkoPesa</th>
                    <th className="py-4 px-4 font-heading font-bold text-lux-gold/60">Side Hustles</th>
                    <th className="py-4 px-4 font-heading font-bold text-lux-gold/60">Employment</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.label} className={`border-b border-gray-100 hover:bg-lux-gold-pale/50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="py-3 px-4 font-semibold text-lux-navy">{row.label}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {row.zuri}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-lux-text-light">{row.side}</td>
                      <td className="py-3 px-4 text-sm text-lux-text-light">{row.emp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeInScale>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-lux-gold-pale text-lux-gold-dark border border-lux-gold/20">FAQ</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-lux-navy heading-underline">Frequently Asked Earnings Questions</h2>
          </FadeIn>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <FadeInScale key={i} delay={i * 100}>
                <Card className="border-0 shadow-md card-lift">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lux-gold-pale flex-shrink-0 mt-0.5">
                        <HelpCircle className="h-4 w-4 text-lux-gold-dark" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-lux-navy mb-2">{faq.q}</h3>
                        <p className="text-lux-text leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInScale>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - HARD SELL */}
      <section className="py-20 bg-lux-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lux-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-lux-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lux-gold/5 rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeIn>
            <Badge className="mb-6 px-4 py-2 bg-lux-gold text-white border-0 font-bold animate-pulse">KES 200 Bonus Ends Soon — 5,000+ Already In</Badge>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">Your First <span className="text-lux-gold">KES 600</span> Is 3 Shares Away</h2>
            <p className="mt-6 text-lg sm:text-xl text-white max-w-2xl mx-auto font-semibold">
              Pay <span className="text-lux-gold">KES 500</span> → Get <span className="bg-lux-gold text-lux-navy px-2 py-1 rounded-full text-sm">KES 200 bonus</span> + <span className="text-lux-gold">KES 200</span> per referral. 3 people = KES 600. 10 = KES 2,000 first month.
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="mt-10">
              <Link href="/register">
                <Button size="lg" className="bg-lux-cta hover:bg-lux-cta-hover text-white font-heading font-bold text-lg px-10 h-16 rounded-full shadow-2xl shadow-lux-gold/30 transition-all hover:shadow-lux-gold/40 hover:scale-105 group relative overflow-hidden glow-cta btn-shine">
                  <span className="relative z-10">Join Now - KES 500</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 relative z-10" />
                  <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
