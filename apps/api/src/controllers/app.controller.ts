import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { I18n, I18nContext } from '@nesvel/nestjs-i18n';
import { InjectRepository } from '@mikro-orm/nestjs';
import { PubSubService } from '@nesvel/nestjs-pubsub';
import { InjectMailService, MailService } from '@nesvel/nestjs-mail';

import { TestUser } from '@/entities/test-user.entity';
import { TestUserRepository } from '@/repositories/test-user.repository';
import { OrderPublisher } from '@/publishers/order.publisher';
import { PaymentConsumer } from '@/consumers/payment.consumer';

/**
 * App Controller
 *
 * Main application controller with test endpoints for various features.
 *
 * **Features**:
 * - i18n translation testing
 * - Order event publishing (PubSub)
 * - Payment event processing
 * - Email sending (order confirmation)
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Controller()
export class AppController {
  constructor(
    @InjectRepository(TestUser)
    private readonly testUserRepository: TestUserRepository,
    private readonly pubSubService: PubSubService,
    private readonly orderPublisher: OrderPublisher,
    private readonly paymentConsumer: PaymentConsumer,
    @InjectMailService()
    private readonly mailService: MailService
  ) {}

  @Get()
  async getHello(@I18n() i18n: I18nContext): Promise<string> {
    return i18n.t('common.welcome');
  }

  @Get('hello/:name')
  async getGreeting(@I18n() i18n: I18nContext, @Param('name') name: string): Promise<string> {
    return i18n.t('common.hello', { args: { name } });
  }

  @Post('test/order')
  async testOrderPublisher(
    @Body() data?: { orderId?: string; userId?: string; totalAmount?: number }
  ): Promise<{ message: string; data: any }> {
    const orderData = {
      orderId: data?.orderId || `ORDER-${Date.now()}`,
      userId: data?.userId || 'user-123',
      items: [
        { productId: 'prod-1', quantity: 2, price: 29.99 },
        { productId: 'prod-2', quantity: 1, price: 49.99 },
      ],
      totalAmount: data?.totalAmount || 109.97,
      status: 'pending',
    };

    await this.orderPublisher.publish(orderData);

    return {
      message: 'Order created and published successfully',
      data: orderData,
    };
  }

  @Post('test/order/update')
  async testOrderUpdate(
    @Body() data: { orderId: string; status: string }
  ): Promise<{ message: string; data: any }> {
    await this.orderPublisher.publishUpdate(data.orderId, data.status);

    return {
      message: 'Order update published successfully',
      data,
    };
  }

  @Post('test/order/cancel')
  async testOrderCancel(
    @Body() data: { orderId: string; reason: string }
  ): Promise<{ message: string; data: any }> {
    await this.orderPublisher.publishCancellation(data.orderId, data.reason);

    return {
      message: 'Order cancellation published successfully',
      data,
    };
  }

  @Post('test/order/error')
  async testOrderError(
    @Body() data: { orderId: string; error: string }
  ): Promise<{ message: string; data: any }> {
    await this.orderPublisher.publishError(data.orderId, data.error);

    return {
      message: 'Order error published successfully',
      data,
    };
  }

  @Post('test/payment')
  async testPaymentConsumer(
    @Body() data?: { paymentId?: string; orderId?: string; amount?: number }
  ): Promise<{ message: string; data: any }> {
    const paymentData = {
      paymentId: data?.paymentId || `PAY-${Date.now()}`,
      orderId: data?.orderId || `ORDER-${Date.now()}`,
      amount: data?.amount || 109.97,
      currency: 'USD',
      status: 'success',
      method: 'credit_card',
    };

    await this.pubSubService.publish('payment.processed', paymentData);

    return {
      message: 'Payment event published successfully',
      data: paymentData,
    };
  }

  @Get('test/payment/stats')
  getPaymentStats(): any {
    return this.paymentConsumer.getStats();
  }

  /**
   * Send Order Confirmation Email
   *
   * Test endpoint for sending order confirmation emails.
   * Demonstrates React email templates with schema markup.
   *
   * **Features**:
   * - React email template rendering
   * - Schema.org structured data
   * - Order details with itemized list
   * - Shipping address display
   * - Professional email design
   *
   * @param data - Order data for email
   * @returns Success message with sent email details
   *
   * @example
   * ```typescript
   * POST /test/email/order
   * {
   *   "customerEmail": "customer@example.com",
   *   "customerName": "John Doe",
   *   "orderId": "ORDER-12345"
   * }
   * ```
   */
  @Post('test/email/order')
  async sendOrderConfirmationEmail(
    @Body()
    data?: {
      customerEmail?: string;
      customerName?: string;
      orderId?: string;
    }
  ): Promise<{ message: string; orderId: string; recipient: string }> {
    // Generate order data
    const orderData = {
      orderId: data?.orderId || `ORDER-${Date.now()}`,
      customerName: data?.customerName || 'John Doe',
      customerEmail: data?.customerEmail || 'customer@example.com',
      orderDate: new Date(),
      items: [
        {
          productId: 'prod-001',
          name: 'Premium Wireless Headphones',
          description: 'High-quality noise-cancelling wireless headphones',
          quantity: 1,
          price: 299.99,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
          url: 'https://example.com/products/headphones',
        },
        {
          productId: 'prod-002',
          name: 'USB-C Charging Cable',
          description: 'Fast charging USB-C cable, 6ft length',
          quantity: 2,
          price: 19.99,
          image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200',
          url: 'https://example.com/products/cable',
        },
        {
          productId: 'prod-003',
          name: 'Laptop Sleeve',
          description: 'Protective laptop sleeve for 15" laptops',
          quantity: 1,
          price: 49.99,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
          url: 'https://example.com/products/sleeve',
        },
      ],
      subtotal: 389.96,
      tax: 35.1,
      shipping: 9.99,
      totalAmount: 435.05,
      currency: 'USD',
      shippingAddress: {
        street: '123 Main Street, Apt 4B',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'United States',
      },
      trackingUrl: `https://example.com/track/${data?.orderId || `ORDER-${Date.now()}`}`,
      companyName: 'Nesvel',
      companyLogo: 'https://via.placeholder.com/150x50/4F46E5/FFFFFF?text=NESVEL',
      supportEmail: 'support@nesvel.com',
    };

    // Send email using the mail service with attachments
    await this.mailService.sendMail({
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.orderId}`,
      template: 'order-confirmation',
      context: orderData,
      attachments: [
        {
          filename: `Order-${orderData.orderId}.txt`,
          content: `Order Confirmation\n\nOrder ID: ${orderData.orderId}\nCustomer: ${orderData.customerName}\nTotal: $${orderData.totalAmount}\n\nThank you for your order!`,
          contentType: 'text/plain',
        },
      ],
    });

    return {
      message: 'Order confirmation email sent successfully',
      orderId: orderData.orderId,
      recipient: orderData.customerEmail,
    };
  }
}
