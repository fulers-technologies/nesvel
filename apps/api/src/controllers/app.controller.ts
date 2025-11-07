import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18n, I18nContext } from '@nesvel/nestjs-i18n';
import { InjectRepository } from '@mikro-orm/nestjs';
import { PubSubService } from '@nesvel/nestjs-pubsub';

import { TestUser } from '@/entities/test-user.entity';
import { TestUserRepository } from '@/repositories/test-user.repository';
import { OrderPublisher } from '@/publishers/order.publisher';
import { PaymentConsumer } from '@/consumers/payment.consumer';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    @InjectRepository(TestUser)
    private readonly testUserRepository: TestUserRepository,
    private readonly pubSubService: PubSubService,
    private readonly orderPublisher: OrderPublisher,
    private readonly paymentConsumer: PaymentConsumer
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Returns a welcome message in the requested language',
    schema: {
      type: 'string',
      example: 'Welcome to Nesvel API',
    },
  })
  async getHello(@I18n() i18n: I18nContext): Promise<string> {
    return i18n.t('common.welcome');
  }

  @Get('hello/:name')
  @ApiOperation({ summary: 'Get personalized greeting' })
  @ApiResponse({
    status: 200,
    description: 'Returns a personalized greeting in the requested language',
    schema: {
      type: 'string',
      example: 'Hello, John!',
    },
  })
  async getGreeting(@I18n() i18n: I18nContext, @Param('name') name: string): Promise<string> {
    return i18n.t('common.hello', { args: { name } });
  }

  @Post('test/order')
  @ApiOperation({ summary: 'Test OrderPublisher and OrderListener' })
  @ApiResponse({
    status: 200,
    description: 'Order event published successfully',
  })
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
  @ApiOperation({ summary: 'Test OrderPublisher update event' })
  @ApiResponse({
    status: 200,
    description: 'Order update event published successfully',
  })
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
  @ApiOperation({ summary: 'Test OrderPublisher cancellation event' })
  @ApiResponse({
    status: 200,
    description: 'Order cancellation event published successfully',
  })
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
  @ApiOperation({ summary: 'Test OrderPublisher error event' })
  @ApiResponse({
    status: 200,
    description: 'Order error event published successfully',
  })
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
  @ApiOperation({ summary: 'Test PaymentConsumer' })
  @ApiResponse({
    status: 200,
    description: 'Payment event published successfully',
  })
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
  @ApiOperation({ summary: 'Get PaymentConsumer statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns PaymentConsumer statistics',
  })
  getPaymentStats(): any {
    return this.paymentConsumer.getStats();
  }
}
