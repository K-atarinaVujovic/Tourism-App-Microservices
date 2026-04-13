# Register new user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"newuser@example.com","password":"MyPassword123!"}'

# Expected response:
# {
#   "user_id": "550e8400-e29b-41d4-a716-446655440000",
#   "username": "newuser",
#   "email": "newuser@example.com",
#   "role": "user",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }

# Login with username
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"newuser","password":"MyPassword123!"}'

# Login with email
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"newuser@example.com","password":"MyPassword123!"}'
