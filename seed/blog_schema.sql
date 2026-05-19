-- ============================================================
-- BLOG SERVICE SCHEMA
-- Tables: blogs, blog_images, comments, likes
-- ============================================================

CREATE TABLE IF NOT EXISTS blogs (
    id          BIGSERIAL PRIMARY KEY,
    author_id   BIGINT,
    title       VARCHAR(255),
    description TEXT,
    created_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_images (
    blog_id     BIGINT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    image_url   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS comments (
    id              BIGSERIAL PRIMARY KEY,
    blog_id         BIGINT,
    author_id       BIGINT,
    author_username VARCHAR(255),
    text            TEXT,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE TABLE IF NOT EXISTS likes (
    id      BIGSERIAL PRIMARY KEY,
    blog_id BIGINT,
    user_id BIGINT,
    CONSTRAINT uq_likes_blog_user UNIQUE (blog_id, user_id)
);
