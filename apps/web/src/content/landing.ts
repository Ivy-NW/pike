export type PricingPack = {
  name: string;
  priceKes: number;
  visits: number;
  pricePerVisit: number;
};

export type LandingContent = {
  freeVisits: number;
  eventPriceKes: number;
  packs: readonly PricingPack[];
  whatsApp: { href: string | null; label: string };
};

const configuredWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
const message = "Hello PIKE, I would like a free marker for my venue.";

export const landingContent: LandingContent = {
  freeVisits: 100,
  eventPriceKes: 20_000,
  packs: [
    { name: "Starter", priceKes: 2_000, visits: 200, pricePerVisit: 10 },
    { name: "Growth", priceKes: 7_000, visits: 1_000, pricePerVisit: 7 },
    { name: "Scale", priceKes: 25_000, visits: 5_000, pricePerVisit: 5 },
    { name: "Network", priceKes: 80_000, visits: 20_000, pricePerVisit: 4 },
  ],
  whatsApp: {
    href: configuredWhatsApp ? `https://wa.me/${configuredWhatsApp}?text=${encodeURIComponent(message)}` : null,
    label: configuredWhatsApp ? "Chat on WhatsApp" : "WhatsApp contact coming soon",
  },
};

export const faqs = [
  {
    question: "Does my staff have to learn new software?",
    answer: "No. Their one customer-facing task is checking and honouring the reward shown on the customer’s phone.",
  },
  {
    question: "Does it work on affordable Android phones?",
    answer: "The browser flow is designed for current Android Chrome. Testing across more affordable devices is ongoing, so we’ll confirm your setup before launch.",
  },
  {
    question: "Can people share or fake the scan?",
    answer: "The camera must recognise your venue’s specific marker before a completion is recorded. Server-enforced daily caps provide a separate limit on redemptions.",
  },
  {
    question: "I already have a loyalty card. Why add this?",
    answer: "A loyalty card serves people already buying. PIKE is designed to verify responses to a specific venue promotion, including first-time visits.",
  },
  {
    question: "What customer data do you collect?",
    answer: "A phone number or social sign-in is requested when a reward is claimed. The scan flow does not require continuous location tracking. Read the privacy policy for more detail.",
  },
] as const;
