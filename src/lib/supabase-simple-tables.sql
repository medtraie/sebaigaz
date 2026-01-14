DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'inventory'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'inventory'
        AND column_name = 'id'
        AND data_type = 'uuid'
    ) THEN
      ALTER TABLE public.inventory
      ALTER COLUMN id TYPE TEXT USING id::text;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'totalquantity'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN totalquantity TO total_quantity;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'distributedquantity'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN distributedquantity TO distributed_quantity;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'remainingquantity'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN remainingquantity TO remaining_quantity;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'unitprice'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN unitprice TO unit_price;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'taxrate'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN taxrate TO tax_rate;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'totalQuantity'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN "totalQuantity" TO total_quantity;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'distributedQuantity'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN "distributedQuantity" TO distributed_quantity;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'remainingQuantity'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN "remainingQuantity" TO remaining_quantity;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'unitPrice'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN "unitPrice" TO unit_price;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'taxRate'
    ) THEN
      ALTER TABLE public.inventory RENAME COLUMN "taxRate" TO tax_rate;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'total_quantity'
    ) THEN
      ALTER TABLE public.inventory ADD COLUMN total_quantity INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'distributed_quantity'
    ) THEN
      ALTER TABLE public.inventory ADD COLUMN distributed_quantity INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'remaining_quantity'
    ) THEN
      ALTER TABLE public.inventory ADD COLUMN remaining_quantity INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'unit_price'
    ) THEN
      ALTER TABLE public.inventory ADD COLUMN unit_price NUMERIC(10,2) NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'tax_rate'
    ) THEN
      ALTER TABLE public.inventory ADD COLUMN tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  distributed_quantity INTEGER NOT NULL DEFAULT 0,
  remaining_quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policy to allow all operations on inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'inventory' AND policyname = 'Allow all inventory operations'
  ) THEN
    CREATE POLICY "Allow all inventory operations" ON inventory
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create other necessary tables if they don't exist
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  ice TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'Allow all clients operations'
  ) THEN
    CREATE POLICY "Allow all clients operations" ON clients
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'invoices'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'taxamount'
    ) THEN
      ALTER TABLE public.invoices RENAME COLUMN taxamount TO tax_amount;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'taxAmount'
    ) THEN
      ALTER TABLE public.invoices RENAME COLUMN "taxAmount" TO tax_amount;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'companyname'
    ) THEN
      ALTER TABLE public.invoices RENAME COLUMN companyname TO company_name;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'companyName'
    ) THEN
      ALTER TABLE public.invoices RENAME COLUMN "companyName" TO company_name;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'tax_amount'
    ) THEN
      ALTER TABLE public.invoices ADD COLUMN tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'company_name'
    ) THEN
      ALTER TABLE public.invoices ADD COLUMN company_name TEXT;
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  date TEXT NOT NULL,
  client_id TEXT REFERENCES clients(id),
  subtotal NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  company_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'Allow all invoices operations'
  ) THEN
    CREATE POLICY "Allow all invoices operations" ON invoices
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'invoice_items'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'unitprice'
    ) THEN
      ALTER TABLE public.invoice_items RENAME COLUMN unitprice TO unit_price;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'unitPrice'
    ) THEN
      ALTER TABLE public.invoice_items RENAME COLUMN "unitPrice" TO unit_price;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'taxrate'
    ) THEN
      ALTER TABLE public.invoice_items RENAME COLUMN taxrate TO tax_rate;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'taxRate'
    ) THEN
      ALTER TABLE public.invoice_items RENAME COLUMN "taxRate" TO tax_rate;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'unit_price'
    ) THEN
      ALTER TABLE public.invoice_items ADD COLUMN unit_price NUMERIC(10,2) NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'tax_rate'
    ) THEN
      ALTER TABLE public.invoice_items ADD COLUMN tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS invoice_items (
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  amount NUMERIC(12,2) NOT NULL,
  PRIMARY KEY (invoice_id, description)
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'invoice_items' AND policyname = 'Allow all invoice_items operations'
  ) THEN
    CREATE POLICY "Allow all invoice_items operations" ON invoice_items
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'settings' AND policyname = 'Allow all settings operations'
  ) THEN
    CREATE POLICY "Allow all settings operations" ON settings
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
