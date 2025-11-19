/**
 * API Configuration
 * Set these via environment variables or update defaults
 */
export const API_CONFIG = {
  REST_API_BASE_URL: process.env.REST_API_BASE_URL || 'https://your-api-domain.com/api/v1',
  JSON_API_BASE_URL: process.env.JSON_API_BASE_URL || 'https://your-api-domain.com/jsonapi/index',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),
};

/**
 * Common test data and constants
 */
export const TEST_DATA = {
  PROVIDER_IDS: {
    VALID: 1467437764,
    INVALID: 'invalid',
  },
  EINSTEIN_IDS: {
    VALID: 10675,
  },
  ORGANIZATIONS: ['CHA', 'MMC', 'MMV', 'RSC', 'TXR', 'ORTHO', 'ORTHO-LDR', 'MNR', 'CANCER', 'NSDR'],
  PROFESSIONAL_TITLES: ['DMD', 'DDS', 'MBBS', 'MD', 'PhD', 'PsyD', 'DPM', 'DO', 'CO', 'CRNA', 'OD', 'PA', 'RPA-C', 'NP'],
  GENDERS: ['male', 'female'],
  LANGUAGES: {
    VALID_IDS: [4886],
  },
  SPECIALTIES: {
    VALID_IDS: [3951],
  },
  CLINICAL_TERMS: {
    VALID_IDS: [21466, 21481],
  },
  GEOCODING: {
    VALID: {
      lon: -73.84861,
      lat: 40.83504,
      radius: 20,
    },
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 25,
    MAX_PAGE_SIZE: 25, // REST API
    JSON_API_MAX_PAGE_SIZE: 50,
    MIN_PAGE_SIZE: 1,
  },
  SORT_OPTIONS: {
    REST_API: [
      'search-api-relevance',
      'first-name-az-asc',
      'first-name-az-desc',
      'last-name-az-desc',
      'az-desc',
      'last-name-az-asc',
      'az-asc',
    ],
  },
};

/**
 * Helper function to build REST API query string
 */
export function buildRestApiQuery(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  return queryParams.toString();
}

/**
 * Helper function to build JSON:API query string
 */
export function buildJsonApiQuery(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  return queryParams.toString();
}

/**
 * Validate REST API response structure
 * Note: Use with expect from @playwright/test in your test files
 */
export function validateRestApiResponse(body: any, expect: any): void {
  expect(body).toHaveProperty('data');
  expect(body).toHaveProperty('meta');
  expect(Array.isArray(body.data)).toBe(true);
}

/**
 * Validate JSON:API response structure
 * Note: Use with expect from @playwright/test in your test files
 */
export function validateJsonApiResponse(body: any, expect: any): void {
  expect(body).toHaveProperty('data');
  expect(body).toHaveProperty('links');
  expect(Array.isArray(body.data)).toBe(true);
  
  if (body.data.length > 0) {
    const profile = body.data[0];
    expect(profile).toHaveProperty('type');
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('attributes');
  }
}

/**
 * Wait helper for API requests
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

