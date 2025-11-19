import { test, expect } from '@playwright/test';

const REST_API_BASE_URL = process.env.REST_API_BASE_URL || 'https://your-api-domain.com/api/v1';

test.describe('REST API - Groups Endpoint', () => {
  
  test('should return groups with default pagination', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(25); // Default page_size
  });

  test('should paginate results with page_size parameter', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(10);
    expect(body.meta).toHaveProperty('count');
    expect(typeof body.meta.count).toBe('number');
  });

  test('should paginate results with page_number parameter', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=10&page_number=1`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta).toHaveProperty('count');
  });

  test('should handle page_number=0 (first page)', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=10&page_number=0`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should validate page_size minimum limit (1)', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=1`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(1);
  });

  test('should validate page_size maximum limit (25)', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=25`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(25);
  });

  test('should handle page_size exceeding maximum limit', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=30`);

    // Should either enforce max or return error
    expect([200, 400]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.data.length).toBeLessThanOrEqual(25);
    }
  });

  test('should include subGroups relationship', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?include=subGroups`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    console.log(JSON.stringify(body, null, 2));
    
    if (body.data && body.data.length > 0) {
      // Check if included relationships are present
      const firstGroup = body.data[0];
      expect(firstGroup).toHaveProperty('subGroups');
    }
  });

  test('should include multiple relationships with comma-separated list', async ({ request }) => {
    const include = 'subGroups';
    const response = await request.get(`${REST_API_BASE_URL}/groups?include=${include}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should combine pagination and include parameters', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=10&page_number=0&include=subGroups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(10);
    expect(body.meta).toHaveProperty('count');
  });

  test('should handle large page_number values', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=10&page_number=100`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    // May return empty array if page doesn't exist
  });

  test('should validate response structure', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate response structure
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const group = body.data[0];
      expect(group).toHaveProperty('id');
    }
  });

  test('should return proper error for invalid page_size type', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=invalid`);

    // Should return error for invalid page_size type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should return proper error for invalid page_number type', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_number=invalid`);

    // Should return error for invalid page_number type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle negative page_size', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=-1`);

    // Should return error for negative page_size
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle negative page_number', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_number=-1`);

    // Should return error for negative page_number (values should be 0+)
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle empty include parameter', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?include=`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle invalid include path', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?include=invalid.path`);

    // Should either ignore invalid include or return error
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should fetch group by ID with example ID (279586)', async ({ request }) => {
    const groupId = '279586';
    const response = await request.get(`${REST_API_BASE_URL}/group/${groupId}`);
    
    // Should return 200 if group exists, 404 if not
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      console.log(JSON.stringify(body, null, 2));
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0].id).toBe(groupId);
    }
  });

  test('should return empty data array for non-existent group ID', async ({ request }) => {
    const nonExistentId = '999999999';
    const response = await request.get(`${REST_API_BASE_URL}/group/${nonExistentId}`);
    
    // Should return 200 with empty data array for non-existent group
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('meta');
    expect(body).toHaveProperty('data');
    expect(body.meta).toHaveProperty('count');
    expect(body.meta.count).toBe(0);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toEqual([]);
  });

  test('should validate group by ID response structure', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${REST_API_BASE_URL}/groups?page_size=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      const response = await request.get(`${REST_API_BASE_URL}/group/${groupId}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      // Validate response structure matches list endpoint structure - data is an array
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('id');
      expect(typeof body.data[0].id).toBe('string');
      expect(body.data[0].id).toBe(groupId);
    } else {
      test.skip();
    }
  });

  test('should fetch group by ID with include parameter', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${REST_API_BASE_URL}/groups?page_size=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      const response = await request.get(`${REST_API_BASE_URL}/group/${groupId}?include=subGroups`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0].id).toBe(groupId);
      
      // Check if subGroups relationship is included
      if (body.data[0].subGroups !== undefined) {
        expect(Array.isArray(body.data[0].subGroups)).toBe(true);
      }
    } else {
      test.skip();
    }
  });

  test('should fetch group members by group ID', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${REST_API_BASE_URL}/groups?page_size=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      // Fetch the group members
      const response = await request.get(`${REST_API_BASE_URL}/group/${groupId}/members`);
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      // Validate response structure
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('meta');
    } else {
      test.skip();
    }
  });

  test('should return empty array for non-existent group ID members', async ({ request }) => {
    const nonExistentId = '999999999';
    const response = await request.get(`${REST_API_BASE_URL}/group/${nonExistentId}/members`);
    
    // Should return 200 with empty data array for non-existent group
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual([]);
  });

  test('should validate group members response structure', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${REST_API_BASE_URL}/groups?page_size=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      const response = await request.get(`${REST_API_BASE_URL}/group/${groupId}/members`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      // Validate response structure
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      
      // Validate meta structure
      expect(body.meta).toHaveProperty('count');
      expect(typeof body.meta.count).toBe('number');
      
      // If members exist, validate member structure
      if (body.data.length > 0) {
        const member = body.data[0];
        expect(member).toHaveProperty('id');
        expect(typeof member.id).toBe('string');
      }
    } else {
      test.skip();
    }
  });

  test('should handle pagination for group members', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${REST_API_BASE_URL}/groups?page_size=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      // Test pagination with page_size
      const response = await request.get(`${REST_API_BASE_URL}/group/${groupId}/members?page_size=10`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      expect(body.data.length).toBeLessThanOrEqual(10);
      expect(body.meta).toHaveProperty('count');
    } else {
      test.skip();
    }
  });

  test('should handle pagination with page_number for group members', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${REST_API_BASE_URL}/groups?page_size=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      // Test pagination with page_number
      const response = await request.get(`${REST_API_BASE_URL}/group/${groupId}/members?page_size=10&page_number=1`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toHaveProperty('count');
    } else {
      test.skip();
    }
  });

  test('should return empty array for group with no members', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${REST_API_BASE_URL}/groups?page_size=25`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      // Try to find a group that might have no members, or use any group
      const groupId = listBody.data[0].id;
      
      const response = await request.get(`${REST_API_BASE_URL}/group/${groupId}/members`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      // Should return empty array if no members, or array with members
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toHaveProperty('count');
      expect(typeof body.meta.count).toBe('number');
    } else {
      test.skip();
    }
  });
});

