import type { Metadata } from "next"
import ContactPageContent from "./contact-content"

export const metadata: Metadata = {
  title: "Contact Us - SonkoPesa",
  description:
    "Get in touch with SonkoPesa. We're here to help via WhatsApp, email, or phone.",
}

export default function ContactPage() {
  return <ContactPageContent />
}
