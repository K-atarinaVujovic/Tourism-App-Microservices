-- ============================================================
-- TOURS SERVICE SCHEMA
-- Tables: tours, tour_tags, tour_reviews, tour_review_images, key_points
-- ============================================================

CREATE TABLE IF NOT EXISTS tours (
    id               BIGSERIAL PRIMARY KEY,
    author_id        BIGINT,
    author_username  VARCHAR(255),
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    difficulty       VARCHAR(50),
    status           VARCHAR(50),
    price            DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS tour_tags (
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    tags    VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tour_reviews (
    id               BIGSERIAL PRIMARY KEY,
    tour_id          BIGINT,
    tourist_id       BIGINT,
    tourist_username VARCHAR(255),
    rating           INTEGER,
    comment          TEXT,
    visited_at       DATE,
    commented_at     TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tour_review_images (
    review_id   BIGINT NOT NULL REFERENCES tour_reviews(id) ON DELETE CASCADE,
    image_url   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS key_points (
    id          BIGSERIAL PRIMARY KEY,
    tour_id     BIGINT,
    name        VARCHAR(255),
    description TEXT,
    type        VARCHAR(50),
    image_url   VARCHAR(255),
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION
);
