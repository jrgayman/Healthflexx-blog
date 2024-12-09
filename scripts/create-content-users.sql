-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create content_users table
CREATE TABLE IF NOT EXISTS content_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  access_level TEXT DEFAULT 'Reader',
  avatar_url TEXT,
  login_count INTEGER DEFAULT 0,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_users_email ON content_users(email);
CREATE INDEX IF NOT EXISTS idx_content_users_access_level ON content_users(access_level);

-- Create content_user_roles table
CREATE TABLE IF NOT EXISTS content_user_roles (
  user_id UUID REFERENCES content_users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES healthcare_roles_primary(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Create indexes for the junction table
CREATE INDEX IF NOT EXISTS idx_content_user_roles_user ON content_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_content_user_roles_role ON content_user_roles(role_id);

-- Create view for content user details
CREATE OR REPLACE VIEW content_user_details AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.access_level,
  u.avatar_url,
  u.login_count,
  u.last_login,
  u.created_at,
  u.updated_at,
  ARRAY_AGG(
    jsonb_build_object(
      'id', r.id,
      'name', r.name,
      'description', r.description
    )
  ) FILTER (WHERE r.id IS NOT NULL) as roles
FROM content_users u
LEFT JOIN content_user_roles ur ON u.id = ur.user_id
LEFT JOIN healthcare_roles_primary r ON ur.role_id = r.id
GROUP BY u.id;

-- Migrate existing users to content_users
INSERT INTO content_users (
  name,
  email,
  password_hash,
  phone,
  access_level,
  avatar_url,
  login_count,
  last_login,
  created_at,
  updated_at
)
SELECT 
  name,
  email,
  password_hash,
  phone,
  access_level,
  avatar_url,
  login_count,
  last_login,
  created_at,
  updated_at
FROM users
WHERE access_level IN ('Super Admin', 'Admin', 'Content Creator', 'Reader')
ON CONFLICT (email) DO NOTHING;

-- Migrate existing user roles
INSERT INTO content_user_roles (user_id, role_id)
SELECT 
  cu.id,
  ur.role_id
FROM users u
JOIN content_users cu ON u.email = cu.email
JOIN user_roles ur ON u.id = ur.user_id
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Grant permissions
GRANT ALL ON content_users TO authenticated;
GRANT ALL ON content_user_roles TO authenticated;
GRANT ALL ON content_user_details TO authenticated;