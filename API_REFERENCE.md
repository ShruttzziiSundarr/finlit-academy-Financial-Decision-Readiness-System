# FinLit Academy - API Reference

## GraphQL API Documentation

**Base URL:** `http://localhost:4000/graphql`
**Playground:** `http://localhost:4000/graphql` (development only)

---

## Authentication

All authenticated requests require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining Tokens

Use the `register` or `login` mutations to obtain tokens:

```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
    refreshToken
    user {
      id
      email
      username
    }
  }
}
```

### Refreshing Tokens

```graphql
mutation {
  refreshToken(refreshToken: "your_refresh_token") {
    token
    refreshToken
    user {
      id
      email
    }
  }
}
```

---

## User Management

### Register New User

```graphql
mutation {
  register(input: {
    email: "newuser@example.com"
    username: "newuser"
    password: "SecurePass123!"
    firstName: "John"
    lastName: "Doe"
  }) {
    token
    refreshToken
    user {
      id
      email
      username
      firstName
      lastName
      createdAt
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "newuser@example.com",
        "username": "newuser",
        "firstName": "John",
        "lastName": "Doe",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    }
  }
}
```

### Get Current User

```graphql
query {
  me {
    id
    email
    username
    firstName
    lastName
    avatar
    progress {
      coursesCompleted
      currentStreak
      level
      experiencePoints
    }
  }
}
```

---

## Portfolio Management

### Get Portfolio

```graphql
query {
  portfolio {
    id
    totalValue
    cashBalance
    holdings {
      id
      symbol
      name
      shares
      avgCostPerShare
      currentPrice
      totalValue
      gainLoss
      gainLossPercent
    }
    performanceData {
      totalGainLoss
      totalGainLossPercent
      dailyChange
      dailyChangePercent
      historicalData {
        date
        value
      }
    }
    transactions {
      id
      type
      symbol
      shares
      pricePerShare
      totalAmount
      timestamp
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "portfolio": {
      "id": "portfolio-123",
      "totalValue": 103450.75,
      "cashBalance": 23450.75,
      "holdings": [
        {
          "id": "holding-1",
          "symbol": "AAPL",
          "name": "Apple Inc.",
          "shares": 50,
          "avgCostPerShare": 150.00,
          "currentPrice": 175.50,
          "totalValue": 8775.00,
          "gainLoss": 1275.00,
          "gainLossPercent": 17.00
        }
      ],
      "performanceData": {
        "totalGainLoss": 3450.75,
        "totalGainLossPercent": 3.45,
        "dailyChange": 1250.30,
        "dailyChangePercent": 1.22,
        "historicalData": [
          {
            "date": "2024-01-01",
            "value": 100000
          }
        ]
      },
      "transactions": []
    }
  }
}
```

### Execute Trade

```graphql
mutation {
  executeTrade(input: {
    symbol: "AAPL"
    shares: 10
    type: BUY
  }) {
    id
    type
    symbol
    shares
    pricePerShare
    totalAmount
    timestamp
  }
}
```

**Response:**
```json
{
  "data": {
    "executeTrade": {
      "id": "transaction-456",
      "type": "BUY",
      "symbol": "AAPL",
      "shares": 10,
      "pricePerShare": 175.50,
      "totalAmount": 1755.00,
      "timestamp": "2024-01-15T14:30:00Z"
    }
  }
}
```

### Get Stock Quote

```graphql
query {
  stockQuote(symbol: "AAPL") {
    symbol
    name
    price
    change
    changePercent
    volume
    dayHigh
    dayLow
  }
}
```

### Search Stocks

```graphql
query {
  searchStocks(query: "Apple") {
    symbol
    name
    price
  }
}
```

---

## Budget Management

### Get Budget

```graphql
query {
  budget {
    id
    name
    totalIncome
    savingsGoal
    currentSavings
    categories {
      id
      name
      allocatedAmount
      spentAmount
      color
      icon
    }
    expenses {
      id
      categoryId
      description
      amount
      date
      recurring
      frequency
    }
  }
}
```

### Create Expense

```graphql
mutation {
  createExpense(input: {
    categoryId: "category-123"
    description: "Grocery shopping"
    amount: 85.50
    date: "2024-01-15"
    recurring: false
  }) {
    id
    description
    amount
    date
  }
}
```

### Update Expense

```graphql
mutation {
  updateExpense(
    id: "expense-456"
    input: {
      categoryId: "category-123"
      description: "Updated grocery shopping"
      amount: 92.30
      date: "2024-01-15"
      recurring: false
    }
  ) {
    id
    description
    amount
  }
}
```

### Delete Expense

```graphql
mutation {
  deleteExpense(id: "expense-456")
}
```

**Response:**
```json
{
  "data": {
    "deleteExpense": true
  }
}
```

---

## Learning & Courses

### Get All Courses

```graphql
query {
  courses(difficulty: BEGINNER) {
    id
    title
    description
    difficulty
    estimatedMinutes
    progress
    completed
  }
}
```

**Difficulty Options:** `BEGINNER`, `INTERMEDIATE`, `ADVANCED`

### Get Single Course with Modules

```graphql
query {
  course(id: "course-123") {
    id
    title
    description
    difficulty
    estimatedMinutes
    modules {
      id
      title
      content
      type
      order
      completed
    }
    progress
    completed
  }
}
```

### Get Recommended Courses

```graphql
query {
  recommendedCourses {
    id
    title
    description
    difficulty
  }
}
```

### Complete Module

```graphql
mutation {
  completeModule(moduleId: "module-456") {
    id
    title
    completed
  }
}
```

---

## Challenges & Leaderboards

### Get Challenges

```graphql
query {
  challenges(status: ACTIVE) {
    id
    title
    description
    type
    difficulty
    points
    startDate
    endDate
    participants
    status
  }
}
```

**Status Options:** `ACTIVE`, `COMPLETED`, `UPCOMING`
**Type Options:** `BUDGET`, `INVEST`, `SAVE`, `QUIZ`
**Difficulty Options:** `EASY`, `MEDIUM`, `HARD`

### Get Single Challenge

```graphql
query {
  challenge(id: "challenge-123") {
    id
    title
    description
    type
    difficulty
    points
    startDate
    endDate
    participants
    status
  }
}
```

### Get Leaderboard

```graphql
query {
  leaderboard(challengeId: "challenge-123") {
    challengeId
    entries {
      rank
      userId
      username
      avatar
      score
    }
  }
}
```

### Join Challenge

```graphql
mutation {
  joinChallenge(challengeId: "challenge-123") {
    id
    title
    participants
  }
}
```

### Submit Challenge Result

```graphql
mutation {
  submitChallengeResult(
    challengeId: "challenge-123"
    score: 850
  )
}
```

**Response:**
```json
{
  "data": {
    "submitChallengeResult": true
  }
}
```

---

## AI Chatbot

### Get Chat Session

```graphql
query {
  chatSession(id: "session-123") {
    id
    userId
    messages {
      id
      role
      content
      timestamp
    }
    createdAt
    updatedAt
  }
}
```

### Get Chat History

```graphql
query {
  chatHistory {
    id
    messages {
      id
      role
      content
      timestamp
    }
    createdAt
  }
}
```

### Send Message

```graphql
mutation {
  sendMessage(input: {
    sessionId: "session-123"  # Optional: creates new session if not provided
    message: "How should I start investing?"
  }) {
    id
    role
    content
    timestamp
  }
}
```

**Response:**
```json
{
  "data": {
    "sendMessage": {
      "id": "message-789",
      "role": "assistant",
      "content": "Great question! Here are some steps to start investing:\n\n1. Build an emergency fund first (3-6 months expenses)\n2. Pay off high-interest debt\n3. Start with low-cost index funds\n4. Consider your risk tolerance\n5. Diversify your portfolio\n\nWould you like me to explain any of these in more detail?",
      "timestamp": "2024-01-15T15:45:00Z"
    }
  }
}
```

---

## Subscriptions (WebSocket)

### Portfolio Updates

```graphql
subscription {
  portfolioUpdated(userId: "user-123") {
    id
    totalValue
    cashBalance
    holdings {
      symbol
      currentPrice
      gainLoss
    }
  }
}
```

### Leaderboard Updates

```graphql
subscription {
  challengeLeaderboardUpdated(challengeId: "challenge-123") {
    challengeId
    entries {
      rank
      username
      score
    }
  }
}
```

### Chat Messages

```graphql
subscription {
  messageSent(sessionId: "session-123") {
    id
    role
    content
    timestamp
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["me"],
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ],
  "data": null
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHENTICATED` | No valid auth token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `BAD_USER_INPUT` | Invalid input data | 400 |
| `NOT_FOUND` | Resource not found | 404 |
| `INTERNAL_SERVER_ERROR` | Server error | 500 |

### Error Examples

**Invalid Credentials:**
```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**Insufficient Funds:**
```json
{
  "errors": [
    {
      "message": "Insufficient funds",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

---

## Rate Limiting

**Limits:**
- 100 requests per 15 minutes per IP
- Authenticated users: 200 requests per 15 minutes

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

**Rate Limit Exceeded:**
```json
{
  "errors": [
    {
      "message": "Too many requests from this IP, please try again later.",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED"
      }
    }
  ]
}
```

---

## Pagination

For queries returning lists, use `limit` and `offset`:

```graphql
query {
  challenges(status: ACTIVE, limit: 10, offset: 0) {
    id
    title
  }
}
```

---

## Filtering & Sorting

### Filter by Difficulty

```graphql
query {
  courses(difficulty: INTERMEDIATE) {
    id
    title
  }
}
```

### Filter by Status

```graphql
query {
  challenges(status: ACTIVE) {
    id
    title
  }
}
```

---

## Best Practices

### 1. Query Only What You Need

❌ **Bad:**
```graphql
query {
  courses {
    id
    title
    description
    difficulty
    estimatedMinutes
    modules {
      id
      title
      content
      type
      order
      completed
    }
    progress
    completed
  }
}
```

✅ **Good:**
```graphql
query {
  courses {
    id
    title
    difficulty
  }
}
```

### 2. Use Variables

❌ **Bad:**
```graphql
mutation {
  executeTrade(input: {
    symbol: "AAPL"
    shares: 10
    type: BUY
  }) {
    id
  }
}
```

✅ **Good:**
```graphql
mutation ExecuteTrade($input: TradeInput!) {
  executeTrade(input: $input) {
    id
  }
}
```

**Variables:**
```json
{
  "input": {
    "symbol": "AAPL",
    "shares": 10,
    "type": "BUY"
  }
}
```

### 3. Handle Errors

```javascript
try {
  const { data, errors } = await apolloClient.mutate({
    mutation: EXECUTE_TRADE,
    variables: { input: tradeData }
  });

  if (errors) {
    console.error('GraphQL errors:', errors);
    return;
  }

  // Handle success
  console.log('Trade executed:', data.executeTrade);
} catch (error) {
  console.error('Network error:', error);
}
```

### 4. Use Aliases for Multiple Queries

```graphql
query {
  beginnerCourses: courses(difficulty: BEGINNER) {
    id
    title
  }
  intermediateCourses: courses(difficulty: INTERMEDIATE) {
    id
    title
  }
}
```

---

## Code Examples

### React Hook with Apollo Client

```typescript
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_PORTFOLIO = gql`
  query GetPortfolio {
    portfolio {
      totalValue
      cashBalance
      holdings {
        symbol
        shares
        currentPrice
      }
    }
  }
`;

const EXECUTE_TRADE = gql`
  mutation ExecuteTrade($input: TradeInput!) {
    executeTrade(input: $input) {
      id
      symbol
      shares
      totalAmount
    }
  }
`;

function PortfolioComponent() {
  const { data, loading, error } = useQuery(GET_PORTFOLIO);
  const [executeTrade] = useMutation(EXECUTE_TRADE);

  const handleBuy = async (symbol: string, shares: number) => {
    try {
      const { data } = await executeTrade({
        variables: {
          input: { symbol, shares, type: 'BUY' }
        }
      });
      console.log('Trade executed:', data);
    } catch (error) {
      console.error('Trade failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Portfolio Value: ${data.portfolio.totalValue}</h1>
      {/* Render holdings */}
    </div>
  );
}
```

### WebSocket Subscription

```typescript
import { gql, useSubscription } from '@apollo/client';

const PORTFOLIO_UPDATED = gql`
  subscription PortfolioUpdated($userId: ID!) {
    portfolioUpdated(userId: $userId) {
      totalValue
      holdings {
        symbol
        currentPrice
      }
    }
  }
`;

function PortfolioLive({ userId }) {
  const { data, loading } = useSubscription(PORTFOLIO_UPDATED, {
    variables: { userId }
  });

  if (loading) return <div>Connecting...</div>;

  return (
    <div>
      <h2>Live Portfolio: ${data.portfolioUpdated.totalValue}</h2>
    </div>
  );
}
```

---

## Testing with cURL

### Register User

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(input: { email: \"test@example.com\", username: \"testuser\", password: \"Password123!\", firstName: \"Test\", lastName: \"User\" }) { token user { id email } } }"
  }'
```

### Query with Authentication

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { portfolio { totalValue cashBalance } }"
  }'
```

---

## Additional Resources

- **GraphQL Playground:** http://localhost:4000/graphql (development)
- **Schema Documentation:** Auto-generated in Playground
- **Type Definitions:** [backend/src/graphql/schema.ts](backend/src/graphql/schema.ts)

---

**Last Updated:** January 2024
**API Version:** 1.0.0
