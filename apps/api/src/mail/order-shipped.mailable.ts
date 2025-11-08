import { Mailable, Attachment } from '@nesvel/nestjs-mail';

/**
 * OrderShippedMailable
 *
 * Example Mailable class for order shipped notifications.
 * Demonstrates the Laravel-inspired Mailable pattern.
 *
 * @example
 * ```typescript
 * // Send immediately
 * await mailService
 *   .to(order.customer.email)
 *   .send(new OrderShippedMailable(order));
 *
 * // Queue for async processing
 * await mailService
 *   .to(order.customer.email)
 *   .queue(new OrderShippedMailable(order));
 *
 * // Schedule for later (1 hour delay)
 * await mailService
 *   .to(order.customer.email)
 *   .later(3600, new OrderShippedMailable(order));
 * ```
 */
export class OrderShippedMailable extends Mailable {
  /**
   * Create a new OrderShippedMailable instance
   *
   * @param order - Order data
   */
  constructor(private readonly order: any) {
    super();
  }

  /**
   * Build the email
   */
  public build(): this {
    return this.subject(`Order ${this.order.orderId} Shipped!`)
      .template('order-confirmation') // Using existing template
      .with({
        orderId: this.order.orderId,
        customerName: this.order.customerName,
        customerEmail: this.order.customerEmail,
        orderDate: this.order.orderDate,
        items: this.order.items,
        subtotal: this.order.subtotal,
        tax: this.order.tax,
        shipping: this.order.shipping,
        totalAmount: this.order.totalAmount,
        currency: this.order.currency,
        shippingAddress: this.order.shippingAddress,
        trackingUrl: this.order.trackingUrl,
        companyName: this.order.companyName,
        companyLogo: this.order.companyLogo,
        supportEmail: this.order.supportEmail,
      })
      .attach(
        Attachment.fromData(
          `Order Confirmation\n\nOrder ID: ${this.order.orderId}\nCustomer: ${this.order.customerName}\nTotal: $${this.order.totalAmount}\n\nThank you for your order!`,
          `Order-${this.order.orderId}.txt`
        ).withMime('text/plain')
      )
      .priority(2) // High priority
      .tag('order-shipped')
      .metadata('order_id', this.order.orderId);
  }
}
