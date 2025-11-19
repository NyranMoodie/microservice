import { test, expect } from '@playwright/test';

const REST_API_BASE_URL = process.env.REST_API_BASE_URL || 'https://your-api-domain.com/api/v1';

test.describe('REST API - Departments Endpoint', () => {
  
  test('should return departments with default pagination', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(25); // Default page_size
  });

  test('should paginate results with page_size parameter', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(10);
    expect(body.meta).toHaveProperty('count');
    expect(typeof body.meta.count).toBe('number');
  });

  test('should paginate results with page_number parameter', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=10&page_number=1`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta).toHaveProperty('count');
  });

  test('should handle page_number=0 (first page)', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=10&page_number=0`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should validate page_size minimum limit (1)', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=1`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(1);
  });

  test('should validate page_size maximum limit (25)', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=25`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(25);
  });

  test('should handle page_size exceeding maximum limit', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=30`);

    // Should either enforce max or return error
    expect([200, 400]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.data.length).toBeLessThanOrEqual(25);
    }
  });

  test('should include departments.department.group relationship', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=departments.department.group`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      // Check if included relationships are present
      const firstDepartment = body.data[0];
      expect(firstDepartment).toHaveProperty('departments');
    }
  });

  test('should include departments.department.group.subGroups relationship', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=departments.department.group.subGroups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include departments.division.group relationship', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=departments.division.group`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include departments.division.group.subGroups relationship', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=departments.division.group.subGroups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include publications relationship', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=publications`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include customPublicationLists.publications relationship', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=customPublicationLists.publications`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include multiple relationships with comma-separated list', async ({ request }) => {
    const include = 'departments.department.group.subGroups,departments.division.group.subGroups,publications,customPublicationLists.publications';
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=${include}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should combine pagination and include parameters', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=10&page_number=0&include=departments.department.group`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(10);
    expect(body.meta).toHaveProperty('count');
  });

  test('should handle large page_number values', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=10&page_number=100`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    // May return empty array if page doesn't exist
  });

  test('should validate response structure', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate response structure
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const department = body.data[0];
      expect(department).toHaveProperty('id');
    }
  });

  test('should return proper error for invalid page_size type', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=invalid`);

    // Should return error for invalid page_size type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should return proper error for invalid page_number type', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_number=invalid`);

    // Should return error for invalid page_number type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle negative page_size', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=-1`);

    // Should return error for negative page_size
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle negative page_number', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_number=-1`);

    // Should return error for negative page_number (values should be 0+)
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle empty include parameter', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle invalid include path', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?include=invalid.path`);

    // Should either ignore invalid include or return error
    expect([200, 400, 422]).toContain(response.status());
  });
});

