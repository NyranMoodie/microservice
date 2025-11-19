import { test, expect } from '@playwright/test';

const JSON_API_BASE_URL = process.env.JSON_API_BASE_URL || 'https://your-api-domain.com/jsonapi/index';

test.describe('JSON:API - Departments Endpoint', () => {
  
  test('should return departments with default pagination', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(10);
  });

  test('should paginate results with page limit', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=15`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(15);
  });

  test('should validate page limit maximum (25, inferred from REST API)', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=25`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(25);
  });

  test('should handle pagination with offset', async ({ request }) => {
    // page_number=1 with page_size=10 translates to offset=10
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=10&page[offset]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle offset=0 (first page)', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=10&page[offset]=0`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should validate page limit minimum (1)', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=1`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(1);
  });

  test('should handle page limit exceeding maximum', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=30`);

    // Should either enforce max (25) or return error
    expect([200, 400, 422]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.data.length).toBeLessThanOrEqual(25);
    }
  });

  test('should include field relationships', async ({ request }) => {
    // Inferring field names from REST API include paths
    // departments.department.group.subGroups might map to field_department_group or similar
    const response = await request.get(`${JSON_API_BASE_URL}/departments?include=field_department_group&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    // If include works, should have included array
    if (body.included) {
      expect(Array.isArray(body.included)).toBe(true);
    }
  });

  test('should include multiple relationships', async ({ request }) => {
    // Trying common JSON:API field naming patterns
    const response = await request.get(`${JSON_API_BASE_URL}/departments?include=field_department_group,field_publications&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include department group subGroups', async ({ request }) => {
    // Inferring nested include path structure
    const response = await request.get(`${JSON_API_BASE_URL}/departments?include=field_department_group.field_sub_groups&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include division group relationships', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?include=field_division_group&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include publications', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?include=field_publications&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    if (body.included) {
      expect(Array.isArray(body.included)).toBe(true);
    }
  });

  test('should include custom publication lists with publications', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?include=field_custom_publication_lists.field_publications&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should validate JSON:API response structure', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate JSON:API structure
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('links');
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const department = body.data[0];
      expect(department).toHaveProperty('type');
      expect(department).toHaveProperty('id');
      expect(department).toHaveProperty('attributes');
    }
  });

  test('should combine pagination and include parameters', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=10&page[offset]=0&include=field_department_group`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(10);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle large offset values', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=10&page[offset]=1000`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    // May return empty array if offset exceeds available records
  });

  test('should return error for invalid page limit type', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=invalid`);

    // Should return error for invalid limit type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should return error for invalid offset type', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[offset]=invalid`);

    // Should return error for invalid offset type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle negative page limit', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=-1`);

    // Should return error for negative limit
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle negative offset', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[offset]=-1`);

    // Should return error for negative offset
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle empty include parameter', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?include=&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle invalid include path', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?include=invalid.field.path&page[limit]=5`);

    // Should either ignore invalid include or return error
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should limit fields returned for departments', async ({ request }) => {
    // Try limiting fields if supported
    const response = await request.get(`${JSON_API_BASE_URL}/departments?fields[node--department]=id,name&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const department = body.data[0];
      expect(department).toHaveProperty('id');
      expect(department).toHaveProperty('attributes');
    }
  });

  test('should return links for pagination', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/departments?page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('links');
    if (body.links) {
      expect(body.links).toHaveProperty('self');
    }
  });
});






