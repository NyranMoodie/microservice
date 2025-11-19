import { test, expect } from '@playwright/test';

const REST_API_BASE_URL = process.env.REST_API_BASE_URL || 'https://your-api-domain.com/api/v1';

/**
 * Schema validation for REST API Profile Response
 * This test validates the response structure to detect schema changes over time
 */
test.describe('REST API - Profile Schema Validation', () => {
  
  test('should validate profile response schema structure', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        providerId: 1467437764 // Using David S. Geller's provider ID from example
      }
    });

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

    const profile = body.data[0];

    // Validate meta structure
    expect(body.meta).toHaveProperty('count');
    expect(typeof body.meta.count).toBe('number');

    // Validate pager structure
    expect(body.pager).toHaveProperty('self');
    expect(typeof body.pager.self).toBe('string');

    // Validate profile required fields
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('title');
    expect(typeof profile.id).toBe('string');
    expect(typeof profile.title).toBe('string');

    // Validate boolean flags
    expect(profile).toHaveProperty('isProvider');
    expect(profile).toHaveProperty('isFaculty');
    expect(profile).toHaveProperty('isStaff');
    expect(profile).toHaveProperty('isPediatric');
    expect(profile).toHaveProperty('isPrimaryCare');
    expect(profile).toHaveProperty('hideFacultyDisplay');
    expect(profile).toHaveProperty('profileDisplayed');
    expect(typeof profile.isProvider).toBe('boolean');
    expect(typeof profile.isFaculty).toBe('boolean');
    expect(typeof profile.isStaff).toBe('boolean');
    expect(typeof profile.isPediatric).toBe('boolean');
    expect(typeof profile.isPrimaryCare).toBe('boolean');

    // Validate location flags
    expect(profile).toHaveProperty('inTaxterManhattan');
    expect(profile).toHaveProperty('inTaxterWestchester');
    expect(profile).toHaveProperty('inMEAC');
    expect(profile).toHaveProperty('inBloomingGrove');
    expect(profile).toHaveProperty('inNEOSM');
    expect(profile).toHaveProperty('isOpenScheduling');
    expect(typeof profile.inTaxterManhattan).toBe('boolean');
    expect(typeof profile.inTaxterWestchester).toBe('boolean');

    // Validate array fields with source structure
    const arrayFieldsWithSource = [
      'firstName', 'middleName', 'lastName', 'fullName', 'salutation',
      'biography', 'degrees', 'email', 'gender', 'phoneNumber',
      'licenses', 'npi', 'elsevierLink', 'publicationsLink',
      'photoUrl', 'photoUrlBlackWhite', 'professionalTitles',
      'organizations', 'clinicalFocus', 'researchFocus', 'fellowships',
      'employmentStatus', 'medicalEducation', 'languages', 'scopusId',
      'imageName', 'professionalInterest', 'selectedPublication',
      'residencies', 'emrId', 'elsevierId', 'academicTitles',
      'organizationTitles', 'departments', 'locations', 'specialties',
      'clinicalTerms', 'publications'
    ];

    for (const field of arrayFieldsWithSource) {
      if (profile[field] !== null && profile[field] !== undefined) {
        expect(Array.isArray(profile[field])).toBe(true);
        
        if (profile[field].length > 0) {
          const item = profile[field][0];
          expect(item).toHaveProperty('source');
          expect(item).toHaveProperty('values');
          expect(typeof item.source).toBe('string');
          expect(Array.isArray(item.values)).toBe(true);
        }
      }
    }

    // Validate nullable fields
    const nullableFields = [
      'phoneExtension', 'customLinks', 'researchArea', 'profileUrl',
      'facultyId', 'urlRedirect', 'visitType', 'zocDocUrl', 'customPublicationLists'
    ];

    for (const field of nullableFields) {
      if (profile[field] !== undefined) {
        expect(profile[field] === null || typeof profile[field] === 'string' || typeof profile[field] === 'object').toBe(true);
      }
    }

    // Validate complex nested structures
    if (profile.languages && Array.isArray(profile.languages) && profile.languages.length > 0) {
      const languageItem = profile.languages[0];
      if (languageItem.values && languageItem.values.length > 0) {
        const language = languageItem.values[0];
        if (typeof language === 'object') {
          expect(language).toHaveProperty('id');
          expect(language).toHaveProperty('name');
        }
      }
    }

    // Validate specialties structure
    if (profile.specialties && Array.isArray(profile.specialties) && profile.specialties.length > 0) {
      const specialtyItem = profile.specialties[0];
      if (specialtyItem.values && specialtyItem.values.length > 0) {
        const specialty = specialtyItem.values[0];
        if (typeof specialty === 'object') {
          expect(specialty).toHaveProperty('id');
          expect(specialty).toHaveProperty('name');
        }
      }
    }

    // Validate clinicalTerms structure
    if (profile.clinicalTerms && Array.isArray(profile.clinicalTerms) && profile.clinicalTerms.length > 0) {
      const clinicalTermItem = profile.clinicalTerms[0];
      if (clinicalTermItem.values && clinicalTermItem.values.length > 0) {
        const clinicalTerm = clinicalTermItem.values[0];
        if (typeof clinicalTerm === 'object') {
          expect(clinicalTerm).toHaveProperty('id');
          expect(clinicalTerm).toHaveProperty('name');
        }
      }
    }

    // Validate organizationTitles structure
    if (profile.organizationTitles && Array.isArray(profile.organizationTitles) && profile.organizationTitles.length > 0) {
      const orgTitleItem = profile.organizationTitles[0];
      if (orgTitleItem.values && orgTitleItem.values.length > 0) {
        const orgTitle = orgTitleItem.values[0];
        if (typeof orgTitle === 'object') {
          expect(orgTitle).toHaveProperty('title');
          if (orgTitle.title) {
            expect(Array.isArray(orgTitle.title)).toBe(true);
          }
        }
      }
    }

    // Validate departments structure
    if (profile.departments && Array.isArray(profile.departments) && profile.departments.length > 0) {
      const deptItem = profile.departments[0];
      if (deptItem.values && deptItem.values.length > 0) {
        const dept = deptItem.values[0];
        if (typeof dept === 'object') {
          expect(dept).toHaveProperty('department');
          expect(dept).toHaveProperty('isPrimary');
          if (dept.department) {
            expect(dept.department).toHaveProperty('id');
          }
        }
      }
    }

    // Validate locations structure
    if (profile.locations && Array.isArray(profile.locations) && profile.locations.length > 0) {
      const locationItem = profile.locations[0];
      if (locationItem.values && locationItem.values.length > 0) {
        const location = locationItem.values[0];
        if (typeof location === 'object') {
          expect(location).toHaveProperty('id');
          expect(location).toHaveProperty('isHidden');
          expect(location).toHaveProperty('isPrimary');
          expect(location).toHaveProperty('isNEOSMLocation');
          expect(typeof location.isHidden).toBe('boolean');
          expect(typeof location.isPrimary).toBe('boolean');
        }
      }
    }

    // Validate publications structure
    if (profile.publications && Array.isArray(profile.publications) && profile.publications.length > 0) {
      const pubItem = profile.publications[0];
      if (pubItem.values && pubItem.values.length > 0) {
        const publication = pubItem.values[0];
        if (typeof publication === 'object') {
          expect(publication).toHaveProperty('publication');
          expect(publication).toHaveProperty('isPinned');
          expect(typeof publication.isPinned).toBe('boolean');
          if (publication.publication) {
            expect(publication.publication).toHaveProperty('id');
          }
        }
      }
    }

    // Validate customPublicationLists (can be null)
    if (profile.customPublicationLists !== null && profile.customPublicationLists !== undefined) {
      expect(Array.isArray(profile.customPublicationLists)).toBe(true);
    }
  });

  test('should validate profile schema for all returned profiles', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles?page_size=5`, {
      data: {}
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.data)).toBe(true);

    // Validate schema for each profile in the response
    for (const profile of body.data) {
      // Basic required fields
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('title');
      expect(typeof profile.id).toBe('string');
      expect(typeof profile.title).toBe('string');

      // Boolean flags should be booleans
      const booleanFields = [
        'isProvider', 'isFaculty', 'isStaff', 'isPediatric',
        'isPrimaryCare', 'hideFacultyDisplay', 'profileDisplayed'
      ];

      for (const field of booleanFields) {
        if (profile[field] !== undefined) {
          expect(typeof profile[field]).toBe('boolean');
        }
      }

      // Array fields with source structure
      const arrayFields = ['firstName', 'lastName', 'fullName', 'email'];
      for (const field of arrayFields) {
        if (profile[field] !== null && profile[field] !== undefined) {
          expect(Array.isArray(profile[field])).toBe(true);
          if (profile[field].length > 0) {
            expect(profile[field][0]).toHaveProperty('source');
            expect(profile[field][0]).toHaveProperty('values');
          }
        }
      }
    }
  });

  test('should detect schema changes in response structure', async ({ request }) => {
    const response = await request.post(`${REST_API_BASE_URL}/profiles`, {
      data: {
        providerId: 1467437764
      }
    });

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

    if (body.data.length > 0) {
      const profile = body.data[0];
      
      // Expected profile keys (core required fields)
      const expectedProfileKeys = [
        'id', 'title', 'isProvider', 'isFaculty', 'isStaff',
        'firstName', 'lastName', 'fullName'
      ];

      const actualProfileKeys = Object.keys(profile);
      const missingProfileKeys = expectedProfileKeys.filter(key => !actualProfileKeys.includes(key));

      if (missingProfileKeys.length > 0) {
        throw new Error(`Schema change detected: Missing expected profile keys: ${missingProfileKeys.join(', ')}`);
      }
    }
  });
});

