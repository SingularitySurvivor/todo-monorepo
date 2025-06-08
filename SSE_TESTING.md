# SSE Testing Documentation

This document describes the SSE (Server-Sent Events) testing infrastructure for the todo-monorepo project.

## Overview

The SSE implementation has been refactored to use a **single user-global connection approach** instead of separate list-specific connections. This simplifies the architecture and reduces server resource usage.

## Architecture Changes

### Before (Dual Connection)
- **List-specific SSE**: `/api/sse/lists/:listId` - One connection per list
- **User-global SSE**: `/api/sse/user` - One connection for user-wide events
- **Dual broadcasting** - Events sent to both connection types

### After (Single Connection)
- **User-global SSE only**: `/api/sse/user` - One connection per user
- **Single broadcasting** - All events sent to user connections with `listId` included
- **Frontend filtering** - Frontend filters events by `listId` as needed

## Test Files

### Location: `/home/paul/development/sleekflow/todo-monorepo/`

### 1. Comprehensive SSE Test (`sse-curl-test.sh`)
**Purpose**: End-to-end testing of the new SSE implementation

**What it tests**:
- User registration and authentication
- Todo list creation
- SSE connection establishment to `/api/sse/user`
- Verification that list-specific endpoints are removed (404)
- Todo creation, update, and deletion events
- Event reception with correct `listId` included
- Cleanup of test data

**Usage**:
```bash
chmod +x sse-curl-test.sh
./sse-curl-test.sh
```

**Expected Output**:
- ✅ User registration and list creation
- ✅ SSE connection established
- ✅ List-specific endpoints correctly removed (404)
- ✅ Todo events received with correct `listId`
- ✅ Ping events for connection keepalive

### 2. Debug SSE Test (`debug-sse.sh`)
**Purpose**: Simplified test for debugging server-side broadcasting

**What it tests**:
- User registration and list creation
- Todo creation without SSE connection
- Server console log verification
- Broadcast function invocation

**Usage**:
```bash
chmod +x debug-sse.sh
./debug-sse.sh
# Check server console for broadcast logs
```

**Expected Server Logs**:
```
Broadcasting todo creation: listId=..., todoId=..., userId=...
SSE: broadcast called - listId=..., eventType=todo:created, excludeUserId=...
SSE: List ... has members for broadcast: [...]
SSE: Broadcasted todo:created to N user clients for list ...
```

## SSE Event Format

All events now include the `listId` for frontend filtering:

```json
{
  "type": "todo:created|todo:updated|todo:deleted|list:updated|member:added|member:removed|ping",
  "data": { /* event-specific data */ },
  "listId": "64abc123...", // Specific list ID or "global" for user-level events
  "userId": "64def456...", // User who triggered the event
  "timestamp": "2025-06-05T11:47:54.127Z"
}
```

## Event Types

### Todo Events
- **`todo:created`** - New todo added to a list
- **`todo:updated`** - Todo modified (name, status, priority, etc.)
- **`todo:deleted`** - Todo removed from a list

### List Events
- **`list:updated`** - List metadata changed (name, description)
- **`member:added`** - User added to list
- **`member:removed`** - User removed from list
- **`member:role_changed`** - User role modified in list

### System Events
- **`ping`** - Keepalive event (every 30 seconds)

## Frontend Integration

### Before (Multiple Connections)
```typescript
// List-specific connection for list pages
const listSSE = useSSE(listId, handleEvent);

// User-global connection for global todos page
const userSSE = useUserGlobalSSE(handleEvent);
```

### After (Single Connection)
```typescript
// Single user connection for all pages
const userSSE = useUserGlobalSSE(handleEvent);

// Frontend filters events by listId
const handleEvent = (event) => {
  if (event.listId === currentListId || showAllLists) {
    // Process event
  }
};
```

## Testing with Curl

### Connect to SSE Endpoint
```bash
TOKEN="your-jwt-token"
curl -N -H "Authorization: Bearer $TOKEN" \
  -H "Accept: text/event-stream" \
  "http://localhost:3001/api/sse/user"
```

### Create Todo to Trigger Event
```bash
curl -X POST "http://localhost:3001/api/todos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Todo","listId":"your-list-id"}'
```

## Verification Checklist

When testing SSE functionality:

- [ ] List-specific endpoints return 404
- [ ] User SSE connection establishes successfully
- [ ] Ping events received every 30 seconds
- [ ] Todo creation triggers `todo:created` event
- [ ] Todo updates trigger `todo:updated` event
- [ ] Todo deletion triggers `todo:deleted` event
- [ ] Events include correct `listId`
- [ ] Only authorized users receive events for their lists
- [ ] Events exclude the user who triggered them (`excludeUserId`)

## Troubleshooting

### No Events Received
1. Check server console for broadcast logs
2. Verify user has access to the list
3. Ensure broadcast functions are being called
4. Check SSE connection status

### Connection Issues
1. Verify server health: `curl http://localhost:3001/health`
2. Check authentication token validity
3. Ensure proper SSE headers: `Accept: text/event-stream`

### Server Logs
Watch for these console messages:
- `SSE user client connected: ... for user ...`
- `Broadcasting todo creation: listId=..., todoId=..., userId=...`
- `SSE: broadcast called - listId=..., eventType=..., excludeUserId=...`
- `SSE: Broadcasted ... to N user clients for list ...`

## Files Modified

### Server-Side
- `/packages/api/src/routes/sseRoutes.ts` - Removed list-specific route
- `/packages/api/src/controllers/sseController.ts` - Removed list-specific controller
- `/packages/api/src/services/sseService.ts` - Simplified to single broadcast method
- `/packages/api/src/controllers/todoController.ts` - Uses simplified broadcast

### Client-Side (Future)
- `/packages/web/src/hooks/useSSE.ts` - Will migrate to user-global only
- `/packages/web/src/components/pages/GlobalTodosPage.tsx` - Already uses user-global
- `/packages/web/src/components/pages/TodoListDetailPage.tsx` - Will migrate

## Benefits of Single Connection Approach

1. **Reduced Server Load** - Fewer SSE connections per user
2. **Simplified Code** - Single broadcast method, no dual logic
3. **Better Scalability** - Fewer resources per user
4. **Easier Debugging** - Single code path to maintain
5. **Consistent Events** - All events formatted the same way
6. **Frontend Flexibility** - Can filter events as needed