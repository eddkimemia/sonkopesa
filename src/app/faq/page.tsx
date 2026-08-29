import type { Metadata } from "next"
import FaqPageContent from "./faq-content"

export const metadata: Metadata = {
  title: "FAQ - SonkoPesa",
  description:
    "Frequently asked questions about SonkoPesa referral platform. Learn about costs, earnings, payments, and more.",
}

export default function FaqPage() {
  return <FaqPageContent />
}
