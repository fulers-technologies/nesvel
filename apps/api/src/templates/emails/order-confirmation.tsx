import * as React from 'react';

import { Layout } from '@nesvel/nestjs-mail';
import {
  Head,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Button,
  Img,
} from '@react-email/components';

/**
 * Order Item Interface
 *
 * Represents a single item in an order.
 */
export interface OrderItem {
  /** Product ID */
  productId: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Quantity ordered */
  quantity: number;
  /** Price per unit */
  price: number;
  /** Product image URL */
  image?: string;
  /** Product URL */
  url?: string;
}

/**
 * Order Confirmation Email Props
 *
 * Properties for the order confirmation email template.
 */
export interface OrderConfirmationEmailProps {
  /** Order ID */
  orderId: string;
  /** Customer name */
  customerName: string;
  /** Customer email */
  customerEmail: string;
  /** Order date */
  orderDate: Date | string;
  /** Array of ordered items */
  items: OrderItem[];
  /** Subtotal amount */
  subtotal: number;
  /** Tax amount */
  tax?: number;
  /** Shipping cost */
  shipping?: number;
  /** Total amount */
  totalAmount: number;
  /** Currency code */
  currency?: string;
  /** Shipping address */
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  /** Order tracking URL */
  trackingUrl?: string;
  /** Company name */
  companyName?: string;
  /** Company logo URL */
  companyLogo?: string;
  /** Support email */
  supportEmail?: string;
}

/**
 * Generate JSON-LD Schema for Order
 *
 * Creates structured data markup for the order confirmation email.
 * This helps email clients display rich information about the order.
 *
 * @param props - Order confirmation email properties
 * @returns JSON-LD schema string
 */
const generateOrderSchema = (props: OrderConfirmationEmailProps): string => {
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'Order',
    orderNumber: props.orderId,
    orderDate:
      typeof props.orderDate === 'string' ? props.orderDate : props.orderDate.toISOString(),
    orderStatus: 'https://schema.org/OrderProcessing',
    customer: {
      '@type': 'Person',
      name: props.customerName,
      email: props.customerEmail,
    },
    orderedItem: props.items.map((item) => ({
      '@type': 'OrderItem',
      orderItemNumber: item.productId,
      orderQuantity: item.quantity,
      orderedItem: {
        '@type': 'Product',
        name: item.name,
        description: item.description,
        image: item.image,
        url: item.url,
      },
      price: item.price,
      priceCurrency: props.currency || 'USD',
    })),
    price: props.totalAmount,
    priceCurrency: props.currency || 'USD',
    ...(props.shippingAddress && {
      deliveryAddress: {
        '@type': 'PostalAddress',
        streetAddress: props.shippingAddress.street,
        addressLocality: props.shippingAddress.city,
        addressRegion: props.shippingAddress.state,
        postalCode: props.shippingAddress.postalCode,
        addressCountry: props.shippingAddress.country,
      },
    }),
  };

  return JSON.stringify(schema);
};

/**
 * Format Currency
 *
 * Formats a number as currency with the specified currency code.
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format Date
 *
 * Formats a date for display in the email.
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Order Confirmation Email Template
 *
 * Professional order confirmation email with structured data markup.
 *
 * **Features**:
 * - Order summary with itemized list
 * - Schema.org structured data
 * - Responsive design with Tailwind CSS
 * - Order tracking link
 * - Shipping address display
 * - Mobile-friendly layout
 *
 * @example
 * ```typescript
 * const emailHtml = await render(
 *   <OrderConfirmationEmail
 *     orderId="ORDER-12345"
 *     customerName="John Doe"
 *     customerEmail="john@example.com"
 *     orderDate={new Date()}
 *     items={[
 *       {
 *         productId: 'prod-1',
 *         name: 'Product Name',
 *         quantity: 2,
 *         price: 29.99,
 *       },
 *     ]}
 *     subtotal={59.98}
 *     tax={5.40}
 *     shipping={9.99}
 *     totalAmount={75.37}
 *   />
 * );
 * ```
 */
export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = (props) => {
  const {
    orderId,
    customerName,
    orderDate,
    items,
    subtotal,
    tax = 0,
    shipping = 0,
    totalAmount,
    currency = 'USD',
    shippingAddress,
    trackingUrl,
    companyName = 'Nesvel',
    companyLogo,
    supportEmail = 'support@nesvel.com',
  } = props;

  return (
    <Layout
      preview={`Order confirmation for ${orderId}`}
      bodyClassName="bg-gray-100 font-sans"
      containerClassName="mx-auto my-8 max-w-2xl rounded-lg bg-white shadow-lg"
    >
      <Head>
        {/* JSON-LD Schema for Order */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateOrderSchema(props),
          }}
        />
      </Head>
      {/* Header */}
      <Section className="bg-indigo-600 px-8 py-6 text-white">
        <Row>
          <Column>
            {companyLogo && <Img src={companyLogo} alt={companyName} className="mb-4 h-10" />}
            <Heading className="m-0 text-2xl font-bold">Order Confirmation</Heading>
            <Text className="m-0 mt-2 text-indigo-100">
              Thank you for your order, {customerName}!
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Order Details */}
      <Section className="px-8 py-6">
        <Text className="mb-4 text-gray-700">
          Your order has been confirmed and will be shipped soon.
        </Text>

        <Row className="mb-6">
          <Column className="w-1/2">
            <Text className="m-0 text-sm font-semibold text-gray-900">Order Number</Text>
            <Text className="m-0 mt-1 text-sm text-gray-600">{orderId}</Text>
          </Column>
          <Column className="w-1/2 text-right">
            <Text className="m-0 text-sm font-semibold text-gray-900">Order Date</Text>
            <Text className="m-0 mt-1 text-sm text-gray-600">{formatDate(orderDate)}</Text>
          </Column>
        </Row>

        <Hr className="my-6 border-gray-200" />

        {/* Order Items */}
        <Heading className="mb-4 text-lg font-semibold text-gray-900">Order Items</Heading>

        {items.map((item, index) => (
          <Row key={item.productId} className={index > 0 ? 'mt-4' : ''}>
            <Column className="w-20">
              {item.image && (
                <Img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded border border-gray-200 object-cover"
                />
              )}
            </Column>
            <Column className="px-4">
              <Text className="m-0 font-semibold text-gray-900">{item.name}</Text>
              {item.description && (
                <Text className="m-0 mt-1 text-sm text-gray-600">{item.description}</Text>
              )}
              <Text className="m-0 mt-1 text-sm text-gray-600">Quantity: {item.quantity}</Text>
            </Column>
            <Column className="text-right">
              <Text className="m-0 font-semibold text-gray-900">
                {formatCurrency(item.price * item.quantity, currency)}
              </Text>
              <Text className="m-0 mt-1 text-sm text-gray-600">
                {formatCurrency(item.price, currency)} each
              </Text>
            </Column>
          </Row>
        ))}

        <Hr className="my-6 border-gray-200" />

        {/* Order Summary */}
        <Row>
          <Column className="w-2/3"></Column>
          <Column className="w-1/3">
            <Row className="mb-2">
              <Column className="w-1/2">
                <Text className="m-0 text-sm text-gray-600">Subtotal:</Text>
              </Column>
              <Column className="w-1/2 text-right">
                <Text className="m-0 text-sm font-semibold text-gray-900">
                  {formatCurrency(subtotal, currency)}
                </Text>
              </Column>
            </Row>

            {shipping > 0 && (
              <Row className="mb-2">
                <Column className="w-1/2">
                  <Text className="m-0 text-sm text-gray-600">Shipping:</Text>
                </Column>
                <Column className="w-1/2 text-right">
                  <Text className="m-0 text-sm font-semibold text-gray-900">
                    {formatCurrency(shipping, currency)}
                  </Text>
                </Column>
              </Row>
            )}

            {tax > 0 && (
              <Row className="mb-2">
                <Column className="w-1/2">
                  <Text className="m-0 text-sm text-gray-600">Tax:</Text>
                </Column>
                <Column className="w-1/2 text-right">
                  <Text className="m-0 text-sm font-semibold text-gray-900">
                    {formatCurrency(tax, currency)}
                  </Text>
                </Column>
              </Row>
            )}

            <Hr className="my-2 border-gray-300" />

            <Row>
              <Column className="w-1/2">
                <Text className="m-0 text-base font-bold text-gray-900">Total:</Text>
              </Column>
              <Column className="w-1/2 text-right">
                <Text className="m-0 text-base font-bold text-indigo-600">
                  {formatCurrency(totalAmount, currency)}
                </Text>
              </Column>
            </Row>
          </Column>
        </Row>

        <Hr className="my-6 border-gray-200" />

        {/* Shipping Address */}
        {shippingAddress && (
          <>
            <Heading className="mb-3 text-lg font-semibold text-gray-900">Shipping Address</Heading>
            <Text className="m-0 text-sm text-gray-700">
              {shippingAddress.street}
              <br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              <br />
              {shippingAddress.country}
            </Text>
            <Hr className="my-6 border-gray-200" />
          </>
        )}

        {/* Track Order Button */}
        {trackingUrl && (
          <Section className="text-center">
            <Button
              href={trackingUrl}
              className="rounded-lg bg-indigo-600 px-6 py-3 text-center text-base font-semibold text-white hover:bg-indigo-700"
            >
              Track Your Order
            </Button>
          </Section>
        )}
      </Section>

      {/* Footer */}
      <Section className="bg-gray-50 px-8 py-6">
        <Text className="m-0 text-center text-sm text-gray-600">
          Questions about your order?{' '}
          <a href={`mailto:${supportEmail}`} className="text-indigo-600 hover:text-indigo-700">
            Contact Support
          </a>
        </Text>
        <Text className="m-0 mt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </Text>
      </Section>
    </Layout>
  );
};

export default OrderConfirmationEmail;
