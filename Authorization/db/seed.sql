-- Seed data - default users
-- NOTE: These passwords are hashed using bcrypt (cost 10)
-- The plaintext passwords are shown in comments for development purposes only

-- Example admin user:
-- email: admin@example.com
-- password: Password123!
INSERT INTO users (email, password_hash, role)
VALUES (
    'admin@example.com',
    '$2a$10$wHqW3Vj6KzZ9ZVf2wz4p0eV8Y5fHj9KxY5Q1g5v2Ygq3YjLw1K0e6',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Example regular user:
-- email: user@example.com
-- password: Password123!
INSERT INTO users (email, password_hash, role)
VALUES (
    'user@example.com',
    '$2a$10$wHqW3Vj6KzZ9ZVf2wz4p0eV8Y5fHj9KxY5Q1g5v2Ygq3YjLw1K0e6',
    'user'
)
ON CONFLICT (email) DO NOTHING;
