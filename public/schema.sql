-- ====================================================================
-- RoomSplit Database Schema & RLS Security Policies
-- Platform: Supabase PostgreSQL
-- Room: 6-member shared bachelor room financial ledger
-- Super Admin: Sourav
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Type Enums
CREATE TYPE member_role AS ENUM ('admin', 'member');
CREATE TYPE cycle_status AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE contribution_status AS ENUM ('PAID', 'PENDING', 'PENDING_APPROVAL', 'OVERDUE', 'REJECTED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EDIT_REQUESTED');
CREATE TYPE reimbursement_status AS ENUM ('PENDING', 'PARTIALLY_REIMBURSED', 'FULLY_REIMBURSED');
CREATE TYPE transaction_type AS ENUM ('CONTRIBUTION', 'EXPENSE', 'REIMBURSEMENT', 'ADJUSTMENT');

-- 1. ROOMS TABLE
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL DEFAULT 'Bachelor Room',
  monthly_contribution NUMERIC(10,2) NOT NULL DEFAULT 8000.00,
  contribution_day INT NOT NULL DEFAULT 7,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  total_members INT NOT NULL DEFAULT 6,
  treasurer_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  role member_role NOT NULL DEFAULT 'member',
  avatar TEXT,
  phone VARCHAR(20) NOT NULL, -- Used as Password
  upi_id VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  is_whatsapp_opted_in BOOLEAN DEFAULT TRUE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update foreign key on rooms treasurer
ALTER TABLE rooms ADD CONSTRAINT fk_rooms_treasurer FOREIGN KEY (treasurer_id) REFERENCES users(id);

-- 3. ROOM MEMBERS TABLE
CREATE TABLE room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 4. MONTHLY CYCLES TABLE
CREATE TABLE monthly_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  year_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  display_name VARCHAR(50) NOT NULL, -- e.g. "October 2026"
  deadline DATE NOT NULL,
  status cycle_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTRIBUTIONS TABLE
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID NOT NULL REFERENCES monthly_cycles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 8000.00,
  status contribution_status NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(30),
  transaction_id VARCHAR(100),
  payment_screenshot_url TEXT,
  submitted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cycle_id, member_id)
);

-- 6. CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NOT NULL DEFAULT 'Tag',
  color VARCHAR(50) NOT NULL DEFAULT 'bg-slate-500/10 text-slate-500',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXPENSES TABLE
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES monthly_cycles(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  paid_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'UPI',
  payment_screenshot_url TEXT,
  receipt_url TEXT,
  approval_status approval_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  reimbursement_status reimbursement_status,
  reimbursement_owed NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  reimbursement_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSE ITEMS TABLE
CREATE TABLE expense_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REIMBURSEMENTS TABLE
CREATE TABLE reimbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL UNIQUE REFERENCES expenses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_owed NUMERIC(10,2) NOT NULL,
  total_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status reimbursement_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REIMBURSEMENT PAYMENTS TABLE
CREATE TABLE reimbursement_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reimbursement_id UUID NOT NULL REFERENCES reimbursements(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_method VARCHAR(30) NOT NULL DEFAULT 'UPI',
  transaction_id VARCHAR(100),
  payment_screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TRANSACTIONS LEDGER TABLE
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference_id UUID,
  flow VARCHAR(10) NOT NULL CHECK (flow IN ('IN', 'OUT')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE (IMMUTABLE)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view room data" ON rooms FOR SELECT USING (TRUE);
CREATE POLICY "Super Admin Sourav can manage contributions" ON contributions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
