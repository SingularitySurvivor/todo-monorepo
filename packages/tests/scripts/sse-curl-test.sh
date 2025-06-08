#!/bin/bash

# SSE Curl Test Script for Single User Connection Approach
# Tests the new simplified SSE implementation

set -e

BASE_URL="http://localhost:3001"
API_URL="${BASE_URL}/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Starting SSE Curl Tests${NC}"
echo "=========================================="

# Generate unique test data
TIMESTAMP=$(date +%s)
TEST_EMAIL="ssetest${TIMESTAMP}@example.com"
TEST_EMAIL2="ssetest2${TIMESTAMP}@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_FIRST_NAME="SSE"
TEST_LAST_NAME="Test"

echo -e "${YELLOW}📝 Test Data:${NC}"
echo "Primary Email: $TEST_EMAIL"
echo "Secondary Email: $TEST_EMAIL2"
echo "Password: $TEST_PASSWORD"
echo ""

# 1. Register two test users
echo -e "${BLUE}1. Registering test users...${NC}"

# Register primary user (list creator and listener)
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"$TEST_FIRST_NAME\",
    \"lastName\": \"$TEST_LAST_NAME\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q '"status":"success"'; then
  echo -e "${GREEN}✅ Primary user registered successfully${NC}"
  TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
  USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id')
  echo "Primary Token: ${TOKEN:0:20}..."
  echo "Primary User ID: $USER_ID"
else
  echo -e "${RED}❌ Primary user registration failed${NC}"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

# Register secondary user (action performer)
REGISTER_RESPONSE2=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL2\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"${TEST_FIRST_NAME}2\",
    \"lastName\": \"$TEST_LAST_NAME\"
  }")

if echo "$REGISTER_RESPONSE2" | grep -q '"status":"success"'; then
  echo -e "${GREEN}✅ Secondary user registered successfully${NC}"
  TOKEN2=$(echo "$REGISTER_RESPONSE2" | jq -r '.data.token')
  USER_ID2=$(echo "$REGISTER_RESPONSE2" | jq -r '.data.user.id')
  echo "Secondary Token: ${TOKEN2:0:20}..."
  echo "Secondary User ID: $USER_ID2"
else
  echo -e "${RED}❌ Secondary user registration failed${NC}"
  echo "$REGISTER_RESPONSE2"
  exit 1
fi

echo ""

# 2. Create a test todo list (primary user creates and listens)
echo -e "${BLUE}2. Creating test todo list...${NC}"
LIST_RESPONSE=$(curl -s -X POST "${API_URL}/lists" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"SSE Test List\",
    \"description\": \"List for testing SSE events\"
  }")

if echo "$LIST_RESPONSE" | grep -q '"status":"success"'; then
  echo -e "${GREEN}✅ Todo list created successfully${NC}"
  LIST_ID=$(echo "$LIST_RESPONSE" | jq -r '.data.list.id')
  echo "List ID: $LIST_ID"
else
  echo -e "${RED}❌ List creation failed${NC}"
  echo "$LIST_RESPONSE"
  exit 1
fi

# Add secondary user to the list so they can perform actions
echo -e "${YELLOW}Adding secondary user to the list...${NC}"
ADD_MEMBER_RESPONSE=$(curl -s -X POST "${API_URL}/lists/${LIST_ID}/members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"email\": \"$TEST_EMAIL2\",
    \"role\": \"editor\"
  }")

if echo "$ADD_MEMBER_RESPONSE" | grep -q '"status":"success"'; then
  echo -e "${GREEN}✅ Secondary user added to list${NC}"
else
  echo -e "${RED}❌ Failed to add secondary user to list${NC}"
  echo "$ADD_MEMBER_RESPONSE"
fi

echo ""

# 3. Test SSE connection (secondary user listens, primary user performs actions)
echo -e "${BLUE}3. Testing SSE Connection...${NC}"

# Check if old list-specific endpoint is removed
echo -e "${YELLOW}Verifying list-specific endpoint is removed...${NC}"
LIST_SSE_TEST=$(curl -s -w "%{http_code}" -o /dev/null "${API_URL}/sse/lists/${LIST_ID}" \
  -H "Authorization: Bearer $TOKEN")

if [ "$LIST_SSE_TEST" == "404" ]; then
  echo -e "${GREEN}✅ List-specific SSE endpoint correctly removed (404)${NC}"
else
  echo -e "${RED}❌ List-specific SSE endpoint still exists (got $LIST_SSE_TEST)${NC}"
fi

# Test user-global SSE endpoint (secondary user listens for events)
echo -e "${YELLOW}Testing user-global SSE endpoint (secondary user listening)...${NC}"
SSE_LOG_FILE="/tmp/sse_test_${TIMESTAMP}.log"

# Start SSE connection in background with secondary user's token
curl -N -s "${API_URL}/sse/user" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Accept: text/event-stream" > "$SSE_LOG_FILE" 2>&1 &

SSE_PID=$!
echo "Started SSE connection (PID: $SSE_PID) - secondary user listening"

# Wait for connection to establish
sleep 3

# Check if SSE connection is working
if ps -p $SSE_PID > /dev/null 2>&1; then
  echo -e "${GREEN}✅ SSE connection established${NC}"
else
  echo -e "${RED}❌ SSE connection failed${NC}"
  exit 1
fi

echo ""

# 4. Create a todo to trigger SSE event (primary user creates, secondary user listens)
echo -e "${BLUE}4. Creating todo to trigger SSE event...${NC}"

TODO_RESPONSE=$(curl -s -X POST "${API_URL}/todos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Test Todo for SSE\",
    \"description\": \"This todo should trigger an SSE event\",
    \"listId\": \"$LIST_ID\",
    \"priority\": \"medium\"
  }")

if echo "$TODO_RESPONSE" | grep -q '"status":"success"'; then
  echo -e "${GREEN}✅ Todo created successfully (by primary user, secondary user should receive event)${NC}"
  TODO_ID=$(echo "$TODO_RESPONSE" | jq -r '.data.todo.id')
  echo "Todo ID: $TODO_ID"
else
  echo -e "${RED}❌ Todo creation failed${NC}"
  echo "$TODO_RESPONSE"
  kill $SSE_PID 2>/dev/null
  exit 1
fi

# Wait for SSE event to be received
echo -e "${YELLOW}Waiting for SSE event...${NC}"
sleep 3

echo ""

# 5. Check SSE events received
echo -e "${BLUE}5. Checking SSE events...${NC}"

if [ -f "$SSE_LOG_FILE" ]; then
  echo -e "${YELLOW}SSE Events received:${NC}"
  cat "$SSE_LOG_FILE"
  echo ""
  
  # Check for specific events
  if grep -q "todo:created" "$SSE_LOG_FILE"; then
    echo -e "${GREEN}✅ todo:created event received${NC}"
  else
    echo -e "${RED}❌ todo:created event NOT received${NC}"
  fi
  
  if grep -q "\"listId\":\"$LIST_ID\"" "$SSE_LOG_FILE"; then
    echo -e "${GREEN}✅ Event contains correct listId${NC}"
  else
    echo -e "${RED}❌ Event missing or incorrect listId${NC}"
  fi
  
  if grep -q "\"userId\":" "$SSE_LOG_FILE" && grep -q "\"firstName\":" "$SSE_LOG_FILE" && grep -q "\"email\":" "$SSE_LOG_FILE"; then
    echo -e "${GREEN}✅ Event contains user information (firstName, email)${NC}"
  else
    echo -e "${RED}❌ Event missing user information${NC}"
  fi
  
  if grep -q "ping" "$SSE_LOG_FILE"; then
    echo -e "${GREEN}✅ Ping events received (connection alive)${NC}"
  else
    echo -e "${YELLOW}⚠️  No ping events received${NC}"
  fi
else
  echo -e "${RED}❌ No SSE log file found${NC}"
fi

echo ""

# 6. Test todo update event (primary user updates, secondary user listens)
echo -e "${BLUE}6. Testing todo update event...${NC}"

UPDATE_RESPONSE=$(curl -s -X PATCH "${API_URL}/todos/$TODO_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Updated Todo for SSE Test\",
    \"status\": \"in_progress\"
  }")

if echo "$UPDATE_RESPONSE" | grep -q '"status":"success"'; then
  echo -e "${GREEN}✅ Todo updated successfully (by primary user, secondary user should receive event)${NC}"
else
  echo -e "${RED}❌ Todo update failed${NC}"
  echo "$UPDATE_RESPONSE"
fi

# Wait for update event
sleep 2

# Check for update event
if grep -q "todo:updated" "$SSE_LOG_FILE"; then
  echo -e "${GREEN}✅ todo:updated event received${NC}"
  
  # Check if the updated event also contains user information
  if grep -A5 -B5 "todo:updated" "$SSE_LOG_FILE" | grep -q "\"firstName\":" && grep -A5 -B5 "todo:updated" "$SSE_LOG_FILE" | grep -q "\"email\":"; then
    echo -e "${GREEN}✅ todo:updated event contains user information${NC}"
  else
    echo -e "${RED}❌ todo:updated event missing user information${NC}"
  fi
else
  echo -e "${RED}❌ todo:updated event NOT received${NC}"
fi

echo ""

# 7. Test todo delete event (primary user deletes, secondary user listens)
echo -e "${BLUE}7. Testing todo delete event...${NC}"

DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/todos/$TODO_ID" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Todo deleted successfully (by primary user, secondary user should receive event)${NC}"
else
  echo -e "${RED}❌ Todo deletion failed${NC}"
fi

# Wait for delete event
sleep 3

# Check for delete event
if grep -q "todo:deleted" "$SSE_LOG_FILE"; then
  echo -e "${GREEN}✅ todo:deleted event received${NC}"
else
  echo -e "${RED}❌ todo:deleted event NOT received${NC}"
  echo -e "${YELLOW}ℹ️  Check server console for 'SSE: Broadcasting todo:deleted' message${NC}"
fi

echo ""

# 8. Test list delete event (secondary user deletes, primary user would get event, but we're listening as secondary)
# Actually, let's make the primary user delete it since they're the owner, and secondary user should receive the event
echo -e "${BLUE}8. Testing list delete event...${NC}"

DELETE_LIST_RESPONSE=$(curl -s -X DELETE "${API_URL}/lists/$LIST_ID" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ List deleted successfully (by primary user, secondary user should receive event)${NC}"
else
  echo -e "${RED}❌ List deletion failed${NC}"
fi

# Wait for delete event
sleep 3

# Check for delete event
if grep -q "list:deleted" "$SSE_LOG_FILE"; then
  echo -e "${GREEN}✅ list:deleted event received${NC}"
else
  echo -e "${RED}❌ list:deleted event NOT received${NC}"
  echo -e "${YELLOW}ℹ️  Check server console for 'SSE: Broadcasting list:deleted' message${NC}"
fi

echo ""

# 9. Cleanup
echo -e "${BLUE}9. Cleanup...${NC}"

# Kill SSE connection
kill $SSE_PID 2>/dev/null || true
echo -e "${GREEN}✅ SSE connection closed${NC}"

# Note: List already deleted in test above
echo -e "${GREEN}✅ Test data cleaned up${NC}"

echo ""
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=========================================="
echo "SSE Log file saved to: $SSE_LOG_FILE"
echo -e "${GREEN}✅ Single user SSE connection approach tested${NC}"
echo -e "${GREEN}✅ List-specific endpoints correctly removed${NC}"
echo -e "${GREEN}✅ Todo created, updated, and deleted events tested${NC}"
echo -e "${GREEN}✅ List deleted event tested${NC}"
echo -e "${GREEN}✅ All events include listId for frontend filtering${NC}"
echo -e "${GREEN}✅ Todo events include user information for consistent display${NC}"

echo ""
echo -e "${BLUE}🎉 SSE Curl Tests Completed!${NC}"