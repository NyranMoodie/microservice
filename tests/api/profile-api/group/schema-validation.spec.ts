import { test, expect } from '@playwright/test';

const REST_API_BASE_URL = process.env.REST_API_BASE_URL || 'https://your-api-domain.com/api/v1';

/**
 * Schema validation for REST API Groups Response
 * This test validates the response structure to detect schema changes over time
 */
test.describe('REST API - Groups Schema Validation', () => {
  
  test('should validate groups response schema structure', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate top-level structure
    expect(body).toHaveProperty('meta');
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('pager');
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length === 0) {
      test.skip();
      return;
    }

    const group = body.data[0];

    // Validate meta structure
    expect(body.meta).toHaveProperty('count');
    expect(typeof body.meta.count).toBe('number');

    // Validate pager structure
    expect(body.pager).toHaveProperty('self');
    expect(body.pager).toHaveProperty('next');
    expect(body.pager).toHaveProperty('last');
    expect(typeof body.pager.self).toBe('string');
    expect(typeof body.pager.next).toBe('string');
    expect(typeof body.pager.last).toBe('string');

    // Validate group required fields
    expect(group).toHaveProperty('id');
    expect(group).toHaveProperty('groupId');
    expect(group).toHaveProperty('groupDescription');
    expect(group).toHaveProperty('subGroups');
    expect(typeof group.id).toBe('string');

    // Validate groupId structure
    expect(Array.isArray(group.groupId)).toBe(true);
    if (group.groupId.length > 0) {
      expect(group.groupId[0]).toHaveProperty('values');
      expect(Array.isArray(group.groupId[0].values)).toBe(true);
      if (group.groupId[0].values.length > 0) {
        expect(typeof group.groupId[0].values[0]).toBe('string');
      }
    }

    // Validate groupDescription structure (can be null or array)
    if (group.groupDescription !== null) {
      expect(Array.isArray(group.groupDescription)).toBe(true);
      if (group.groupDescription.length > 0) {
        expect(group.groupDescription[0]).toHaveProperty('values');
        expect(Array.isArray(group.groupDescription[0].values)).toBe(true);
        if (group.groupDescription[0].values.length > 0) {
          expect(typeof group.groupDescription[0].values[0]).toBe('string');
        }
      }
    }

    // Validate subGroups structure
    expect(Array.isArray(group.subGroups)).toBe(true);
    if (group.subGroups.length > 0) {
      const subGroup = group.subGroups[0];
      expect(subGroup).toHaveProperty('id');
      expect(typeof subGroup.id).toBe('string');
    }
  });

  test('should validate groups schema for all returned groups', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups?page_size=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);

    // Validate schema for each group in the response
    for (const group of body.data) {
      // Basic required fields
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('groupId');
      expect(group).toHaveProperty('groupDescription');
      expect(group).toHaveProperty('subGroups');
      expect(typeof group.id).toBe('string');

      // Validate groupId
      expect(Array.isArray(group.groupId)).toBe(true);
      if (group.groupId.length > 0) {
        expect(group.groupId[0]).toHaveProperty('values');
        expect(Array.isArray(group.groupId[0].values)).toBe(true);
      }

      // Validate groupDescription (can be null or array)
      if (group.groupDescription !== null) {
        expect(Array.isArray(group.groupDescription)).toBe(true);
        if (group.groupDescription.length > 0) {
          expect(group.groupDescription[0]).toHaveProperty('values');
          expect(Array.isArray(group.groupDescription[0].values)).toBe(true);
        }
      }

      // Validate subGroups
      expect(Array.isArray(group.subGroups)).toBe(true);
      for (const subGroup of group.subGroups) {
        expect(subGroup).toHaveProperty('id');
        expect(typeof subGroup.id).toBe('string');
      }
    }
  });

  test('should validate groups with subGroups relationship', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Find a group with subGroups populated
    const groupWithSubGroups = body.data.find((group: any) => 
      Array.isArray(group.subGroups) && 
      group.subGroups.length > 0
    );
    
    if (groupWithSubGroups) {
      expect(groupWithSubGroups.subGroups).toBeInstanceOf(Array);
      expect(groupWithSubGroups.subGroups.length).toBeGreaterThan(0);
      
      // Validate subGroup structure
      for (const subGroup of groupWithSubGroups.subGroups) {
        expect(subGroup).toHaveProperty('id');
        expect(typeof subGroup.id).toBe('string');
        expect(subGroup.id.length).toBeGreaterThan(0);
      }
    }
  });

  test('should validate groups with null groupDescription', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Find a group with null groupDescription
    const groupWithNullDescription = body.data.find((group: any) => 
      group.groupDescription === null
    );
    
    if (groupWithNullDescription) {
      // Should still have required fields
      expect(groupWithNullDescription).toHaveProperty('id');
      expect(groupWithNullDescription).toHaveProperty('groupId');
      expect(groupWithNullDescription).toHaveProperty('subGroups');
      
      // Null groupDescription should be explicitly null
      expect(groupWithNullDescription.groupDescription).toBeNull();
    }
  });

  test('should validate groups with populated groupDescription', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Find a group with populated groupDescription
    const groupWithDescription = body.data.find((group: any) => 
      group.groupDescription !== null && 
      Array.isArray(group.groupDescription) && 
      group.groupDescription.length > 0
    );
    
    if (groupWithDescription) {
      expect(Array.isArray(groupWithDescription.groupDescription)).toBe(true);
      expect(groupWithDescription.groupDescription.length).toBeGreaterThan(0);
      
      const descriptionItem = groupWithDescription.groupDescription[0];
      expect(descriptionItem).toHaveProperty('values');
      expect(Array.isArray(descriptionItem.values)).toBe(true);
      expect(descriptionItem.values.length).toBeGreaterThan(0);
      expect(typeof descriptionItem.values[0]).toBe('string');
    }
  });

  test('should detect schema changes in response structure', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Expected top-level keys
    const expectedTopLevelKeys = ['meta', 'data', 'pager'];
    const actualTopLevelKeys = Object.keys(body);
    
    const missingKeys = expectedTopLevelKeys.filter(key => !actualTopLevelKeys.includes(key));
    const extraKeys = actualTopLevelKeys.filter(key => !expectedTopLevelKeys.includes(key));

    if (missingKeys.length > 0) {
      throw new Error(`Schema change detected: Missing expected keys: ${missingKeys.join(', ')}`);
    }

    // Log extra keys as warnings (they might be new fields)
    if (extraKeys.length > 0) {
      console.warn(`Schema change detected: New keys found: ${extraKeys.join(', ')}`);
    }

    // Validate pager keys
    const expectedPagerKeys = ['self', 'next', 'last'];
    const actualPagerKeys = Object.keys(body.pager);
    const missingPagerKeys = expectedPagerKeys.filter(key => !actualPagerKeys.includes(key));
    const extraPagerKeys = actualPagerKeys.filter(key => !expectedPagerKeys.includes(key));

    if (missingPagerKeys.length > 0) {
      throw new Error(`Schema change detected: Missing expected pager keys: ${missingPagerKeys.join(', ')}`);
    }

    if (extraPagerKeys.length > 0) {
      console.warn(`Schema change detected: New pager keys found: ${extraPagerKeys.join(', ')}`);
    }

    if (body.data.length > 0) {
      const group = body.data[0];
      
      // Expected group keys (core required fields)
      const expectedGroupKeys = [
        'id', 'groupId', 'groupDescription', 'subGroups'
      ];

      const actualGroupKeys = Object.keys(group);
      const missingGroupKeys = expectedGroupKeys.filter(key => !actualGroupKeys.includes(key));

      if (missingGroupKeys.length > 0) {
        throw new Error(`Schema change detected: Missing expected group keys: ${missingGroupKeys.join(', ')}`);
      }

      // Warn about new group fields
      const extraGroupKeys = actualGroupKeys.filter(key => !expectedGroupKeys.includes(key));
      if (extraGroupKeys.length > 0) {
        console.warn(`Schema change detected: New group keys found: ${extraGroupKeys.join(', ')}`);
      }
    }
  });

  test('should validate subGroup id format when present', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate subGroup IDs when subGroups array has items
    for (const group of body.data) {
      if (Array.isArray(group.subGroups) && group.subGroups.length > 0) {
        for (const subGroup of group.subGroups) {
          expect(subGroup.id).toBeTruthy();
          expect(typeof subGroup.id).toBe('string');
          expect(subGroup.id.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should validate groupId values format', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate groupId structure for all groups
    for (const group of body.data) {
      expect(Array.isArray(group.groupId)).toBe(true);
      expect(group.groupId.length).toBeGreaterThan(0);
      
      const groupIdItem = group.groupId[0];
      expect(groupIdItem).toHaveProperty('values');
      expect(Array.isArray(groupIdItem.values)).toBe(true);
      expect(groupIdItem.values.length).toBeGreaterThan(0);
      expect(typeof groupIdItem.values[0]).toBe('string');
      expect(groupIdItem.values[0].length).toBeGreaterThan(0);
    }
  });

  test('should validate pager URL structure', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate pager URLs are valid
    expect(body.pager.self).toMatch(/^https?:\/\//);
    expect(body.pager.next).toMatch(/^https?:\/\//);
    expect(body.pager.last).toMatch(/^https?:\/\//);
    
    // Validate that pager URLs contain the endpoint
    expect(body.pager.self).toContain('/groups');
    expect(body.pager.next).toContain('/groups');
    expect(body.pager.last).toContain('/groups');
  });

  test('should validate group id format', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/groups`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate all group IDs are non-empty strings
    for (const group of body.data) {
      expect(group.id).toBeTruthy();
      expect(typeof group.id).toBe('string');
      expect(group.id.length).toBeGreaterThan(0);
      // IDs are typically numeric strings
      expect(/^\d+$/.test(group.id)).toBe(true);
    }
  });
});

