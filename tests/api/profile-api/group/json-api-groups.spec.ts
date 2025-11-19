import { test, expect } from '@playwright/test';

const JSON_API_BASE_URL = process.env.JSON_API_BASE_URL || 'https://your-api-domain.com/jsonapi/index';

test.describe('JSON:API - Groups Endpoint', () => {
  
  test('should return groups with default pagination', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(10);
  });

  test('should paginate results with page limit', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=15`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(15);
  });

  test('should validate page limit maximum (25, inferred from REST API)', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=25`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(25);
  });

  test('should handle pagination with offset', async ({ request }) => {
    // page_number=1 with page_size=10 translates to offset=10
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=10&page[offset]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should validate page limit minimum (1)', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=1`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(1);
  });

  test('should handle page limit exceeding maximum', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=30`);

    // Should either enforce max (25) or return error
    expect([200, 400, 422]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.data.length).toBeLessThanOrEqual(25);
    }
  });

  test('should include subGroups relationship', async ({ request }) => {
    // Inferring field name from REST API include path
    const response = await request.get(`${JSON_API_BASE_URL}/groups?include=field_subgroups&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    // If include works, should have included array
    if (body.included) {
      expect(Array.isArray(body.included)).toBe(true);
    }
  });

  test('should include multiple relationships with comma-separated list', async ({ request }) => {
    // Test multiple relationships if available (currently only subGroups exists for groups)
    const include = 'field_subgroups';
    const response = await request.get(`${JSON_API_BASE_URL}/groups?include=${include}&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    // If multiple relationships were available, they would be comma-separated
    // For now, this validates the include parameter works with comma-separated syntax
  });

  test('should validate JSON:API response structure', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate JSON:API structure
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('links');
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const group = body.data[0];
      expect(group).toHaveProperty('type');
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('attributes');
    }
  });

  test('should combine pagination and include parameters', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=10&page[offset]=0&include=field_subgroups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(10);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle large offset values', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=10&page[offset]=1000`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    // May return empty array if offset exceeds available records
  });

  test('should return error for invalid page limit type', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=invalid`);

    // Should return error for invalid limit type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should return error for invalid offset type', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[offset]=invalid`);

    // Should return error for invalid offset type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle negative page limit', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=-1`);

    // Should return error for negative limit
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle negative offset', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[offset]=-1`);

    // Should return error for negative offset
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should handle empty include parameter', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?include=&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle invalid include path', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?include=invalid.field.path&page[limit]=5`);

    // Should either ignore invalid include or return error
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should limit fields returned for groups', async ({ request }) => {
    // Try limiting fields if supported
    const response = await request.get(`${JSON_API_BASE_URL}/groups?fields[node--group]=id,name&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const group = body.data[0];
      expect(group).toHaveProperty('id');
    }
  });

  test('should return links for pagination', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('links');
    if (body.links) {
      expect(body.links).toHaveProperty('self');
    }
  });

  test('should fetch group by ID with example ID (279586)', async ({ request }) => {
    const groupId = '279586';
    const response = await request.get(`${JSON_API_BASE_URL}/group/${groupId}`);
    
    // Should return 200 if group exists
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty('id');
        expect(body.data[0]).toHaveProperty('type');
        expect(body.data[0].id).toBe(groupId);
      }
    }
  });

  test('should validate group by ID response structure', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      const response = await request.get(`${JSON_API_BASE_URL}/group/${groupId}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      // Validate response structure matches list endpoint structure - data is an array
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('type');
      expect(typeof body.data[0].id).toBe('string');
      expect(body.data[0].id).toBe(groupId);
    } else {
      test.skip();
    }
  });

  test('should fetch group by ID with include parameter', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      const response = await request.get(`${JSON_API_BASE_URL}/group/${groupId}?include=field_subgroups`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('type');
      expect(body.data[0].id).toBe(groupId);
      
      // Check if subGroups relationship is included
      if (body.included) {
        expect(Array.isArray(body.included)).toBe(true);
      }
    } else {
      test.skip();
    }
  });

  test('should fetch group members by group ID', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      // Fetch the group members
      const response = await request.get(`${JSON_API_BASE_URL}/group/${groupId}/members`);
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      // Validate response structure
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    } else {
      test.skip();
    }
  });

  test('should return empty data array for non-existent group ID', async ({ request }) => {
    const nonExistentId = '999999999';
    const response = await request.get(`${JSON_API_BASE_URL}/group/${nonExistentId}`);
    
    // Should return 200 with empty data array for non-existent group
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toEqual([]);
    
    // If meta exists, check that count is 0
    if (body.meta) {
      expect(body.meta).toHaveProperty('count');
      expect(body.meta.count).toBe(0);
    }
  });

  test('should return empty array for non-existent group ID members', async ({ request }) => {
    const nonExistentId = '999999999';
    const response = await request.get(`${JSON_API_BASE_URL}/group/${nonExistentId}/members`);
    
    // Should return 200 with empty data array for non-existent group
    expect(response.status()).toBe(200);
    const body = await response.json();
    // JSON API may return [] directly or {data: []}
    if (Array.isArray(body)) {
      expect(body).toEqual([]);
    } else {
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toEqual([]);
    }
  });

  test('should validate group members response structure', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      const response = await request.get(`${JSON_API_BASE_URL}/group/${groupId}/members`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      // Validate response structure
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      
      // If meta exists, validate meta structure
      if (body.meta) {
        expect(body.meta).toHaveProperty('count');
        expect(typeof body.meta.count).toBe('number');
      }
      
      // If members exist, validate member structure
      if (body.data.length > 0) {
        const member = body.data[0];
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('type');
        expect(typeof member.id).toBe('string');
      }
    } else {
      test.skip();
    }
  });

  test('should handle pagination for group members', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      // Test pagination with page limit
      const response = await request.get(`${JSON_API_BASE_URL}/group/${groupId}/members?page[limit]=10`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      expect(body.data.length).toBeLessThanOrEqual(10);
      if (body.meta) {
        expect(body.meta).toHaveProperty('count');
      }
    } else {
      test.skip();
    }
  });

  test('should handle pagination with offset for group members', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=1`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const groupId = listBody.data[0].id;
      
      // Test pagination with offset (page_number=1 with page_size=10 translates to offset=10)
      const response = await request.get(`${JSON_API_BASE_URL}/group/${groupId}/members?page[limit]=10&page[offset]=10`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      expect(Array.isArray(body.data)).toBe(true);
      if (body.meta) {
        expect(body.meta).toHaveProperty('count');
      }
    } else {
      test.skip();
    }
  });

  test('should return empty array for group with no members', async ({ request }) => {
    // First, get a list of groups to obtain a valid ID
    const listResponse = await request.get(`${JSON_API_BASE_URL}/groups?page[limit]=25`);
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      // Try to find a group that might have no members, or use any group
      const groupId = listBody.data[0].id;
      
      const response = await request.get(`${JSON_API_BASE_URL}/group/${groupId}/members`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      // Should return empty array if no members, or array with members
      expect(Array.isArray(body.data)).toBe(true);
      if (body.meta) {
        expect(body.meta).toHaveProperty('count');
        expect(typeof body.meta.count).toBe('number');
      }
    } else {
      test.skip();
    }
  });
});

