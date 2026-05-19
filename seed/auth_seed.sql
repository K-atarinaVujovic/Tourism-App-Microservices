-- ============================================================
-- AUTH SERVICE SEED
-- Existing: user id=1 (admin), user id=2 (user)
-- New: user3–user6, all role 'user'
-- Passwords are plain 'password' — hash before use
-- ============================================================

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

INSERT INTO users (username, email, password_hash, role) VALUES
('user3', 'user3@example.com', '$2b$10$Fyds1M6CRV93il5EycOCneGi0RZ9BVz0Vjf9WnqpiidVJ1KHyrheq', 'user'),
('user4', 'user4@example.com', '$2b$10$Fyds1M6CRV93il5EycOCneGi0RZ9BVz0Vjf9WnqpiidVJ1KHyrheq', 'user'),
('user5', 'user5@example.com', '$2b$10$Fyds1M6CRV93il5EycOCneGi0RZ9BVz0Vjf9WnqpiidVJ1KHyrheq', 'user'),
('user6', 'user6@example.com', '$2b$10$Fyds1M6CRV93il5EycOCneGi0RZ9BVz0Vjf9WnqpiidVJ1KHyrheq', 'user');

-- Expected resulting IDs:
-- 1 = admin
-- 2 = user
-- 3 = user3
-- 4 = user4
-- 5 = user5
-- 6 = user6
