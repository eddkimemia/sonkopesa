import type { Metadata } from "next"
import FeaturesPageContent from "./features-content"

export const metadata: Metadata = {
  title: "Why Choose SonkoPesa - Features",
  description:
    "Discover why thousands of Kenyans choose SonkoPesa for referral income. Instant M-Pesa payments, no products to sell, and 24/7 support.",
}

export default function FeaturesPage() {
  return <FeaturesPageContent />
}
