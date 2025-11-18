import { WebpayPlus, Options, Environment } from 'transbank-sdk';

// Transbank configuration
// Use explicit environment variable to control which environment to use
// Set TRANSBANK_ENV=integration for testing, or leave unset for production
const isExplicitIntegration = process.env.TRANSBANK_ENV === 'integration';
const isExplicitProduction = process.env.TRANSBANK_ENV === 'production';
const isTestCredentials = !process.env.TRANSBANK_API_KEY || 
                          process.env.TRANSBANK_API_KEY === '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

// Use Integration if explicitly set, or if using test credentials, or if not in production
const useIntegration = isExplicitIntegration || 
                       (!isExplicitProduction && (isTestCredentials || process.env.NODE_ENV !== 'production'));

export const TRANSBANK_COMMERCE_CODE = process.env.NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE || '597055555532';
export const TRANSBANK_API_KEY = process.env.TRANSBANK_API_KEY || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
export const TRANSBANK_BASE_URL = process.env.TRANSBANK_BASE_URL || 'https://webpay3gint.transbank.cl';
export const TRANSBANK_ENVIRONMENT = useIntegration 
  ? Environment.Integration 
  : Environment.Production;

// Initialize Transbank Webpay Plus
export function getTransbankClient() {
  console.log('Transbank Configuration:', {
    commerceCode: TRANSBANK_COMMERCE_CODE,
    apiKeySet: !!TRANSBANK_API_KEY,
    apiKeyLength: TRANSBANK_API_KEY?.length || 0,
    apiKeyPrefix: TRANSBANK_API_KEY?.substring(0, 10) + '...',
    environment: TRANSBANK_ENVIRONMENT === Environment.Integration ? 'Integration' : 'Production',
    useIntegration,
    isExplicitIntegration,
    isExplicitProduction,
    isTestCredentials,
    nodeEnv: process.env.NODE_ENV,
    transbankEnv: process.env.TRANSBANK_ENV,
  });
  
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

