# Microservice API Tests

Playwright-based API test suite for testing REST API and JSON:API endpoints across multiple microservices.

## Project Structure

```
tests/
├── api/
│   ├── profile-api/          # Profile API tests
│   │   ├── department/       # Department endpoint tests
│   │   ├── group/            # Group endpoint tests
│   │   ├── profile/          # Profile endpoint tests
│   │   ├── research-group/   # Research group endpoint tests
│   │   └── sub-group/        # Sub-group endpoint tests
│   └── trial-api/            # Trial API tests
└── utils/
    └── api-config.ts         # Shared API configuration and utilities
```

## Environment Variables

Set these environment variables to configure the API endpoints:

```bash
# REST API Base URL
export REST_API_BASE_URL=https://your-api-domain.com/api/v1

# JSON:API Base URL  
export JSON_API_BASE_URL=https://your-api-domain.com/jsonapi/index

# API Timeout (optional, defaults to 30000ms)
export API_TIMEOUT=30000

# API Key for QualityWatcher AI
export QUALITY_WATCHER_API_KEY=your-api-key-here

# Project Id for QualityWatcher AI
export QUALITY_WATCHER_PROJECT_ID=your-project-id-here
```

Or create a `.env` file in the project root:

```bash
REST_API_BASE_URL=https://your-api-domain.com/api/v1
JSON_API_BASE_URL=https://your-api-domain.com/jsonapi/index
API_TIMEOUT=30000
QUALITY_WATCHER_API_KEY=your-api-key-here
QUALITY_WATCHER_PROJECT_ID=your-project-id-here
```

## Running Tests

```bash
# Run all tests
npm test

# Run all API tests
npm run test:api

# Run tests in UI mode (for debugging)
npm run test:ui

# Run tests in headed mode (with browser visible)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report
```

## Test Types

The test suite includes:

- **REST API Tests**: Tests for REST API endpoints (`rest-api-*.spec.ts`)
- **JSON:API Tests**: Tests for JSON:API endpoints (`json-api-*.spec.ts`)
- **Schema Validation Tests**: Tests for response schema validation (`schema-validation.spec.ts`)

## Test Coverage

### Profile API
- Departments
- Groups
- Profiles
- Research Groups
- Sub-Groups

### Trial API
- Basic endpoint tests
- Schema validation tests

