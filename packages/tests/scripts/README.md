# SSE Test Scripts

This directory contains comprehensive test scripts for Server-Sent Events (SSE) functionality in the todo application.

## Available Scripts

### 1. `sse-comprehensive-test.sh` (Recommended)
The main test runner that can execute all other tests in a coordinated manner.

**Usage:**
```bash
# Run all tests
./sse-comprehensive-test.sh --all

# Run only frontend tests
./sse-comprehensive-test.sh --frontend-only

# Run only curl API tests
./sse-comprehensive-test.sh --curl-only

# Run only debug tests
./sse-comprehensive-test.sh --debug-only
```

### 2. `sse-curl-test.sh`
Comprehensive curl-based test that validates all SSE events including:
- todo:created
- todo:updated  
- todo:deleted
- **list:deleted** (newly added)

**Usage:**
```bash
./sse-curl-test.sh
```

### 3. `test-frontend-sse.sh`
Tests the frontend SSE migration to ensure all pages use the single user-global SSE connection.

**Usage:**
```bash
./test-frontend-sse.sh
```

### 4. `debug-sse.sh`
Simple debug script to test SSE broadcasting without maintaining connections.

**Usage:**
```bash
./debug-sse.sh
```

## Features Tested

### SSE Events
- ✅ `todo:created` - When a new todo is created
- ✅ `todo:updated` - When a todo is modified
- ✅ `todo:deleted` - When a todo is deleted
- ✅ `list:updated` - When list details are changed
- ✅ `list:deleted` - **NEW:** When a list is deleted
- ✅ `member:added` - When a member is added to a list
- ✅ `member:removed` - When a member is removed from a list
- ✅ `member:role_changed` - When a member's role is updated
- ✅ `ping` - Keep-alive events

### Architecture
- ✅ Single user-global SSE connection
- ✅ Event filtering by listId on frontend
- ✅ Proper event broadcasting to list members
- ✅ Connection keep-alive mechanism
- ✅ Graceful connection cleanup

## Prerequisites

1. **Server Running:** Ensure the API server is running on `http://localhost:3001`
2. **Database:** MongoDB should be running and accessible
3. **Dependencies:** `jq` and `curl` must be installed

## Test Data

All tests create temporary users and data with unique timestamps to avoid conflicts. Test data is automatically cleaned up after each test run.

## Troubleshooting

### No Events Received
1. Check server logs for SSE broadcasting messages
2. Verify the API server is running on port 3001
3. Ensure MongoDB is running and accessible

### Permission Denied
```bash
chmod +x *.sh
```

### jq Command Not Found
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

## Recent Changes

### List Deletion SSE Support
- Added `list:deleted` event type to SSE interface
- Updated backend controller to broadcast deletion events
- Added frontend event handlers for list deletion
- Updated test scripts to validate list deletion events

### Script Consolidation
- Moved all SSE test scripts to `packages/tests/scripts/`
- Created comprehensive test runner
- Added proper documentation and usage examples