-- Jhovanna's Hair Salon: database structure.
-- Runs on every server start, so every statement must be safe to repeat (IF NOT EXISTS).

-- ── Service catalog ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(60) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
    id               SERIAL PRIMARY KEY,
    category_id      INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name             VARCHAR(100) NOT NULL,
    slug             VARCHAR(120) UNIQUE NOT NULL,
    description      TEXT NOT NULL,
    duration_minutes SMALLINT NOT NULL CHECK (duration_minutes > 0),
    image_url        VARCHAR(255),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_prices (
    service_id  INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    hair_length VARCHAR(10) NOT NULL CHECK (hair_length IN ('short', 'mid', 'long')),
    price       NUMERIC(7, 2) NOT NULL CHECK (price >= 0),
    PRIMARY KEY (service_id, hair_length)
);


-- ── Contact messages ───────────────────────────────────────────
-- status moves through a small workflow: received → replied → closed

CREATE TABLE IF NOT EXISTS contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    message    TEXT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'received'
               CHECK (status IN ('received', 'replied', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Roles and users ────────────────────────────────────────────
-- The three roles always exist; ON CONFLICT skips the ones already saved

CREATE TABLE IF NOT EXISTS roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('admin'), ('stylist'), ('client')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash CHAR(60) NOT NULL,   -- bcrypt hashes are always 60 characters
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);