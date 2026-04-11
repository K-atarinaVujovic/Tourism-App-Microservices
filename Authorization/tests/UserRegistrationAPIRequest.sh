# Register new user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"MyPassword123!"}'

# Expected response:
# {
#   "user_id": "550e8400-e29b-41d4-a716-446655440000",
#   "email": "newuser@example.com",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }
