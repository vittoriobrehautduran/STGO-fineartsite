import { WebpayPlus, Options, Environment } from 'transbank-sdk';

// Transbank configuration
// Use explicit environment variable to control which environment to use
// Set TRANSBANK_ENV=integration for testing, or leave unset for production
const isExplicitIntegration = process.env.TRANSBANK_ENV === 'integration';
const isExplicitProduction = process.env.TRANSBANK_ENV === 'production';

// Test credentials (default integration key)
const DEFAULT_TEST_API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
const DEFAULT_TEST_COMMERCE_CODE = '597055555532';

const isTestCredentials = !process.env.TRANSBANK_API_KEY || 
                          process.env.TRANSBANK_API_KEY === DEFAULT_TEST_API_KEY;

// Use Integration if explicitly set, or if using test credentials, or if not in production
const useIntegration = isExplicitIntegration || 
                       (!isExplicitProduction && (isTestCredentials || process.env.NODE_ENV !== 'production'));

// Get values with fallbacks only for development/integration
// In production, these should be set via environment variables
// IMPORTANT: For integration testing, use the test commerce code (597055555532) 
// which supports all payment methods (credit, debit, prepago)
// Production commerce code: 597053027170
export const TRANSBANK_COMMERCE_CODE = process.env.NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE || 
  (process.env.NODE_ENV === 'production' ? undefined : DEFAULT_TEST_COMMERCE_CODE);

export const TRANSBANK_API_KEY = process.env.TRANSBANK_API_KEY || 
  (process.env.NODE_ENV === 'production' ? undefined : DEFAULT_TEST_API_KEY);

export const TRANSBANK_BASE_URL = process.env.TRANSBANK_BASE_URL || 'https://webpay3gint.transbank.cl';
export const TRANSBANK_ENVIRONMENT = useIntegration 
  ? Environment.Integration 
  : Environment.Production;

// Initialize Transbank Webpay Plus
export function getTransbankClient() {
  // Validate required configuration
  if (!TRANSBANK_COMMERCE_CODE || !TRANSBANK_API_KEY) {
    throw new Error('Transbank configuration is missing. Please set NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE and TRANSBANK_API_KEY environment variables.');
  }

  // Log configuration without exposing full API key
  const apiKeyPrefix = TRANSBANK_API_KEY ? TRANSBANK_API_KEY.substring(0, 10) + '...' : 'not set';
  const isTestCommerceCode = TRANSBANK_COMMERCE_CODE === DEFAULT_TEST_COMMERCE_CODE;
  
  console.log('Transbank Configuration:', {
    commerceCode: TRANSBANK_COMMERCE_CODE,
    apiKeySet: !!TRANSBANK_API_KEY,
    apiKeyPrefix,
    environment: TRANSBANK_ENVIRONMENT === Environment.Integration ? 'Integration' : 'Production',
    useIntegration,
    nodeEnv: process.env.NODE_ENV,
    isTestCommerceCode,
  });
  
  // Warn if using actual commerce code in integration - it might not support all payment methods
  if (useIntegration && !isTestCommerceCode) {
    console.warn('⚠️  Using actual commerce code in integration environment.');
    console.warn('⚠️  For testing all payment methods (credit, debit, prepago), use the test commerce code:', DEFAULT_TEST_COMMERCE_CODE);
    console.warn('⚠️  Your commerce code might be configured only for credit cards. Contact Transbank to enable debit and prepago.');
  }
  
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
  // Use the actual production domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stgofineart.com';
  
  return {
    returnUrl: `${baseUrl}/checkout/success?order_id=${orderId}`,
    finalUrl: `${baseUrl}/checkout/success?order_id=${orderId}`,
  };
}

