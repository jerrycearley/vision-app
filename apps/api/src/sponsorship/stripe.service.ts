import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    mode: 'subscription' | 'payment';
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    return this.stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: params.mode,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async createPrice(params: {
    unitAmount: number;
    currency: string;
    productName: string;
    recurring?: { interval: 'month' | 'year' };
  }): Promise<Stripe.Price> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    // Create product first
    const product = await this.stripe.products.create({
      name: params.productName,
    });

    return this.stripe.prices.create({
      unit_amount: Math.round(params.unitAmount * 100),
      currency: params.currency,
      product: product.id,
      recurring: params.recurring,
    });
  }

  async constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async refund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }
}
