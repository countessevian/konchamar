# Bitcoin Payment System Guide

## Overview

The Konchamar Resort website uses a simple Bitcoin payment system that displays your wallet address and a QR code to customers. This eliminates the need for third-party services like Coinbase Commerce.

## How It Works

### For Customers

1. Customer selects "Bitcoin" as payment method
2. System displays:
   - Your Bitcoin wallet address
   - QR code for easy mobile scanning
   - Approximate BTC amount to send
   - USD amount
   - Contact information
3. Customer sends BTC to your wallet
4. Customer contacts you with their transaction ID
5. You verify and confirm the payment

### For You (Admin)

1. Wait for customer to send BTC
2. Check your Bitcoin wallet for incoming transaction
3. Verify the amount matches the reservation
4. Confirm the payment using the admin API

## Environment Variables Required

```bash
# Your Bitcoin receiving address
BTC_WALLET_ADDRESS=bc1q...your...wallet...address

# Admin API key for confirming payments (generate with node generate-keys.js)
ADMIN_API_KEY=your_generated_admin_key
```

## Confirming Bitcoin Payments

When a customer notifies you of payment, use this API call to confirm:

### Using cURL:

```bash
curl -X POST https://your-app.onrender.com/api/payment/confirm-bitcoin \
  -H "Content-Type: application/json" \
  -d '{
    "reservationId": "abc123",
    "transactionId": "btc_tx_id_from_customer",
    "adminKey": "your_admin_api_key"
  }'
```

### Using Postman:

**Method:** POST
**URL:** `https://your-app.onrender.com/api/payment/confirm-bitcoin`
**Headers:**
- Content-Type: application/json

**Body (raw JSON):**
```json
{
  "reservationId": "abc123",
  "transactionId": "btc_tx_id_from_customer",
  "adminKey": "your_admin_api_key"
}
```

### Success Response:

```json
{
  "success": true,
  "message": "Bitcoin payment confirmed",
  "reservationId": "abc123"
}
```

## What Happens After Confirmation

1. Reservation status updated to "completed"
2. Confirmation email sent to customer automatically
3. Reservation synced to backup database (if configured)

## Customer Communication Template

When a customer contacts you about BTC payment, verify:

```
Thank you for your Bitcoin payment!

To confirm your reservation, please provide:
1. Reservation ID: [from their email]
2. Bitcoin Transaction ID: [they should provide this]
3. Amount sent: [in BTC]

We'll verify the transaction and send your confirmation within 15 minutes.
```

## Security Notes

- **ADMIN_API_KEY** is required to confirm payments - keep it secret!
- Only you can confirm Bitcoin payments (customers cannot)
- Transaction IDs are stored for record-keeping
- All payments are logged in the database

## Advantages of This System

✅ No third-party API dependencies
✅ No monthly fees or transaction fees (besides Bitcoin network fees)
✅ Direct payments to your wallet
✅ Simple and reliable
✅ Full control over confirmations

## Disadvantages

⚠️ Manual confirmation required
⚠️ No automatic BTC/USD conversion (uses rough estimate)
⚠️ Customer must contact you after payment

## Improving the System (Future)

To make it automatic, you could:

1. Use a blockchain explorer API to monitor your address
2. Set up a webhook to check for incoming transactions
3. Auto-confirm when transaction has 3+ confirmations

For now, the manual system is simple, secure, and works well for a boutique resort with moderate booking volume.

## Testing

To test Bitcoin payments without real BTC:

1. Use a testnet Bitcoin wallet address in development
2. Customer flow will show QR code and address
3. Test the confirmation endpoint with dummy transaction IDs
4. Verify emails are sent correctly

## Support

If you have issues:

1. Check that `BTC_WALLET_ADDRESS` is set correctly
2. Verify `ADMIN_API_KEY` matches what you're using
3. Check application logs for errors
4. Ensure customer has correct reservation ID

---

**Remember:** Always verify the Bitcoin transaction in your actual wallet before confirming the reservation!
