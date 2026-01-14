import { createClient } from '@supabase/supabase-js';

// Directly use the environment variables for testing
const url = 'https://tgncdltlavfzaacrildv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbmNkbHRsYXZmemFhY3JpbGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDMxMDUsImV4cCI6MjA4MzM3OTEwNX0.DPQvivVOnxK8hEY7yZONxeUHEaEKJKPGClBbTkucSCs';

const getTableName = (row: unknown): string | null => {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  return typeof r.table_name === 'string' ? r.table_name : null;
};

async function testInventory() {
  console.log('Testing inventory operations...');
  
  // Create a direct Supabase client connection
  const supabase = createClient(url, key);
  console.log('Supabase client created successfully');
  
  try {
    // 1. Check if inventory table exists
    console.log('1. Checking if inventory table exists...');
    const { data: tableInfo, error: tableError } = await supabase.rpc('pg_table_def', { schema_name: 'public' });
    
    if (tableError) {
      console.error('Error getting table info:', tableError);
    } else {
      const tableNames = (Array.isArray(tableInfo) ? tableInfo : [])
        .map((t) => getTableName(t))
        .filter((t): t is string => t !== null);
      console.log('Tables in public schema:', tableNames);
      // Find inventory table info
      const inventoryTable = tableNames.includes('inventory');
      if (inventoryTable) {
        console.log('Inventory table found!');
      } else {
        console.log('Inventory table NOT found!');
      }
    }
    
    // 2. Try to get table columns specifically
    console.log('2. Getting inventory table columns...');
    const { data: columns, error: columnsError } = await supabase.rpc('pg_column_def', { schema_name: 'public', table_name: 'inventory' });
    
    if (columnsError) {
      console.error('Error getting columns:', columnsError);
    } else {
      console.log('Inventory columns:', columns);
    }
    
    // 3. Try a simple insert with just required fields
    console.log('3. Trying simple insert...');
    const simpleItem = {
      id: 'test-id',
      type: '12KG',
      total_quantity: 10,
      distributed_quantity: 2,
      remaining_quantity: 8,
      unit_price: 150,
      tax_rate: 20
    };
    
    const { error: insertError } = await supabase.from('inventory').insert([simpleItem]);
    
    if (insertError) {
      console.error('Insert error (using snake_case):', insertError.code, insertError.message, insertError.details);
    } else {
      console.log('Simple insert successful!');
    }
    
    // 4. Try with camelCase just in case
    console.log('4. Trying camelCase insert...');
    const camelCaseItem = {
      id: 'test-camel-id',
      type: '6KG',
      totalQuantity: 5,
      distributedQuantity: 1,
      remainingQuantity: 4,
      unitPrice: 80,
      taxRate: 20
    };
    
    const { error: camelInsertError } = await supabase.from('inventory').insert([camelCaseItem]);
    
    if (camelInsertError) {
      console.error('Insert error (using camelCase):', camelInsertError.code, camelInsertError.message, camelInsertError.details);
    } else {
      console.log('CamelCase insert successful!');
    }
    
  } catch (err) {
    console.error('Exception during test:', err);
  }
}

testInventory();
