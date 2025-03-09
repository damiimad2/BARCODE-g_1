-- Create store_owners table
CREATE TABLE IF NOT EXISTS store_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  store_name TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Add store_owner_id to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS store_owner_id UUID REFERENCES store_owners(id);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT
);

-- Insert default admin
INSERT INTO admins (username, password, name, email)
VALUES ('admin', 'admin', 'System Administrator', 'admin@perfumeloyalty.com')
ON CONFLICT (username) DO NOTHING;

-- Enable realtime for store_owners
alter publication supabase_realtime add table store_owners;
