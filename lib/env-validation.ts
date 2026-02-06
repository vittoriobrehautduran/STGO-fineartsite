// Validate critical environment variables
// This helps catch configuration issues early

export function validateEnvironmentVariables() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical variables (app won't work without these)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  // Transbank variables
  if (!process.env.NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE) {
    warnings.push('NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE is not set, using default test value');
  }

  if (!process.env.TRANSBANK_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('TRANSBANK_API_KEY is required in production');
    } else {
      warnings.push('TRANSBANK_API_KEY is not set, using default test value');
    }
  }

  // Site URL
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    warnings.push('NEXT_PUBLIC_SITE_URL is not set, using default value');
  }

  // AWS SES (optional but recommended)
  if (!process.env.SES_ACCESS_KEY_ID || !process.env.SES_SECRET_ACCESS_KEY) {
    warnings.push('AWS SES is not configured - contact form emails will not work');
  }

  // Log warnings in development
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('Environment variable warnings:', warnings);
  }

  // Throw errors for critical missing variables
  if (errors.length > 0) {
    const errorMessage = `Missing required environment variables:\n${errors.join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return { errors, warnings };
}

// Validate on module load (only in server-side code)
if (typeof window === 'undefined') {
  try {
    validateEnvironmentVariables();
  } catch (error) {
    // In development, log but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.error('Environment validation error:', error);
    } else {
      // In production, re-throw to prevent app from starting with bad config
      throw error;
    }
  }
}

