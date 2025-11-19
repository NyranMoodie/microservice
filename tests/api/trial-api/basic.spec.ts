import { test, expect } from '@playwright/test';

const TRIALS_API_BASE_URL = process.env.TRIALS_API_BASE_URL || 'https://trials-api.montefioreeinstein.org/jsonapi/index';

test.describe('JSON:API - Clinical Trials Index Endpoint', () => {
  
  test('should return all indexed clinical trials', async ({ request }) => {
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    
    // Validate JSON:API structure
    if (body.data.length > 0) {
      const trial = body.data[0];
      expect(trial).toHaveProperty('type');
      expect(trial).toHaveProperty('id');
      expect(trial).toHaveProperty('attributes');
    }
  });

  test('should filter clinical trials by recruitment status (Recruiting OR Active, not recruiting)', async ({ request }) => {
    const filterParams = new URLSearchParams({
      'filter[status][condition][path]': 'field_ct_overall_status',
      'filter[status][condition][operator]': 'IN',
      'filter[status][condition][value][1]': 'Recruiting',
      'filter[status][condition][value][2]': 'Active, not recruiting',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    console.log(body.data[0]);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    
    // Validate that returned trials have the expected status
    if (body.data.length > 0) {
      body.data.forEach((trial: any) => {
        if (trial.attributes?.field_ct_overall_status) {
          const status = trial.attributes.field_ct_overall_status;
          expect(['Recruiting', 'Active, not recruiting']).toContain(status);
        }
      });
    }
  });

  test('should filter clinical trials by category (Cancer)', async ({ request }) => {
    const filterParams = new URLSearchParams({
      'filter[field_ct_category_name_cat][condition][path]': 'field_ct_category_name',
      'filter[field_ct_category_name_cat][condition][operator]': '=',
      'filter[field_ct_category_name_cat][condition][value]': 'Cancer',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    
    // Validate that returned trials have Cancer category
    if (body.data.length > 0) {
      body.data.forEach((trial: any) => {
        if (trial.attributes?.field_ct_category_name) {
          expect(trial.attributes.field_ct_category_name).toBe('Cancer');
        }
      });
    }
  });

  test('should filter clinical trials by exact age (40 years old)', async ({ request }) => {
    const filterParams = new URLSearchParams({
      'filter[age_range_min][condition][path]': 'field_ct_minimum_age_number',
      'filter[age_range_min][condition][operator]': '<=',
      'filter[age_range_min][condition][value]': '40',
      'filter[age_range_max][condition][path]': 'field_ct_maximum_age_number',
      'filter[age_range_max][condition][operator]': '>=',
      'filter[age_range_max][condition][value]': '40',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    
    // Validate that returned trials accept age 40
    if (body.data.length > 0) {
      body.data.forEach((trial: any) => {
        const minAge = trial.attributes?.field_ct_minimum_age_number;
        const maxAge = trial.attributes?.field_ct_maximum_age_number;
        
        if (minAge !== undefined && maxAge !== undefined) {
          expect(parseInt(minAge)).toBeLessThanOrEqual(40);
          expect(parseInt(maxAge)).toBeGreaterThanOrEqual(40);
        }
      });
    }
  });

  test('should filter clinical trials by age range (40-50 years old)', async ({ request }) => {
    const filterParams = new URLSearchParams({
      'filter[age_range_min][condition][path]': 'field_ct_minimum_age_number',
      'filter[age_range_min][condition][operator]': '<=',
      'filter[age_range_min][condition][value]': '40',
      'filter[age_range_max][condition][path]': 'field_ct_maximum_age_number',
      'filter[age_range_max][condition][operator]': '>=',
      'filter[age_range_max][condition][value]': '50',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    
    // Validate that returned trials overlap with age range 40-50
    if (body.data.length > 0) {
      body.data.forEach((trial: any) => {
        const minAge = trial.attributes?.field_ct_minimum_age_number;
        const maxAge = trial.attributes?.field_ct_maximum_age_number;
        
        if (minAge !== undefined && maxAge !== undefined) {
          // Trial should accept at least age 40 or less, and at least age 50 or more
          expect(parseInt(minAge)).toBeLessThanOrEqual(40);
          expect(parseInt(maxAge)).toBeGreaterThanOrEqual(50);
        }
      });
    }
  });

  test('should filter clinical trials by phase (Phase 3)', async ({ request }) => {
    const filterParams = new URLSearchParams({
      'filter[field_ct_phases]': 'Phase 3',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    
    // Validate that returned trials include Phase 3
    if (body.data.length > 0) {
      body.data.forEach((trial: any) => {
        if (trial.attributes?.field_ct_phases) {
          const phases = Array.isArray(trial.attributes.field_ct_phases) 
            ? trial.attributes.field_ct_phases 
            : [trial.attributes.field_ct_phases];
          expect(phases).toContain('Phase 3');
        }
      });
    }
  });

  test('should filter clinical trials by full text search (Prevention)', async ({ request }) => {
    const filterParams = new URLSearchParams({
      'filter[fulltext]': 'Prevention',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    
    // Fulltext search should return results (validation of exact match is complex)
    // We just verify the response structure is correct
    if (body.data.length > 0) {
      const trial = body.data[0];
      expect(trial).toHaveProperty('type');
      expect(trial).toHaveProperty('id');
      expect(trial).toHaveProperty('attributes');
    }
  });

  test('should validate JSON:API response structure', async ({ request }) => {
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate JSON:API structure
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('links');
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const trial = body.data[0];
      expect(trial).toHaveProperty('type');
      expect(trial).toHaveProperty('id');
      expect(trial).toHaveProperty('attributes');
    }
  });

  test('should handle pagination with page limit', async ({ request }) => {
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(10);
  });

  test('should handle pagination with offset', async ({ request }) => {
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?page[limit]=10&page[offset]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should combine filters (status and category)', async ({ request }) => {
    const filterParams = new URLSearchParams({
      'filter[status][condition][path]': 'field_ct_overall_status',
      'filter[status][condition][operator]': 'IN',
      'filter[status][condition][value][1]': 'Recruiting',
      'filter[field_ct_category_name_cat][condition][path]': 'field_ct_category_name',
      'filter[field_ct_category_name_cat][condition][operator]': '=',
      'filter[field_ct_category_name_cat][condition][value]': 'Cancer',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle empty filter results gracefully', async ({ request }) => {
    // Using a very specific filter that likely returns no results
    const filterParams = new URLSearchParams({
      'filter[field_ct_category_name_cat][condition][path]': 'field_ct_category_name',
      'filter[field_ct_category_name_cat][condition][operator]': '=',
      'filter[field_ct_category_name_cat][condition][value]': 'NonExistentCategory12345',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    // Should return empty array, not error
  });

  test('should return links for pagination', async ({ request }) => {
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('links');
    if (body.links) {
      expect(body.links).toHaveProperty('self');
    }
  });

  test('should handle invalid filter parameters gracefully', async ({ request }) => {
    const filterParams = new URLSearchParams({
      'filter[invalid_field][condition][path]': 'invalid_path',
      'filter[invalid_field][condition][operator]': '=',
      'filter[invalid_field][condition][value]': 'test',
    });
    
    const response = await request.get(`${TRIALS_API_BASE_URL}/ct_index?${filterParams.toString()}`);

    // Should either return empty results or error, but not crash
    expect([200, 400, 422]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    }
  });

});

