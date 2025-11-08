# Email Templates

This directory contains React email templates for the Nesvel API application.

## Available Templates

### Order Confirmation (`order-confirmation.tsx`)

Professional order confirmation email with Schema.org structured data markup.

**Features**:

- Order summary with itemized list
- JSON-LD structured data for email clients
- Shipping address display
- Order tracking link
- Responsive design with Tailwind CSS
- Mobile-friendly layout

## Testing the Email Endpoint

### Using cURL

```bash
# Send test email with defaults
curl -X POST http://localhost:3000/test/email/order \
  -H "Content-Type: application/json"

# Send email to specific address
curl -X POST http://localhost:3000/test/email/order \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "your-email@example.com",
    "customerName": "John Doe",
    "orderId": "ORDER-12345"
  }'
```

### Using HTTPie

```bash
# Send test email with defaults
http POST http://localhost:3000/test/email/order

# Send email to specific address
http POST http://localhost:3000/test/email/order \
  customerEmail=your-email@example.com \
  customerName="John Doe" \
  orderId=ORDER-12345
```

### Using Swagger UI

1. Start the API: `bun dev --filter=api`
2. Open <http://localhost:3000/api/docs>
3. Find the `POST /test/email/order` endpoint
4. Click "Try it out"
5. Modify the request body (optional)
6. Click "Execute"

### Example Request Body

```json
{
  "customerEmail": "customer@example.com",
  "customerName": "Jane Smith",
  "orderId": "ORDER-ABC123"
}
```

### Example Response

```json
{
  "message": "Order confirmation email sent successfully",
  "orderId": "ORDER-ABC123",
  "recipient": "customer@example.com"
}
```

## Email Preview in Development

The mail is configured to preview emails in development mode. When you send an
email:

1. The email HTML is rendered
2. A preview window opens in your default browser
3. You can see exactly how the email will look

This uses [Ethereal Email](https://ethereal.email/) for preview in development.

## Email Configuration

Email settings are configured in `src/config/mail.config.ts`:

- **Transport**: SMTP (default), SES, SendGrid, Mailgun, or Postmark
- **Template Directory**: `./templates/emails`
- **Preview**: Enabled in development
- **From Address**: Configurable via `MAIL_FROM` environment variable

## Environment Variables

```env
# Transport type (smtp, ses, sendgrid, mailgun, postmark)
MAIL_TRANSPORT=smtp

# SMTP Configuration
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=
MAIL_PASSWORD=

# Default sender
MAIL_FROM="Nesvel" <noreply@nesvel.com>

# Templates
MAIL_TEMPLATE_DIR=./templates/emails

# Preview in browser (development)
MAIL_PREVIEW=true
```

## Mailpit for Local Testing

For local development, use [Mailpit](https://github.com/axllent/mailpit) to
catch emails:

```bash
# Install Mailpit
brew install mailpit

# Run Mailpit
mailpit

# Access web UI
open http://localhost:8025
```

Update your `.env`:

```env
MAIL_HOST=localhost
MAIL_PORT=1025
```

## Schema Markup

The order confirmation email includes Schema.org structured data (JSON-LD) for:

- **Order** - Order details and status
- **OrderItem** - Individual products
- **Product** - Product information
- **PostalAddress** - Shipping address
- **Person** - Customer information

This helps email clients like Gmail display rich cards with order information.

## Creating New Templates

1. Create a new `.tsx` file in this directory
2. Use React Email components from `@react-email/components`
3. Use Tailwind CSS for styling
4. Add comprehensive TypeScript interfaces
5. Export the component as default
6. Update the index.ts file

Example:

```tsx
import * as React from 'react';

import { Html, Body, Container, Heading, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

export interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name }) => {
  return (
    <Html>
      <Tailwind>
        <Body className="bg-gray-100">
          <Container className="mx-auto my-8 max-w-2xl bg-white p-8">
            <Heading>Welcome, {name}!</Heading>
            <Text>Thanks for joining us.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
```

## Resources

- [React Email Documentation](https://react.email/docs)
- [React Email Components](https://react.email/docs/components/html)
- [Tailwind CSS for Email](https://react.email/docs/components/tailwind)
- [Schema.org Order](https://schema.org/Order)
- [Email Client CSS Support](https://www.caniemail.com/)
