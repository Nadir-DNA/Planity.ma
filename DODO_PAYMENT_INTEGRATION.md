# Dodo Payment Integration for Planity.ma

## Overview
This integration adds Dodo Payment as a payment gateway alternative to CMI/Stripe for Planity.ma, the Moroccan beauty salon booking platform.

## Features
- ✅ Online payments via Dodo Payment checkout
- ✅ Cash payments (in-salon)
- ✅ Check payments
- ✅ Refunds
- ✅ Webhook handling
- ✅ Success/cancel pages

## Setup

### 1. Environment Variables
Add to `.env`:
```env
DODO_PAYMENT_API_KEY="your_api_key_here"
```

### 2. Webhook Configuration
Configure webhook URL in Dodo Dashboard:
```
https://your-domain.com/api/webhooks/dodo
```

### 3. Usage

#### Frontend Component
```tsx
import { DodoPaymentButton } from "@/components/payments/dodo-payment-button";

<DodoPaymentButton
  bookingId="booking_123"
  amount={150}
  onSuccess={(paymentId) => console.log("Success:", paymentId)}
  onError={(error) => console.error("Error:", error)}
/>
```

#### Backend API
```ts
import { initPayment } from "@/server/services/payment.service";

const result = await initPayment({
  bookingId: "booking_123",
  amount: 150,
  method: "CARD",
  tip: 10,
});

if (result.success) {
  // Redirect to result.redirectUrl
}
```

## API Endpoints

### Initiate Payment
```
POST /api/payments/dodo/initiate
Body: { bookingId: string, amount: number, method?: string, tip?: number }
```

### Webhook Handler
```
POST /api/webhooks/dodo
```

## Files Structure
```
src/
├── server/services/
│   ├── payment.service.ts          # Unified payment service
│   └── dodo-payment.service.ts     # Dodo Payment specific logic
├── app/
│   ├── api/
│   │   ├── payments/dodo/initiate/route.ts  # Payment initiation
│   │   └── webhooks/dodo/route.ts           # Webhook handler
│   └── paiement/
│       ├── succes/page.tsx                   # Success page
│       └── annule/page.tsx                   # Cancelled page
└── components/payments/
    └── dodo-payment-button.tsx               # React component
```

## Testing
1. Use Dodo's test mode with test API keys
2. Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)
3. Webhook testing via Dodo Dashboard

## Security
- ✅ API keys stored in environment variables
- ✅ Webhook signature verification (to be implemented)
- ✅ Payment amount validation
- ✅ User authentication required

## Migration from CMI
The integration maintains backward compatibility:
- `initCmiPayment()` → redirects to Dodo
- `processCashPayment()` → uses Dodo cash handler
- `processCheckPayment()` → uses Dodo check handler
- `processRefund()` → uses Dodo refund API

## Documentation
- Dodo Payment Docs: https://docs.dodopayments.com
- API Reference: https://docs.dodopayments.com/api-reference
- Webhooks: https://docs.dodopayments.com/developer-resources/webhooks
