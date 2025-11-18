import { WebpayPlus, Options, Environment } from 'transbank-sdk';

// Transbank configuration
export const TRANSBANK_COMMERCE_CODE = process.env.NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE || '597055555532';
export const TRANSBANK_API_KEY = process.env.TRANSBANK_API_KEY || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
export const TRANSBANK_BASE_URL = process.env.TRANSBANK_BASE_URL || 'https://webpay3gint.transbank.cl';
export const TRANSBANK_ENVIRONMENT = process.env.NODE_ENV === 'production' 
  ? Environment.Production 
  : Environment.Integration;

// Initialize Transbank Webpay Plus
export function getTransbankClient() {
  const options = new Options(
    TRANSBANK_COMMERCE_CODE,
    TRANSBANK_API_KEY,
    TRANSBANK_ENVIRONMENT
  );
  
  // The SDK automatically uses the correct base URL based on Environment
  // Integration: https://webpay3gint.transbank.cl
  // Production: https://webpay3g.transbank.cl
  
  return new WebpayPlus.Transaction(options);
}

// Generate return URLs
export function getReturnUrls(orderId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stgofineart.netlify.app';
  
  return {
    returnUrl: `${baseUrl}/checkout/success?order_id=${orderId}`,
    finalUrl: `${baseUrl}/checkout/success?order_id=${orderId}`,
  };
}

