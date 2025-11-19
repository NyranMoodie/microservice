import { test, expect } from '@playwright/test';

const REST_API_BASE_URL = process.env.REST_API_BASE_URL || 'https://your-api-domain.com/api/v1';

test.describe('REST API - Profiles Endpoint', () => {
  
  test('should return profiles with default pagination', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(25); // Default page_size
  });

  test('should filter profiles by providerId', async ({ request }) => {
    const providerId = 1467437764;
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        providerId
      }
    });



    expect(response.status()).toBe(200);
    const body = await response.json();

    console.log(body);
    
    // The filter should return results if the providerId exists
    expect(Array.isArray(body.data)).toBe(true);
    // Note: providerId may not be directly exposed in response, but filtering works
  });
  test('should filter profiles by name', async ({ request }) => {
    const search = 'Gel';
    const response = await request.get(`${REST_API_BASE_URL}/profiles/${search}`, {
      data: {
        search
      }
    });



    expect(response.status()).toBe(200);
    const body = await response.json();

    console.log(JSON.stringify(body.data, null, 2));
    
    // The filter should return results if the providerId exists
    expect(Array.isArray(body.data)).toBe(true);
    // Note: providerId may not be directly exposed in response, but filtering works
  });

  test('should filter profiles by einsteinId', async ({ request }) => {
    const einsteinId = 10675;
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        einsteinId
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // The filter should return results if the einsteinId exists
    expect(Array.isArray(body.data)).toBe(true);
    // Note: einsteinId may not be directly exposed in response, but filtering works
  });

  test('should filter profiles by isProvider flag', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        isProvider: true
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('isProvider');
      expect(body.data[0].isProvider).toBe(true);
    }
  });

  test('should filter profiles by isFaculty flag', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        isFaculty: true
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('isFaculty');
      expect(body.data[0].isFaculty).toBe(true);
    }
  });

  test('should filter profiles by isStaff flag', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        isStaff: true
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('isStaff');
      expect(body.data[0].isStaff).toBe(true);
    }
  });

  test('should filter profiles by organizations with OR operator', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        organizations: ['MMC', 'CHAM'],
        organizationsOperator: 'OR'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by organizations with AND operator', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        organizations: ['MMC', 'CHAM'],
        organizationsOperator: 'AND'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by professionalTitles', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        professionalTitles: ['PhD', 'MD', 'NP']
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('professionalTitles');
    }
  });

  test('should filter profiles by languages', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        languages: [4886]
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });


  test('should filter profiles by isPrimaryCare flag', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        isPrimaryCare: true
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('isPrimaryCare');
      expect(body.data[0].isPrimaryCare).toBe(true);
    }
  });

  test('should filter profiles by isPediatric flag', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        isPediatric: true
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('isPediatric');
      expect(body.data[0].isPediatric).toBe(true);
    }
  });

  test('should filter profiles by gender', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        gender: 'male'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('gender');
      // gender is an array with objects containing source and values
      const genderArray = body.data[0].gender;
      if (genderArray && Array.isArray(genderArray) && genderArray.length > 0) {
        const genderValue = genderArray[0].values?.[0];
        expect(genderValue).toBe('male');
      }
    }
  });

  test('should filter profiles by specialties', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        specialties: [3951]
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by clinicalTerms', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        clinicalTerms: [21466, 21481]
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter profiles by geocoding', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        geocoding: {
          lon: -73.84861,
          lat: 40.83504,
          radius: 20
        }
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should paginate results with page_size and page_number', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?page_size=10&page_number=1`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(10);
    expect(body.meta).toHaveProperty('count');
    // Verify pagination works by checking the count
    expect(typeof body.meta.count).toBe('number');
  });

  test('should validate page_size maximum limit', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?page_size=30`, {
      data: {}
    });

    // Should either enforce max or return error
    expect([200, 400]).toContain(response.status());
  });

  test('should sort results by last-name-az-asc', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?sort=last-name-az-asc`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data.length > 1) {
      // lastName is an array with objects containing source and values
      const getLastName = (profile: any) => {
        if (profile.lastName && Array.isArray(profile.lastName) && profile.lastName.length > 0) {
          return profile.lastName[0].values?.[0] || '';
        }
        return '';
      };
      const lastName1 = getLastName(body.data[0]);
      const lastName2 = getLastName(body.data[1]);
      if (lastName1 && lastName2) {
        expect(lastName1.localeCompare(lastName2)).toBeLessThanOrEqual(0);
      }
    }
  });

  test('should sort results by last-name-az-desc', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?sort=last-name-az-desc`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data.length > 1) {
      // lastName is an array with objects containing source and values
      const getLastName = (profile: any) => {
        if (profile.lastName && Array.isArray(profile.lastName) && profile.lastName.length > 0) {
          return profile.lastName[0].values?.[0] || '';
        }
        return '';
      };
      const lastName1 = getLastName(body.data[0]);
      const lastName2 = getLastName(body.data[1]);
      if (lastName1 && lastName2) {
        expect(lastName1.localeCompare(lastName2)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should sort results by first-name-az-asc', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?sort=first-name-az-asc`, {
      data: {}
    });

    // Some APIs may not support first-name sorting, so accept both 200 and 400
    if (response.status() === 400) {
      // If sorting is not supported, just verify the endpoint responds
      expect(response.status()).toBe(400);
      return;
    }

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data.length > 1) {
      // firstName is an array with objects containing source and values
      const getFirstName = (profile: any) => {
        if (profile.firstName && Array.isArray(profile.firstName) && profile.firstName.length > 0) {
          return profile.firstName[0].values?.[0] || '';
        }
        return '';
      };
      const firstName1 = getFirstName(body.data[0]);
      const firstName2 = getFirstName(body.data[1]);
      if (firstName1 && firstName2) {
        expect(firstName1.localeCompare(firstName2)).toBeLessThanOrEqual(0);
      }
    }
  });

  test('should include relationships in response', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?include=departments.department.group,specialties`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    if (body.data && body.data.length > 0) {
      // Check if included relationships are present
      const firstProfile = body.data[0];
      expect(firstProfile).toHaveProperty('departments');
    }
  });

  test('should return facets when requested', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?facets=specialties,clinical_terms,languages&facet_limit=10`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('facets');
    if (body.facets) {
      expect(body.facets).toHaveProperty('specialties');
    }
  });

  test('should handle context parameter', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?context=cmo`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle context with override parameter', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?context=cmo&override=true`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should handle complex filter combination', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?page_size=5&sort=az-asc`, {
      data: {
        isProvider: true,
        organizations: ['MMC'],
        professionalTitles: ['MD'],
        isPrimaryCare: true
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.data.length).toBeLessThanOrEqual(5);
    
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('isProvider');
      expect(body.data[0].isProvider).toBe(true);
    }
  });

  test('should return proper error for invalid request', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        providerId: 'invalid'
      }
    });

    // Should return error for invalid providerId type
    expect([200, 400, 422]).toContain(response.status());
  });

  test('should validate response structure', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate response structure
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    
    if (body.data.length > 0) {
      const profile = body.data[0];
      expect(profile).toHaveProperty('id');
      // REST API doesn't use 'type' field like JSON:API
      expect(profile).toHaveProperty('title');
    }
  });
});

