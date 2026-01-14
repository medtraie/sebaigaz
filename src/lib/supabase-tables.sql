-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  totalQuantity INTEGER NOT NULL DEFAULT 0,
  distributedQuantity INTEGER NOT NULL DEFAULT 0,
  remainingQuantity INTEGER NOT NULL DEFAULT 0,
  unitPrice NUMERIC(10,2) NOT NULL DEFAULT 0,
  taxRate NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  date TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  subtotal NUMERIC(12,2) NOT NULL,
  taxAmount NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  companyName TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unitPrice NUMERIC(10,2) NOT NULL,
  taxRate NUMERIC(5,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  PRIMARY KEY (invoice_id, description)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Clients table policies
CREATE POLICY "Allow read clients" ON clients
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert clients" ON clients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update clients" ON clients
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete clients" ON clients
  FOR DELETE
  USING (true);

-- Inventory table policies
CREATE POLICY "Allow read inventory" ON inventory
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert inventory" ON inventory
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update inventory" ON inventory
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete inventory" ON inventory
  FOR DELETE
  USING (true);

-- Invoices table policies
CREATE POLICY "Allow read invoices" ON invoices
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert invoices" ON invoices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update invoices" ON invoices
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete invoices" ON invoices
  FOR DELETE
  USING (true);

-- Invoice items table policies
CREATE POLICY "Allow read invoice_items" ON invoice_items
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert invoice_items" ON invoice_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update invoice_items" ON invoice_items
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete invoice_items" ON invoice_items
  FOR DELETE
  USING (true);

-- Settings table policies
CREATE POLICY "Allow read settings" ON settings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow upsert settings" ON settings
  FOR ALL
  USING (true);
