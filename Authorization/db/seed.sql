-- Seed data - default users
-- NOTE: These passwords are hashed using bcrypt (cost 10)
-- The plaintext passwords are shown in comments for development purposes only

-- Example admin user:
-- username: admin
-- email: admin@example.com
-- password: Password123!
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin',
    'admin@example.com',
    '$2b$10$Fyds1M6CRV93il5EycOCneGi0RZ9BVz0Vjf9WnqpiidVJ1KHyrheq',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Example regular user:
-- username: user
-- email: user@example.com
-- password: Password123!
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'user',
    'user@example.com',
    '$2b$10$Fyds1M6CRV93il5EycOCneGi0RZ9BVz0Vjf9WnqpiidVJ1KHyrheq',
    'user'
)
ON CONFLICT (email) DO NOTHING;
