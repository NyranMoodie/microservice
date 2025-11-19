import { test, expect } from '@playwright/test';

const REST_API_BASE_URL = process.env.REST_API_BASE_URL || 'https://your-api-domain.com/api/v1';

/**
 * Schema validation for REST API Departments Response
 * This test validates the response structure to detect schema changes over time
 */
test.describe('REST API - Departments Schema Validation', () => {
  
  test('should validate departments response schema structure', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

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

    const department = body.data[0];

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

    // Validate department required fields
    expect(department).toHaveProperty('id');
    expect(department).toHaveProperty('name');
    expect(typeof department.id).toBe('string');
    expect(typeof department.name).toBe('string');

    // Validate url field (can be null or array)
    expect(department).toHaveProperty('url');
    if (department.url !== null) {
      expect(Array.isArray(department.url)).toBe(true);
      
      if (department.url.length > 0) {
        const urlItem = department.url[0];
        expect(urlItem).toHaveProperty('values');
        expect(Array.isArray(urlItem.values)).toBe(true);
        
        if (urlItem.values.length > 0) {
          expect(typeof urlItem.values[0]).toBe('string');
        }
      }
    }

    // Validate group field (can be null or object)
    expect(department).toHaveProperty('group');
    if (department.group !== null) {
      expect(typeof department.group).toBe('object');
      expect(department.group).toHaveProperty('id');
      expect(typeof department.group.id).toBe('string');
    }
  });

  test('should validate departments schema for all returned departments', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments?page_size=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);

    // Validate schema for each department in the response
    for (const department of body.data) {
      // Basic required fields
      expect(department).toHaveProperty('id');
      expect(department).toHaveProperty('name');
      expect(typeof department.id).toBe('string');
      expect(typeof department.name).toBe('string');

      // Validate url field
      if (department.url !== null && department.url !== undefined) {
        expect(Array.isArray(department.url)).toBe(true);
        if (department.url.length > 0) {
          expect(department.url[0]).toHaveProperty('values');
          expect(Array.isArray(department.url[0].values)).toBe(true);
        }
      }

      // Validate group field
      if (department.group !== null && department.group !== undefined) {
        expect(typeof department.group).toBe('object');
        expect(department.group).toHaveProperty('id');
        expect(typeof department.group.id).toBe('string');
      }
    }
  });

  test('should validate departments with url field populated', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Find a department with url populated
    const departmentWithUrl = body.data.find((dept: any) => dept.url !== null && Array.isArray(dept.url) && dept.url.length > 0);
    
    if (departmentWithUrl) {
      expect(departmentWithUrl.url).toBeInstanceOf(Array);
      expect(departmentWithUrl.url.length).toBeGreaterThan(0);
      
      const urlItem = departmentWithUrl.url[0];
      expect(urlItem).toHaveProperty('values');
      expect(Array.isArray(urlItem.values)).toBe(true);
      expect(urlItem.values.length).toBeGreaterThan(0);
      expect(typeof urlItem.values[0]).toBe('string');
      // URL should be a valid path format
      expect(urlItem.values[0]).toMatch(/^\//);
    }
  });

  test('should validate departments with group field populated', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Find a department with group populated
    const departmentWithGroup = body.data.find((dept: any) => dept.group !== null && typeof dept.group === 'object');
    
    if (departmentWithGroup) {
      expect(departmentWithGroup.group).toBeInstanceOf(Object);
      expect(departmentWithGroup.group).toHaveProperty('id');
      expect(typeof departmentWithGroup.group.id).toBe('string');
      expect(departmentWithGroup.group.id.length).toBeGreaterThan(0);
    }
  });

  test('should validate departments with null url and group', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Find a department with null url and/or group
    const departmentWithNulls = body.data.find((dept: any) => dept.url === null || dept.group === null);
    
    if (departmentWithNulls) {
      // Should still have required fields
      expect(departmentWithNulls).toHaveProperty('id');
      expect(departmentWithNulls).toHaveProperty('name');
      
      // Null fields should be explicitly null
      if (departmentWithNulls.url === null) {
        expect(departmentWithNulls.url).toBeNull();
      }
      if (departmentWithNulls.group === null) {
        expect(departmentWithNulls.group).toBeNull();
      }
    }
  });

  test('should detect schema changes in response structure', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

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
      const department = body.data[0];
      
      // Expected department keys (core required fields)
      const expectedDepartmentKeys = [
        'id', 'name', 'url', 'group'
      ];

      const actualDepartmentKeys = Object.keys(department);
      const missingDepartmentKeys = expectedDepartmentKeys.filter(key => !actualDepartmentKeys.includes(key));

      if (missingDepartmentKeys.length > 0) {
        throw new Error(`Schema change detected: Missing expected department keys: ${missingDepartmentKeys.join(', ')}`);
      }

      // Warn about new department fields
      const extraDepartmentKeys = actualDepartmentKeys.filter(key => !expectedDepartmentKeys.includes(key));
      if (extraDepartmentKeys.length > 0) {
        console.warn(`Schema change detected: New department keys found: ${extraDepartmentKeys.join(', ')}`);
      }
    }
  });

  test('should validate pager URL structure', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate pager URLs are valid
    expect(body.pager.self).toMatch(/^https?:\/\//);
    expect(body.pager.next).toMatch(/^https?:\/\//);
    expect(body.pager.last).toMatch(/^https?:\/\//);
    
    // Validate that pager URLs contain the endpoint
    expect(body.pager.self).toContain('/departments');
    expect(body.pager.next).toContain('/departments');
    expect(body.pager.last).toContain('/departments');
  });

  test('should validate department id format', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate all department IDs are non-empty strings
    for (const department of body.data) {
      expect(department.id).toBeTruthy();
      expect(typeof department.id).toBe('string');
      expect(department.id.length).toBeGreaterThan(0);
      // IDs are typically numeric strings
      expect(/^\d+$/.test(department.id)).toBe(true);
    }
  });

  test('should validate department name format', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate all department names are non-empty strings
    for (const department of body.data) {
      expect(department.name).toBeTruthy();
      expect(typeof department.name).toBe('string');
      expect(department.name.length).toBeGreaterThan(0);
    }
  });

  test('should validate group id format when present', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate group IDs when group is not null
    for (const department of body.data) {
      if (department.group !== null) {
        expect(department.group.id).toBeTruthy();
        expect(typeof department.group.id).toBe('string');
        expect(department.group.id.length).toBeGreaterThan(0);
        // Group IDs are typically numeric strings
        expect(/^\d+$/.test(department.group.id)).toBe(true);
      }
    }
  });

  test('should validate url values format when present', async ({ request }) => {
    const response = await request.get(`${REST_API_BASE_URL}/departments`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate URL values when url is not null
    for (const department of body.data) {
      if (department.url !== null && Array.isArray(department.url) && department.url.length > 0) {
        const urlItem = department.url[0];
        if (urlItem.values && urlItem.values.length > 0) {
          const urlValue = urlItem.values[0];
          expect(typeof urlValue).toBe('string');
          // URL should start with /
          expect(urlValue).toMatch(/^\//);
          // URL should be a valid path format
          expect(urlValue).toMatch(/^\/departments\/[a-z0-9-]+\/?$/);
        }
      }
    }
  });
});

