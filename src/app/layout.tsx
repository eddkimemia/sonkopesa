import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { NavWrapper } from "@/components/landing/nav-wrapper";
import { SiteFooter } from "@/components/landing/footer-section";
import { CookieBanner } from "@/components/landing/cookie-banner";
import { SocialProofToast } from "@/components/landing/social-proof";
import { BackToTop } from "@/components/landing/back-to-top";
import { DashboardWrapper } from "@/components/landing/dashboard-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sonkopesa.co.ke"),
  title: {
    default: "SonkoPesa - Refer. Earn. Grow. | Premium Referral Platform",
    template: "%s | SonkoPesa",
  },
  description:
    "A premium referral-based income platform where members earn KES 200 commissions by bringing others into the opportunity. Join for KES 500 one-time. Get KES 200 bonus instantly.",
  keywords: [
    "SonkoPesa", "referral income", "Kenya", "M-Pesa",
    "earn money online", "referral commission", "KES", "passive income",
  ],
  authors: [{ name: "SonkoPesa" }],
  icons: { icon: "/images/logo.svg" },
  openGraph: {
    title: "SonkoPesa - Turn Your Network Into Monthly Income",
    description: "Invest KES 500 once → Get KES 200 bonus instantly + Earn KES 200 per referral for life. 40% payout. 5,000+ Kenyans earning. Join now.",
    url: "https://sonkopesa.co.ke",
    siteName: "SonkoPesa",
    type: "website",
    locale: "en_KE",
    images: [
      {
        url: "/images/heror.jpg",
        width: 1200,
        height: 630,
        alt: "SonkoPesa - Premium Referral Platform - Earn KES 200 Per Referral + KES 200 bonus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SonkoPesa - Turn Your Network Into Monthly Income",
    description: "Invest KES 500 → Get KES 200 bonus + Earn KES 200 per referral for life. 5,000+ earning. Instant Paystack & M-Pesa.",
    images: ["/images/heror.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex min-h-screen flex-col`}
      >
        <NavWrapper />
        <DashboardWrapper>
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster />
          <SocialProofToast />
          <CookieBanner />
          <BackToTop />
        </DashboardWrapper>
      </body>
    </html>
  );
}
