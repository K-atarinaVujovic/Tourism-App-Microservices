CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    blocked_at TIMESTAMPTZ,
    blocked_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
