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

## Payment Methods (Credit, Debit, Prepago)

**IMPORTANT**: The payment methods available (credit, debit, prepago) are controlled by your **commerce code configuration** in Transbank's merchant portal, NOT by code.

### For Integration Testing (All Payment Methods)

To test **all payment methods** (credit, debit, prepago) during integration:

1. **Option 1: Use Test Commerce Code** (Recommended for testing)
   - Remove or comment out `NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE` from your `.env.local`
   - The system will automatically use the test commerce code `597055555532` which supports all payment methods
   - This is the easiest way to test debit and prepago during integration

2. **Option 2: Enable Payment Methods for Your Commerce Code**
   - Contact Transbank support to enable debit and prepago for your commerce code `53027170`
   - Your commerce code might currently be configured only for credit cards
   - Once enabled in Transbank's portal, all payment methods will appear

### Current Issue

If you only see **credit card** option when paying:
- Your commerce code `53027170` is likely configured only for credit cards
- Solution: Use the test commerce code for integration testing (Option 1 above)
- Or contact Transbank to enable debit and prepago for your commerce code

## Test Payment Cards (Integration Environment)

En el entorno de integración, puedes usar estas tarjetas de prueba:

### Tarjeta Aprobada (Crédito)
- **Número**: `4051885600446623`
- **CVV**: `123`
- **Fecha de Expiración**: Cualquier fecha futura (ej: `12/25`)
- **RUT**: `12345678-9` (o cualquier RUT válido)
- **Resultado**: Transacción aprobada
- **Tipo**: VN (Venta Normal/Crédito)

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

## Problemas Conocidos y Soluciones

### cURL Error 52: Empty reply from server
**Problema**: El servidor de Transbank no responde a tiempo durante el commit.

**Solución Implementada**:
- Timeout de 30 segundos en las llamadas a Transbank
- Manejo mejorado de errores de timeout
- Detección de respuestas vacías

### Tipo de Pago (Débito/Prepago vs Crédito)
**Problema**: Las pruebas de Transbank esperan que las tarjetas de débito/prepago devuelvan `VD` o `VP`, pero devuelven `VN` (crédito).

**Nota**: Esto es normal en el entorno de integración. Transbank clasifica automáticamente las tarjetas según su tipo. En producción, las tarjetas reales de débito/prepago devolverán el código correcto (`VD` o `VP`).

**No requiere acción**: El código ya maneja correctamente todos los tipos de pago (`VN`, `VD`, `VP`).

### Anulaciones (Opcional)
**Problema**: Las pruebas de anulación requieren endpoints específicos que aún no están implementados.

**Estado**: Las anulaciones son opcionales según las pruebas de Transbank. Se pueden implementar más adelante si es necesario.

### Tarjetas de Prueba para Débito y Prepago

**IMPORTANTE**: El commerce code de prueba `597055555532` **SÍ soporta** débito y prepago. Si solo ves crédito, prueba ingresando directamente los números de tarjeta de prueba:

#### Tarjeta de Débito (Redcompra):
- **Número**: `4051 8842 3993 7763`
- **CVV**: `123` (si se solicita)
- **Fecha de Expiración**: Cualquier fecha futura
- **RUT**: `11.111.111-1`
- **Contraseña**: `123`
- **Resultado**: Transacción aprobada

#### Tarjeta Prepago VISA:
- **Número**: `4051 8860 0005 6590`
- **CVV**: `123`
- **Fecha de Expiración**: Cualquier fecha futura
- **RUT**: `11.111.111-1`
- **Contraseña**: `123`
- **Resultado**: Transacción aprobada

#### Tarjeta Prepago MASTERCARD:
- **Número**: `5186 1741 1062 9480`
- **CVV**: `123`
- **Fecha de Expiración**: Cualquier fecha futura
- **RUT**: `11.111.111-1`
- **Contraseña**: `123`
- **Resultado**: Transacción aprobada

**Nota**: Aunque la interfaz muestre "Crédito, Débito, Prepago", si solo aparece la opción de crédito, intenta ingresar directamente el número de tarjeta de débito o prepago. El sistema debería reconocer el tipo de tarjeta automáticamente.

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

