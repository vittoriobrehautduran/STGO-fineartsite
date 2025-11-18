# Transbank Integration Setup

## Current Configuration

- **Commerce Code**: `53027170` (configured)
- **API Key**: Pending (will be added when received)

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE=53027170
TRANSBANK_API_KEY=your_secret_key_here
NEXT_PUBLIC_SITE_URL=https://stgofineart.netlify.app
```

## When You Receive the Secret Key

1. Add `TRANSBANK_API_KEY` to `.env.local` with your secret key
2. Add `TRANSBANK_API_KEY` to Netlify environment variables (Site Settings → Environment Variables)
3. The integration will automatically use production environment when `NODE_ENV=production`

## Testing

- **Integration Environment**: Used automatically in development
- **Production Environment**: Used automatically when deployed to production

## Test Payment Cards (Integration Environment)

En el entorno de integración, puedes usar estas tarjetas de prueba:

### Tarjeta Aprobada (Crédito)
- **Número**: `4051885600446623`
- **CVV**: `123`
- **Fecha de Expiración**: Cualquier fecha futura (ej: `12/25`)
- **RUT**: `12345678-9` (o cualquier RUT válido)
- **Resultado**: Transacción aprobada

### Tarjeta Rechazada (Crédito)
- **Número**: `4051885600446623` (mismo número, pero el sistema puede rechazarla según configuración)
- **CVV**: `123`
- **Fecha de Expiración**: Cualquier fecha futura
- **Resultado**: Transacción rechazada

### Nota Importante
- En la página de Transbank, selecciona la opción **"Tarjetas"** (que incluye Crédito, Débito y Prepago)
- Puedes usar tarjetas de **crédito de prueba** sin problema
- Las tarjetas de prueba funcionan tanto para crédito como débito en el entorno de integración
- **NO uses tarjetas reales** en el entorno de integración

## API Routes Created

1. `/api/transbank/create` - Creates a new Transbank transaction
2. `/api/transbank/commit` - Commits the transaction after payment

## Flow

1. User clicks "Pagar con Transbank" on checkout page
2. Frontend calls `/api/transbank/create` with order ID and amount
3. Backend creates transaction in Transbank and returns payment URL
4. User is redirected to Transbank payment page
5. After payment, Transbank redirects to `/checkout/success?order_id=XXX&token_ws=YYY`
6. Frontend calls `/api/transbank/commit` with token_ws
7. Backend commits transaction and updates order status
8. User sees success/failure message

## Database Fields Required

Make sure your `orders` table has these fields:
- `transbank_token` (text, nullable)
- `transbank_buy_order` (text, nullable)
- `transbank_session_id` (text, nullable)
- `transbank_response_code` (integer, nullable)
- `transbank_status` (text, nullable)
- `transbank_authorization_code` (text, nullable)
- `transbank_payment_date` (timestamp, nullable)
- `paid_at` (timestamp, nullable)
- `status` (text) - should support: 'pending', 'pending_payment', 'paid', 'payment_failed'

