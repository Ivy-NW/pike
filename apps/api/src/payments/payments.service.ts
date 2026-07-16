import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import type { Business } from "@prisma/client";

/**
 * Wraps Stripe Billing (PRD 9.7). A business can look around the dashboard and start a
 * quest before ever reaching this — it's only invoked when they attach a payment method,
 * either from account settings or inline from the quest-publish gate (PRD section 12).
 *
 * TODO(credentials): set STRIPE_SECRET_KEY to talk to real Stripe. Until then this
 * records the payment method id without calling out, so the payment_status gate still
 * works end-to-end in local/dev.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe | null;

  constructor(private readonly config: ConfigService) {
    const secretKey = config.get<string>("STRIPE_SECRET_KEY");
    this.stripe = secretKey ? new Stripe(secretKey) : null;
    if (!this.stripe) {
      this.logger.warn(
        "Stripe not configured (STRIPE_SECRET_KEY missing) — payment-method attach is a no-op stub.",
      );
    }
  }

  /** Returns the Stripe customer id so the caller can persist it on the business record. */
  async attachPaymentMethod(business: Business, stripePaymentMethodId: string): Promise<string | null> {
    if (!this.stripe) return business.stripeCustomerId;

    let customerId = business.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({ email: business.email, name: business.name });
      customerId = customer.id;
    }
    await this.stripe.paymentMethods.attach(stripePaymentMethodId, { customer: customerId });
    await this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: stripePaymentMethodId },
    });
    return customerId;
  }
}
