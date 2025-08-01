interface JwtPayload {
  exp?: number;
  [key: string]: any;
}

interface TokenExpirationData {
  expires_at: string;
  expires_in: number;
}

/**
 * Decodes a JWT token and returns its payload
 * @param token The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export const decodeJwt = (
  token: string | null | undefined,
): JwtPayload | null => {
  try {
    // Validate token exists and is a string
    if (!token || typeof token !== 'string') {
      console.warn('Invalid token: Token is missing or not a string');
      return null;
    }

    // Trim and validate token structure
    const trimmedToken = token.trim();
    if (trimmedToken.split('.').length !== 3) {
      console.warn('Invalid JWT format: Token must have 3 parts');
      return null;
    }

    const base64Url = trimmedToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Handle potential atob errors for malformed base64
    const decoded = atob(base64);
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.warn('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Gets the expiration time of a JWT token
 * @param token The JWT token to check
 * @returns Expiration time in milliseconds or null if invalid/not found
 */
export const getTokenExpiration = (
  token: string | null | undefined,
): number | null => {
  const decoded = decodeJwt(token);

  // Validate expiration exists and is a number
  if (!decoded?.exp || typeof decoded.exp !== 'number') {
    console.warn('Token expiration not found or invalid');
    return null;
  }

  // JWT exp is in seconds, convert to milliseconds
  return decoded.exp * 1000;
};

/**
 * NEW: Check if token is expired using backend response data
 * This is preferred over JWT payload parsing as it uses server-provided expiration
 */
export const isTokenExpiredByBackendData = (
  tokenExpiration: TokenExpirationData | null,
): boolean => {
  if (!tokenExpiration?.expires_at) {
    console.warn('Token expiration data not available');
    return true;
  }

  try {
    const expirationTime = new Date(tokenExpiration.expires_at).getTime();
    const currentTime = Date.now();

    // Add 30 second buffer to account for clock skew and network delays
    const bufferTime = 30 * 1000;

    return expirationTime <= currentTime + bufferTime;
  } catch (error) {
    console.warn('Error parsing expiration date:', error);
    return true;
  }
};

/**
 * Checks if a JWT token is expired (fallback method)
 * @param token The JWT token to check
 * @returns true if expired or invalid, false if valid and not expired
 */
export const isTokenExpired = (token: string | null | undefined): boolean => {
  const expiration = getTokenExpiration(token);

  // Consider invalid/missing expiration as expired
  if (!expiration) return true;

  // Add 10 second buffer to account for clock skew
  return expiration <= Date.now() - 10000;
};

/**
 * NEW: Combined token validation using both backend data and JWT fallback
 * @param token The JWT token
 * @param tokenExpiration Backend expiration data
 * @returns true if expired or invalid
 */
export const isTokenExpiredCombined = (
  token: string | null | undefined,
  tokenExpiration: TokenExpirationData | null,
): boolean => {
  // If we have backend expiration data, use it (preferred)
  if (tokenExpiration) {
    return isTokenExpiredByBackendData(tokenExpiration);
  }

  // Fallback to JWT token expiration parsing
  return isTokenExpired(token);
};

/**
 * Additional utility to check if token exists and is valid
 */
export const isValidToken = (
  token: string | null | undefined,
  tokenExpiration?: TokenExpirationData | null,
): boolean => {
  if (!token) return false;

  return !isTokenExpiredCombined(token, tokenExpiration || null);
};
