import { test, expect } from '@playwright/test';

const REST_API_BASE_URL = process.env.REST_API_BASE_URL || 'https://your-api-domain.com/api/v1';

test.describe('REST API - Sub-Groups Endpoint', () => {
  
  test('should fetch sub-group by ID with example ID (41717921)', async ({ request }) => {
    const subGroupId = '41717921';
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${subGroupId}`);
    
    // Should return 200 if sub-group exists, 404 if not
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      console.log(JSON.stringify(body, null, 2));
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      console.log(JSON.stringify(body.data, null, 2));
    //   expect(body.data.length).toBeGreaterThan(0);
    //   expect(body.data[0]).toHaveProperty('id');
    //   expect(body.data[0].id).toBe(subGroupId);
    }
  });

  test('should fetch sub-group members by sub-group ID', async ({ request }) => {
    const subGroupId = '41717921';
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${subGroupId}/members`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate response structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body).toHaveProperty('meta');
  });

  test('should return empty data array for non-existent sub-group ID', async ({ request }) => {
    const nonExistentId = '999999999';
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${nonExistentId}`);
    
    // Should return 200 with empty data array for non-existent sub-group
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('meta');
    expect(body).toHaveProperty('data');
    expect(body.meta).toHaveProperty('count');
    expect(body.meta.count).toBe(0);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toEqual([]);
  });

  test('should validate sub-group by ID response structure', async ({ request }) => {
    // First, try to get a valid sub-group ID from groups endpoint
    const groupsResponse = await request.get(`${REST_API_BASE_URL}/groups?page_size=25&include=subGroups`);
    expect(groupsResponse.status()).toBe(200);
    const groupsBody = await groupsResponse.json();
    
    let subGroupId: string | null = null;
    
    // Try to find a sub-group ID from the groups response
    if (groupsBody.data && groupsBody.data.length > 0) {
      for (const group of groupsBody.data) {
        if (group.subGroups && Array.isArray(group.subGroups) && group.subGroups.length > 0) {
          subGroupId = group.subGroups[0].id;
          break;
        }
      }
    }
    
    // If no sub-group found in groups, use the example ID
    if (!subGroupId) {
      subGroupId = '41717921';
    }
    
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${subGroupId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate response structure matches list endpoint structure - data is an array
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('id');
    expect(typeof body.data[0].id).toBe('string');
    expect(body.data[0].id).toBe(subGroupId);
  });

  test('should handle invalid sub-group ID format', async ({ request }) => {
    const invalidId = 'invalid-id';
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${invalidId}`);
    
    // Should return error for invalid ID format
    expect([200, 400, 404, 422]).toContain(response.status());
  });

  test('should handle empty sub-group ID', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/`);
    
    // Should return error for empty ID
    expect([400, 404, 405]).toContain(response.status());
  });

  test('should validate sub-group response contains required fields', async ({ request }) => {
    const subGroupId = '41717921';
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${subGroupId}`);
    
    if (response.status() === 200) {
      const body = await response.json();
      
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      
      if (body.data.length > 0) {
        const subGroup = body.data[0];
        expect(subGroup).toHaveProperty('id');
        expect(typeof subGroup.id).toBe('string');
      }
    }
  });

  test('should handle sub-group ID with special characters', async ({ request }) => {
    const specialId = '41717921<script>';
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${encodeURIComponent(specialId)}`);
    
    // Should handle special characters appropriately
    expect([200, 400, 404, 422]).toContain(response.status());
  });

  test('should handle very long sub-group ID', async ({ request }) => {
    const longId = '1'.repeat(100);
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${longId}`);
    
    // Should handle very long IDs appropriately
    expect([200, 400, 404, 422]).toContain(response.status());
  });

  test('should return consistent response format for valid sub-group ID', async ({ request }) => {
    const subGroupId = '41717921';
    const response = await request.get(`${REST_API_BASE_URL}/sub-group/${subGroupId}`);
    
    if (response.status() === 200) {
      const body = await response.json();
      
      // Validate consistent structure
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.meta).toBe('object');
      
      if (body.data.length > 0) {
        expect(body.meta.count).toBeGreaterThan(0);
      }
    }
  });


});

