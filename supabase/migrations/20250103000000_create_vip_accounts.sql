-- Create VIP accounts table for authentication
CREATE TABLE IF NOT EXISTS vip_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  customer_category VARCHAR(50) NOT NULL CHECK (customer_category IN ('Student', 'Senior Citizen', 'Regular Customer', 'PWD')),
  
  -- Category-specific fields
  school_name VARCHAR(255),
  student_id_file TEXT,
  senior_id_number VARCHAR(100),
  senior_id_file TEXT,
  pwd_id_number VARCHAR(100),
  pwd_id_file TEXT,
  verification_id_file TEXT,
  
  -- Authentication fields
  password_hash VARCHAR(255),
  salt VARCHAR(255),
  
  -- Status and timestamps
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional security fields
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vip_accounts_unique_id ON vip_accounts(unique_id);
CREATE INDEX IF NOT EXISTS idx_vip_accounts_email ON vip_accounts(email);
CREATE INDEX IF NOT EXISTS idx_vip_accounts_status ON vip_accounts(status);
CREATE INDEX IF NOT EXISTS idx_vip_accounts_customer_category ON vip_accounts(customer_category);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_vip_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_vip_accounts_updated_at
  BEFORE UPDATE ON vip_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_vip_accounts_updated_at();

-- Create a function to generate unique VIP IDs
CREATE OR REPLACE FUNCTION generate_vip_id()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_id VARCHAR(50);
  counter INTEGER := 1;
BEGIN
  LOOP
    new_id := 'VIP-' || LPAD(counter::TEXT, 6, '0');
    
    -- Check if this ID already exists
    IF NOT EXISTS (SELECT 1 FROM vip_accounts WHERE unique_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
    
    -- Prevent infinite loop (though it's unlikely with 6 digits)
    IF counter > 999999 THEN
      RAISE EXCEPTION 'Unable to generate unique VIP ID';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to hash passwords (simple implementation)
CREATE OR REPLACE FUNCTION hash_password(password TEXT, salt TEXT)
RETURNS TEXT AS $$
BEGIN
  -- In production, use a proper password hashing library like bcrypt
  -- This is a simplified version for demonstration
  RETURN encode(digest(password || salt, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create a function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, salt TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash_password(password, salt) = hash;
END;
$$ LANGUAGE plpgsql;

-- Create a function to authenticate VIP users
CREATE OR REPLACE FUNCTION authenticate_vip_user(
  p_unique_id VARCHAR(50),
  p_password TEXT
)
RETURNS TABLE(
  id UUID,
  unique_id VARCHAR(50),
  full_name VARCHAR(255),
  email VARCHAR(255),
  mobile_number VARCHAR(20),
  customer_category VARCHAR(50),
  status VARCHAR(20),
  school_name VARCHAR(255),
  senior_id_number VARCHAR(100),
  pwd_id_number VARCHAR(100)
) AS $$
DECLARE
  account_record vip_accounts%ROWTYPE;
  password_valid BOOLEAN;
BEGIN
  -- Get the account record
  SELECT * INTO account_record
  FROM vip_accounts
  WHERE unique_id = p_unique_id
    AND status = 'approved'
    AND (locked_until IS NULL OR locked_until < NOW());
  
  -- Check if account exists and is not locked
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Verify password (if password authentication is enabled)
  IF account_record.password_hash IS NOT NULL AND account_record.salt IS NOT NULL THEN
    password_valid := verify_password(p_password, account_record.salt, account_record.password_hash);
    
    IF NOT password_valid THEN
      -- Increment login attempts
      UPDATE vip_accounts 
      SET login_attempts = login_attempts + 1,
          locked_until = CASE 
            WHEN login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
            ELSE locked_until
          END
      WHERE id = account_record.id;
      RETURN;
    END IF;
  END IF;
  
  -- Reset login attempts and update last login
  UPDATE vip_accounts 
  SET login_attempts = 0,
      locked_until = NULL,
      last_login = NOW()
  WHERE id = account_record.id;
  
  -- Return user data
  RETURN QUERY SELECT
    account_record.id,
    account_record.unique_id,
    account_record.full_name,
    account_record.email,
    account_record.mobile_number,
    account_record.customer_category,
    account_record.status,
    account_record.school_name,
    account_record.senior_id_number,
    account_record.pwd_id_number;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample VIP accounts for testing
INSERT INTO vip_accounts (
  unique_id,
  full_name,
  address,
  email,
  mobile_number,
  customer_category,
  status,
  password_hash,
  salt
) VALUES 
(
  'VIP-123456',
  'John Doe',
  '123 Main St, City, State',
  'john.doe@example.com',
  '+1234567890',
  'Regular Customer',
  'approved',
  hash_password('password123', 'salt123'),
  'salt123'
),
(
  'VIP-789012',
  'Jane Smith',
  '456 Oak Ave, City, State',
  'jane.smith@example.com',
  '+1234567891',
  'Student',
  'approved',
  hash_password('password123', 'salt456'),
  'salt456'
),
(
  'VIP-345678',
  'Robert Johnson',
  '789 Pine Rd, City, State',
  'robert.johnson@example.com',
  '+1234567892',
  'Senior Citizen',
  'approved',
  hash_password('password123', 'salt789'),
  'salt789'
),
(
  'VIP-901234',
  'Maria Garcia',
  '321 Elm St, City, State',
  'maria.garcia@example.com',
  '+1234567893',
  'PWD',
  'approved',
  hash_password('password123', 'salt101'),
  'salt101'
),
(
  'VIP-567890',
  'Test User',
  'Test Address',
  'test@example.com',
  '+1234567894',
  'Regular Customer',
  'pending',
  NULL,
  NULL
);

-- Create a view for approved VIP members (for easy querying)
CREATE OR REPLACE VIEW approved_vip_members AS
SELECT 
  id,
  unique_id,
  full_name,
  address,
  email,
  mobile_number,
  customer_category,
  school_name,
  senior_id_number,
  pwd_id_number,
  created_at,
  updated_at,
  last_login
FROM vip_accounts
WHERE status = 'approved';

-- Grant necessary permissions (adjust based on your RLS policies)
-- For now, we'll allow public access but in production you should set up proper RLS
ALTER TABLE vip_accounts ENABLE ROW LEVEL SECURITY;

-- Create a policy for public read access to approved members (for login verification)
CREATE POLICY "Public can read approved vip accounts" ON vip_accounts
  FOR SELECT USING (status = 'approved');

-- Create a policy for authenticated users to read their own data
CREATE POLICY "Users can read their own vip account" ON vip_accounts
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create a policy for inserting new registrations
CREATE POLICY "Anyone can register" ON vip_accounts
  FOR INSERT WITH CHECK (true);

-- Create a policy for updating own account (limited fields)
CREATE POLICY "Users can update their own vip account" ON vip_accounts
  FOR UPDATE USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);
