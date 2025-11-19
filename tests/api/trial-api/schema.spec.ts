import { test, expect } from '@playwright/test';

const TRIALS_API_BASE_URL = process.env.TRIALS_API_BASE_URL || 'https://trials-api.montefioreeinstein.org/jsonapi';

/**
 * Schema validation for JSON:API Clinical Trial Response
 * This test validates the response structure to detect schema changes over time
 */
test.describe('JSON:API - Clinical Trial Schema Validation', () => {
  
  test('should validate clinical trial response schema structure', async ({ request }) => {
    // Use a known clinical trial ID from the example
    const trialId = 'b9aa601d-bee1-4b97-909b-a3ce370d3a51';
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial/${trialId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Validate top-level JSON:API structure
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('type');
    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('links');
    expect(body.data).toHaveProperty('attributes');
    expect(body.data).toHaveProperty('relationships');
    
    expect(body.data.type).toBe('node--clinical_trial');
    expect(typeof body.data.id).toBe('string');
    expect(body.data.id.length).toBeGreaterThan(0);

    const trial = body.data;

    // Validate links structure
    expect(trial.links).toHaveProperty('describedby');
    expect(trial.links).toHaveProperty('self');
    expect(trial.links.describedby).toHaveProperty('href');
    expect(trial.links.self).toHaveProperty('href');
    expect(typeof trial.links.describedby.href).toBe('string');
    expect(typeof trial.links.self.href).toBe('string');
    expect(trial.links.describedby.href).toContain('/jsonapi/node/clinical_trial/resource/schema');
    expect(trial.links.self.href).toContain('/jsonapi/node/clinical_trial/');

    // Validate attributes structure
    const attributes = trial.attributes;
    
    // Core Drupal fields
    expect(attributes).toHaveProperty('drupal_internal__nid');
    expect(attributes).toHaveProperty('drupal_internal__vid');
    expect(attributes).toHaveProperty('langcode');
    expect(attributes).toHaveProperty('revision_timestamp');
    expect(attributes).toHaveProperty('status');
    expect(attributes).toHaveProperty('title');
    expect(attributes).toHaveProperty('created');
    expect(attributes).toHaveProperty('changed');
    expect(attributes).toHaveProperty('promote');
    expect(attributes).toHaveProperty('sticky');
    expect(attributes).toHaveProperty('default_langcode');
    expect(attributes).toHaveProperty('revision_translation_affected');
    
    // Validate core field types
    expect(typeof attributes.drupal_internal__nid).toBe('number');
    expect(typeof attributes.drupal_internal__vid).toBe('number');
    expect(typeof attributes.langcode).toBe('string');
    expect(typeof attributes.status).toBe('boolean');
    expect(typeof attributes.title).toBe('string');
    expect(typeof attributes.promote).toBe('boolean');
    expect(typeof attributes.sticky).toBe('boolean');
    expect(typeof attributes.default_langcode).toBe('boolean');
    expect(typeof attributes.revision_translation_affected).toBe('boolean');
    
    // Validate date fields
    expect(typeof attributes.revision_timestamp).toBe('string');
    expect(typeof attributes.created).toBe('string');
    expect(typeof attributes.changed).toBe('string');
    expect(attributes.revision_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(attributes.created).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(attributes.changed).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

    // Validate path structure
    expect(attributes).toHaveProperty('path');
    expect(typeof attributes.path).toBe('object');
    expect(attributes.path).toHaveProperty('alias');
    expect(attributes.path).toHaveProperty('pid');
    expect(attributes.path).toHaveProperty('langcode');
    expect(typeof attributes.path.langcode).toBe('string');

    // Validate clinical trial specific fields
    const ctFields = [
      'field_ct_brief_summary',
      'field_ct_brief_title',
      'field_ct_categories_debug',
      'field_ct_completion_date',
      'field_ct_completion_date_type',
      'field_ct_conditions',
      'field_ct_detailed_description',
      'field_ct_eligibility_criteria',
      'field_ct_first_post_date',
      'field_ct_first_post_date_type',
      'field_ct_first_submit_date',
      'field_ct_first_submit_qc_date',
      'field_ct_gender',
      'field_ct_gender_based',
      'field_ct_gender_description',
      'field_ct_healthy_volunteers',
      'field_ct_inclusion_criteria',
      'field_ct_keywords',
      'field_ct_last_update_post_date',
      'field_ct_last_update_post_date_t',
      'field_ct_last_update_submit_date',
      'field_ct_maximum_age',
      'field_ct_maximum_age_number',
      'field_ct_mesh_terms',
      'field_ct_minimum_age',
      'field_ct_minimum_age_number',
      'field_ct_nct_id',
      'field_ct_official_title',
      'field_ct_org_class',
      'field_ct_org_full_name',
      'field_ct_org_study_id',
      'field_ct_org_study_id_link',
      'field_ct_org_study_id_type',
      'field_ct_overall_status',
      'field_ct_phases',
      'field_ct_primary_completion_date',
      'field_ct_primary_completion_type',
      'field_ct_start_date',
      'field_ct_start_date_type',
      'field_ct_status_verified_date',
      'field_ct_std_ages',
      'field_ct_study_population',
      'field_ct_study_type',
      'field_locked_fields',
    ];

    // Validate that all expected fields exist (may be null)
    for (const field of ctFields) {
      expect(attributes).toHaveProperty(field);
    }

    // Validate specific field types
    if (attributes.field_ct_brief_summary !== null) {
      expect(typeof attributes.field_ct_brief_summary).toBe('string');
    }
    if (attributes.field_ct_brief_title !== null) {
      expect(typeof attributes.field_ct_brief_title).toBe('string');
    }
    expect(Array.isArray(attributes.field_ct_categories_debug)).toBe(true);
    if (attributes.field_ct_completion_date !== null) {
      expect(typeof attributes.field_ct_completion_date).toBe('string');
      expect(attributes.field_ct_completion_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    if (attributes.field_ct_completion_date_type !== null) {
      expect(typeof attributes.field_ct_completion_date_type).toBe('string');
    }
    expect(Array.isArray(attributes.field_ct_conditions)).toBe(true);
    expect(typeof attributes.field_ct_gender_based).toBe('boolean');
    expect(typeof attributes.field_ct_healthy_volunteers).toBe('boolean');
    expect(Array.isArray(attributes.field_ct_keywords)).toBe(true);
    if (attributes.field_ct_minimum_age_number !== null) {
      expect(typeof attributes.field_ct_minimum_age_number).toBe('number');
    }
    expect(Array.isArray(attributes.field_ct_mesh_terms)).toBe(true);
    expect(Array.isArray(attributes.field_ct_phases)).toBe(true);
    expect(Array.isArray(attributes.field_ct_std_ages)).toBe(true);
    if (attributes.field_ct_study_type !== null) {
      expect(typeof attributes.field_ct_study_type).toBe('string');
    }
    if (attributes.field_locked_fields !== null) {
      expect(typeof attributes.field_locked_fields).toBe('string');
    }

    // Validate relationships structure
    const relationships = trial.relationships;
    expect(typeof relationships).toBe('object');
    
    // Core relationships
    expect(relationships).toHaveProperty('node_type');
    expect(relationships).toHaveProperty('revision_uid');
    expect(relationships).toHaveProperty('uid');
    
    // Clinical trial specific relationships
    expect(relationships).toHaveProperty('field_ct_categories');
    expect(relationships).toHaveProperty('field_ct_central_contacts');
    expect(relationships).toHaveProperty('field_ct_condition_ancestors');
    expect(relationships).toHaveProperty('field_ct_condition_branches');
    expect(relationships).toHaveProperty('field_ct_condition_leaves');
    expect(relationships).toHaveProperty('field_ct_condition_meshes');
    expect(relationships).toHaveProperty('field_ct_investigators');
    expect(relationships).toHaveProperty('field_ct_primary_outcomes');
    expect(relationships).toHaveProperty('field_ct_secondary_ids');
    expect(relationships).toHaveProperty('field_ct_secondary_outcomes');
    expect(relationships).toHaveProperty('field_ct_see_also_links');

    // Validate relationship structure
    const validateRelationship = (rel: any, isArray: boolean = false) => {
      if (isArray) {
        expect(Array.isArray(rel.data)).toBe(true);
        expect(rel).toHaveProperty('links');
        if (rel.data.length > 0) {
          rel.data.forEach((item: any) => {
            expect(item).toHaveProperty('type');
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('meta');
            expect(typeof item.type).toBe('string');
            expect(typeof item.id).toBe('string');
          });
        }
      } else {
        expect(rel).toHaveProperty('data');
        expect(rel).toHaveProperty('links');
        if (rel.data !== null) {
          expect(rel.data).toHaveProperty('type');
          expect(rel.data).toHaveProperty('id');
          expect(rel.data).toHaveProperty('meta');
        }
      }
      expect(rel.links).toHaveProperty('related');
      expect(rel.links).toHaveProperty('self');
      expect(rel.links.related).toHaveProperty('href');
      expect(rel.links.self).toHaveProperty('href');
    };

    // Validate core relationships
    validateRelationship(relationships.node_type, false);
    validateRelationship(relationships.revision_uid, false);
    validateRelationship(relationships.uid, false);

    // Validate array relationships
    validateRelationship(relationships.field_ct_categories, true);
    validateRelationship(relationships.field_ct_central_contacts, true);
    validateRelationship(relationships.field_ct_condition_ancestors, true);
    validateRelationship(relationships.field_ct_condition_branches, true);
    validateRelationship(relationships.field_ct_condition_leaves, true);
    validateRelationship(relationships.field_ct_condition_meshes, true);
    validateRelationship(relationships.field_ct_investigators, true);
    validateRelationship(relationships.field_ct_primary_outcomes, true);
    validateRelationship(relationships.field_ct_secondary_ids, true);
    validateRelationship(relationships.field_ct_secondary_outcomes, true);
    validateRelationship(relationships.field_ct_see_also_links, true);

    // Validate specific relationship types
    if (relationships.field_ct_categories.data.length > 0) {
      expect(relationships.field_ct_categories.data[0].type).toBe('taxonomy_term--category');
    }
    if (relationships.field_ct_condition_ancestors.data.length > 0) {
      expect(relationships.field_ct_condition_ancestors.data[0].type).toBe('taxonomy_term--condition_ancestor');
    }
    if (relationships.field_ct_condition_branches.data.length > 0) {
      expect(relationships.field_ct_condition_branches.data[0].type).toBe('taxonomy_term--condition_branch');
    }
    if (relationships.field_ct_condition_leaves.data.length > 0) {
      expect(relationships.field_ct_condition_leaves.data[0].type).toBe('taxonomy_term--condition_leaf');
    }
    if (relationships.field_ct_condition_meshes.data.length > 0) {
      expect(relationships.field_ct_condition_meshes.data[0].type).toBe('taxonomy_term--condition_mesh');
    }
    if (relationships.field_ct_investigators.data.length > 0) {
      expect(relationships.field_ct_investigators.data[0].type).toBe('paragraph--ct_investigator');
    }
    if (relationships.field_ct_primary_outcomes.data.length > 0) {
      expect(relationships.field_ct_primary_outcomes.data[0].type).toBe('paragraph--primary_outcome');
    }
    if (relationships.field_ct_secondary_outcomes.data.length > 0) {
      expect(relationships.field_ct_secondary_outcomes.data[0].type).toBe('paragraph--secondary_outcome');
    }
    if (relationships.field_ct_see_also_links.data.length > 0) {
      expect(relationships.field_ct_see_also_links.data[0].type).toBe('paragraph--see_also_link');
    }
  });

  test('should validate clinical trial schema for multiple trials', async ({ request }) => {
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial?page[limit]=5`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length === 0) {
      test.skip();
      return;
    }

    // Validate schema for each trial in the response
    for (const trial of body.data) {
      // Basic JSON:API structure
      expect(trial).toHaveProperty('type');
      expect(trial).toHaveProperty('id');
      expect(trial).toHaveProperty('attributes');
      expect(trial).toHaveProperty('relationships');
      expect(trial.type).toBe('node--clinical_trial');
      
      // Validate attributes exist
      const attributes = trial.attributes;
      expect(attributes).toHaveProperty('title');
      expect(attributes).toHaveProperty('status');
      expect(attributes).toHaveProperty('drupal_internal__nid');
      expect(typeof attributes.title).toBe('string');
      expect(typeof attributes.status).toBe('boolean');
      
      // Validate relationships exist
      expect(trial.relationships).toHaveProperty('node_type');
      expect(trial.relationships).toHaveProperty('field_ct_categories');
    }
  });

  test('should detect schema changes in response structure', async ({ request }) => {
    const trialId = 'b9aa601d-bee1-4b97-909b-a3ce370d3a51';
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial/${trialId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    const trial = body.data;

    // Expected top-level keys
    const expectedTopLevelKeys = ['type', 'id', 'links', 'attributes', 'relationships'];
    const actualTopLevelKeys = Object.keys(trial);
    
    const missingKeys = expectedTopLevelKeys.filter(key => !actualTopLevelKeys.includes(key));
    const extraKeys = actualTopLevelKeys.filter(key => !expectedTopLevelKeys.includes(key));

    if (missingKeys.length > 0) {
      throw new Error(`Schema change detected: Missing expected keys: ${missingKeys.join(', ')}`);
    }

    // Log extra keys as warnings (they might be new fields)
    if (extraKeys.length > 0) {
      console.warn(`Schema change detected: New keys found: ${extraKeys.join(', ')}`);
    }

    // Validate links keys
    const expectedLinksKeys = ['describedby', 'self'];
    const actualLinksKeys = Object.keys(trial.links);
    const missingLinksKeys = expectedLinksKeys.filter(key => !actualLinksKeys.includes(key));
    const extraLinksKeys = actualLinksKeys.filter(key => !expectedLinksKeys.includes(key));

    if (missingLinksKeys.length > 0) {
      throw new Error(`Schema change detected: Missing expected links keys: ${missingLinksKeys.join(', ')}`);
    }

    if (extraLinksKeys.length > 0) {
      console.warn(`Schema change detected: New links keys found: ${extraLinksKeys.join(', ')}`);
    }

    // Validate core attributes keys
    const expectedAttributeKeys = [
      'drupal_internal__nid',
      'drupal_internal__vid',
      'langcode',
      'status',
      'title',
      'created',
      'changed',
      'promote',
      'sticky',
      'field_ct_brief_title',
      'field_ct_overall_status',
      'field_ct_study_type',
    ];

    const actualAttributeKeys = Object.keys(trial.attributes);
    const missingAttributeKeys = expectedAttributeKeys.filter(key => !actualAttributeKeys.includes(key));

    if (missingAttributeKeys.length > 0) {
      throw new Error(`Schema change detected: Missing expected attribute keys: ${missingAttributeKeys.join(', ')}`);
    }

    // Validate core relationships keys
    const expectedRelationshipKeys = [
      'node_type',
      'revision_uid',
      'uid',
      'field_ct_categories',
      'field_ct_central_contacts',
      'field_ct_investigators',
      'field_ct_primary_outcomes',
      'field_ct_secondary_outcomes',
    ];

    const actualRelationshipKeys = Object.keys(trial.relationships);
    const missingRelationshipKeys = expectedRelationshipKeys.filter(key => !actualRelationshipKeys.includes(key));

    if (missingRelationshipKeys.length > 0) {
      throw new Error(`Schema change detected: Missing expected relationship keys: ${missingRelationshipKeys.join(', ')}`);
    }
  });

  test('should validate link URLs are valid', async ({ request }) => {
    const trialId = 'b9aa601d-bee1-4b97-909b-a3ce370d3a51';
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial/${trialId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const trial = body.data;

    // Validate link URLs are valid HTTP/HTTPS URLs
    expect(trial.links.describedby.href).toMatch(/^https?:\/\//);
    expect(trial.links.self.href).toMatch(/^https?:\/\//);
    
    // Validate that links contain the correct endpoints
    expect(trial.links.describedby.href).toContain('/jsonapi/node/clinical_trial');
    expect(trial.links.self.href).toContain('/jsonapi/node/clinical_trial');

    // Validate relationship link URLs
    Object.keys(trial.relationships).forEach((relKey) => {
      const rel = trial.relationships[relKey];
      if (rel.links && rel.links.related) {
        expect(rel.links.related.href).toMatch(/^https?:\/\//);
      }
      if (rel.links && rel.links.self) {
        expect(rel.links.self.href).toMatch(/^https?:\/\//);
      }
    });
  });

  test('should validate array fields contain correct types', async ({ request }) => {
    const trialId = 'b9aa601d-bee1-4b97-909b-a3ce370d3a51';
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial/${trialId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const attributes = body.data.attributes;

    // Validate string arrays
    const stringArrayFields = [
      'field_ct_conditions',
      'field_ct_keywords',
      'field_ct_phases',
      'field_ct_std_ages',
      'field_ct_categories_debug',
      'field_ct_mesh_terms',
    ];

    for (const field of stringArrayFields) {
      if (attributes[field] !== null && attributes[field] !== undefined) {
        expect(Array.isArray(attributes[field])).toBe(true);
        if (attributes[field].length > 0) {
          attributes[field].forEach((item: any) => {
            expect(typeof item).toBe('string');
          });
        }
      }
    }
  });

  test('should validate date fields format', async ({ request }) => {
    const trialId = 'b9aa601d-bee1-4b97-909b-a3ce370d3a51';
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial/${trialId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const attributes = body.data.attributes;

    // Validate ISO 8601 date-time fields
    const dateTimeFields = [
      'revision_timestamp',
      'created',
      'changed',
    ];

    for (const field of dateTimeFields) {
      if (attributes[field] !== null && attributes[field] !== undefined) {
        expect(typeof attributes[field]).toBe('string');
        expect(attributes[field]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }
    }

    // Validate date-only fields (YYYY-MM-DD)
    const dateFields = [
      'field_ct_completion_date',
      'field_ct_first_post_date',
      'field_ct_first_submit_date',
      'field_ct_first_submit_qc_date',
      'field_ct_last_update_post_date',
      'field_ct_last_update_submit_date',
      'field_ct_primary_completion_date',
      'field_ct_start_date',
      'field_ct_status_verified_date',
    ];

    for (const field of dateFields) {
      if (attributes[field] !== null && attributes[field] !== undefined) {
        expect(typeof attributes[field]).toBe('string');
        expect(attributes[field]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  test('should validate relationship meta structure', async ({ request }) => {
    const trialId = 'b9aa601d-bee1-4b97-909b-a3ce370d3a51';
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial/${trialId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const relationships = body.data.relationships;

    // Validate that relationships with data have proper meta structure
    Object.keys(relationships).forEach((relKey) => {
      const rel = relationships[relKey];
      if (Array.isArray(rel.data) && rel.data.length > 0) {
        rel.data.forEach((item: any) => {
          expect(item).toHaveProperty('meta');
          expect(typeof item.meta).toBe('object');
          // Most relationships have drupal_internal__target_id
          if (item.meta.drupal_internal__target_id !== undefined) {
            expect(typeof item.meta.drupal_internal__target_id).toBe('number');
          }
          // Paragraph relationships have target_revision_id
          if (item.meta.target_revision_id !== undefined) {
            expect(typeof item.meta.target_revision_id).toBe('number');
          }
        });
      } else if (rel.data !== null && typeof rel.data === 'object') {
        expect(rel.data).toHaveProperty('meta');
        expect(typeof rel.data.meta).toBe('object');
      }
    });
  });

  test('should validate boolean fields', async ({ request }) => {
    const trialId = 'b9aa601d-bee1-4b97-909b-a3ce370d3a51';
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial/${trialId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const attributes = body.data.attributes;

    const booleanFields = [
      'status',
      'promote',
      'sticky',
      'default_langcode',
      'revision_translation_affected',
      'field_ct_gender_based',
      'field_ct_healthy_volunteers',
    ];

    for (const field of booleanFields) {
      if (attributes[field] !== undefined) {
        expect(typeof attributes[field]).toBe('boolean');
      }
    }
  });

  test('should validate numeric fields', async ({ request }) => {
    const trialId = 'b9aa601d-bee1-4b97-909b-a3ce370d3a51';
    const response = await request.get(`${TRIALS_API_BASE_URL}/node/clinical_trial/${trialId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const attributes = body.data.attributes;

    // Validate numeric fields
    expect(typeof attributes.drupal_internal__nid).toBe('number');
    expect(typeof attributes.drupal_internal__vid).toBe('number');
    expect(attributes.drupal_internal__nid).toBeGreaterThan(0);
    expect(attributes.drupal_internal__vid).toBeGreaterThan(0);

    if (attributes.field_ct_minimum_age_number !== null && attributes.field_ct_minimum_age_number !== undefined) {
      expect(typeof attributes.field_ct_minimum_age_number).toBe('number');
      expect(attributes.field_ct_minimum_age_number).toBeGreaterThanOrEqual(0);
    }

    if (attributes.field_ct_maximum_age_number !== null && attributes.field_ct_maximum_age_number !== undefined) {
      expect(typeof attributes.field_ct_maximum_age_number).toBe('number');
      expect(attributes.field_ct_maximum_age_number).toBeGreaterThanOrEqual(0);
    }
  });
});




