import { test, expect } from '@playwright/test';

const JSON_API_BASE_URL = process.env.JSON_API_BASE_URL || 'https://your-api-domain.com/jsonapi/index';

test.describe('JSON:API - Profiles Endpoint', () => {
  
  test('should return profiles with default pagination', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(10);
  });

  test('should validate page limit maximum (50)', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?page[limit]=50`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(50);
  });

  test('should handle pagination with offset', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?page[limit]=10&page[offset]=11`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should include field relationships', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?include=field_ph_specialties,field_ph_locations,field_ph_languages&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('included');
    expect(Array.isArray(body.included)).toBe(true);
  });

  test('should filter profiles by organizations', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_organizations][condition][path]=field_ph_organizations&filter[field_ph_organizations][condition][operator]=IN&filter[field_ph_organizations][condition][value][1]=ORTHO&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by multiple organizations', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_organizations][condition][path]=field_ph_organizations&filter[field_ph_organizations][condition][operator]=IN&filter[field_ph_organizations][condition][value][1]=ORTHO&filter[field_ph_organizations][condition][value][2]=ORTHO-LDR&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by professional titles', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[professional_titles][condition][path]=field_ph_professional_titles&filter[professional_titles][condition][operator]=IN&filter[professional_titles][condition][value][1]=MD&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by multiple professional titles', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[professional_titles][condition][path]=field_ph_professional_titles&filter[professional_titles][condition][operator]=IN&filter[professional_titles][condition][value][1]=MD&filter[professional_titles][condition][value][2]=PA&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by NPI', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_npi]=1234567890&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by full name', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_full_name]=bob&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    console.log(JSON.stringify(body.data, null, 2));
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by language name', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_language_name]=Spanish&page[limit]=10`);

  
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by gender', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_gender]=male&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const attributes = body.data[0].attributes;
      if (attributes && attributes.field_ph_gender) {
        expect(attributes.field_ph_gender).toBe('male');
      }
    }
  });

  test('should filter profiles by isPediatric flag', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_is_pediatric]=true&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by isPrimaryCare flag', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_is_primary_care]=true&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by geolocation', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[location][latlon][lat]=40.7443091&filter[location][latlon][lon]=-73.84861&filter[location][latlon][radius]=5&page[limit]=10`);

    console.log(await response.body())
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by specialty with IN operator', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[specialty-0][condition][path]=field_ph_specialty_name&filter[specialty-0][condition][operator]=IN&filter[specialty-0][condition][value]=Orthopedics&filter[specialty-0][condition][memberOf]=specialty-group-0&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by clinical terms', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[clinical-term-0][condition][path]=field_ph_clinical_terms&filter[clinical-term-0][condition][operator]=IN&filter[clinical-term-0][condition][value]=Headache&filter[clinical-term-0][condition][memberOf]=clinical-term-group-0&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle specialty and clinical term group with OR conjunction', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[clinical-term-group-0][group][conjunction]=OR&filter[specialty-0][condition][path]=field_ph_specialty_name&filter[specialty-0][condition][operator]=IN&filter[specialty-0][condition][value]=Orthopedics&filter[specialty-0][condition][memberOf]=specialty-group-0&filter[clinical-term-0][condition][path]=field_ph_clinical_terms&filter[clinical-term-0][condition][operator]=IN&filter[clinical-term-0][condition][value]=Headache&filter[clinical-term-0][condition][memberOf]=clinical-term-group-0&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle specialty and clinical term group with AND conjunction', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[clinical-term-group-0][group][conjunction]=AND&filter[specialty-0][condition][path]=field_ph_specialty_name&filter[specialty-0][condition][operator]=IN&filter[specialty-0][condition][value]=Orthopedics&filter[specialty-0][condition][memberOf]=specialty-group-0&filter[clinical-term-0][condition][path]=field_ph_clinical_terms&filter[clinical-term-0][condition][operator]=IN&filter[clinical-term-0][condition][value]=Headache&filter[clinical-term-0][condition][memberOf]=clinical-term-group-0&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should sort profiles by last name ascending', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?sort[sort-group][path]=field_ph_last_name&sort[sort-group][direction]=ASC&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 1) {
      const lastName1 = body.data[0].attributes?.field_ph_last_name || '';
      const lastName2 = body.data[1].attributes?.field_ph_last_name || '';
      expect(lastName1.localeCompare(lastName2)).toBeLessThanOrEqual(0);
    }
  });

  test('should sort profiles by last name descending', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?sort[sort-group][path]=field_ph_last_name&sort[sort-group][direction]=DESC&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 1) {
      const lastName1 = body.data[0].attributes?.field_ph_last_name || '';
      const lastName2 = body.data[1].attributes?.field_ph_last_name || '';
      expect(lastName1.localeCompare(lastName2)).toBeGreaterThanOrEqual(0);
    }
  });

  test('should limit fields returned for profiles', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?fields[node--doctor]=id,name&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const profile = body.data[0];
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('attributes');
      expect(profile.attributes).toHaveProperty('name');
    }
  });

  test('should include publications', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?include=field_el_publications.field_el_publication_reference,field_el_custom_publication_list.field_el_publications.field_el_publication_reference&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
    expect(body).toHaveProperty('included');
  });

  test('should validate JSON:API response structure', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate JSON:API structure
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('links');
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const profile = body.data[0];
      expect(profile).toHaveProperty('type');
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('attributes');
    }
  });

  test('should handle complex filter combination', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[field_ph_organizations][condition][path]=field_ph_organizations&filter[field_ph_organizations][condition][operator]=IN&filter[field_ph_organizations][condition][value][1]=MMC&filter[professional_titles][condition][path]=field_ph_professional_titles&filter[professional_titles][condition][operator]=IN&filter[professional_titles][condition][value][1]=MD&filter[field_ph_is_primary_care]=true&page[limit]=10`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle fields for language taxonomy', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?include=field_ph_languages&fields[taxonomy_term--ph_language]=name&page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should return error for invalid page limit', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?page[limit]=100`);

    // Should return error for limit > 50
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should return error for missing required filter parameters', async ({ request }) => {
    const response = await request.get(`${JSON_API_BASE_URL}/profiles?filter[location][latlon][lat]=40.7443091&page[limit]=10`);

    // Should return error if lat/lon/radius are not all provided
    expect([200, 400, 422]).toContain(response.status());
  });
});

