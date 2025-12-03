-- Initialize the database with a users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, age, email, phone) VALUES
    (1, 'John Doe', 25, 'john.doe@example.com', '123-456-7890'),
    (2, 'Jane Smith', 30, 'jane.smith@example.com', '098-765-4321'),
    (4, 'Bob Johnson', 35, 'bob.johnson@example.com', '555-123-4567')
ON CONFLICT (email) DO NOTHING;

-- Ensure the users sequence is ahead of the max id to avoid PK collisions
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        ALTER TABLE posts ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS content TEXT;

INSERT INTO posts (id, user_id, title, content, created_at, updated_at) VALUES
    -- Posts by John Doe (user_id: 1)
    (1, 1, 'Getting Started with Rust', 'A quick primer on toolchain setup, cargo, and your first project.', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
    (2, 1, 'Understanding Ownership', 'Breaking down ownership, borrowing, lifetimes, and common pitfalls.', '2025-01-02 14:30:00', '2025-01-02 14:30:00'),
    (3, 1, 'Building Web APIs', 'From Axum routing to async-graphql resolvers and SQLx queries.', '2025-01-03 09:15:00', '2025-01-03 09:15:00'),
    
    -- Posts by Jane Smith (user_id: 2)
    (4, 2, 'GraphQL vs REST', 'Trade-offs, schema evolution, and when to choose each approach.', '2025-01-01 16:20:00', '2025-01-01 16:20:00'),
    (5, 2, 'Database Design Patterns', 'Normalization, indexing strategies, and query shaping for scale.', '2025-01-02 11:45:00', '2025-01-02 11:45:00'),
    (6, 2, 'Frontend State Management', 'Comparing React Query, Apollo Client, and lightweight alternatives.', '2025-01-04 13:10:00', '2025-01-04 13:10:00'),
    
    -- Posts by Bob Johnson (user_id: 4)
    (7, 4, 'Docker Containerization', 'Building lean images, multi-stage builds, and debugging containers.', '2025-01-01 08:30:00', '2025-01-01 08:30:00'),
    (8, 4, 'Kubernetes Deployment', 'From manifests to Helm and rolling updates without downtime.', '2025-01-03 15:45:00', '2025-01-03 15:45:00'),
    (9, 4, 'CI/CD Best Practices', 'Pipelines, quality gates, and securing supply chains.', '2025-01-05 10:20:00', '2025-01-05 10:20:00'),
    (10, 4, 'Monitoring and Observability', 'Metrics, tracing, and alerting that developers actually use.', '2025-01-06 12:00:00', '2025-01-06 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- Ensure the posts sequence is ahead of the max id to avoid PK collisions
SELECT setval(pg_get_serial_sequence('posts', 'id'), (SELECT COALESCE(MAX(id), 0) + 1 FROM posts), false);
