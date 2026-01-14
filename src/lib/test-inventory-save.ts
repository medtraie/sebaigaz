import { createClient } from '@supabase/supabase-js';

// Directly use the environment variables for testing
const url = 'https://tgncdltlavfzaacrildv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbmNkbHRsYXZmemFhY3JpbGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDMxMDUsImV4cCI6MjA4MzM3OTEwNX0.DPQvivVOnxK8hEY7yZONxeUHEaEKJKPGClBbTkucSCs';

// Test inventory data with fixed IDs (same as defaultInventory)
const testInventory = [
  { id: '12kg-id', type: '12KG', total_quantity: 10, distributed_quantity: 2, remaining_quantity: 8, unit_price: 150, tax_rate: 20 },
  { id: '6kg-id', type: '6KG', total_quantity: 20, distributed_quantity: 5, remaining_quantity: 15, unit_price: 80, tax_rate: 20 }
];

async function testInventorySave() {
  console.log('Testing inventory save functionality...');
  
  // Create a direct Supabase client connection
  const supabase = createClient(url, key);
  console.log('Supabase client created successfully');
  
  try {
    // 1. Test fetching inventory first
    console.log('1. Testing fetchInventory...');
    const { data: fetchedInventory, error: fetchError } = await supabase.from('inventory').select('*');
    
    if (fetchError) {
      console.error('Error fetching inventory:', fetchError);
      return;
    }
    
    console.log('Fetched inventory:', fetchedInventory || []);
    
    // 2. Test upserting inventory
    console.log('2. Testing upsertInventory...');
    const { error: upsertError } = await supabase.from('inventory').upsert(testInventory, { onConflict: 'id' });
    
    if (upsertError) {
      console.error('Error upserting inventory:', upsertError.code, upsertError.message, upsertError.details);
      return;
    }
    
    console.log('Inventory upserted successfully');
    
    // 3. Test fetching again to verify the data was saved
    console.log('3. Testing fetchInventory after upsert...');
    const { data: updatedInventory, error: fetchAfterUpsertError } = await supabase.from('inventory').select('*');
    
    if (fetchAfterUpsertError) {
      console.error('Error fetching inventory after upsert:', fetchAfterUpsertError);
      return;
    }
    
    console.log('Updated inventory:', updatedInventory || []);
    console.log('Test completed successfully!');
    
  } catch (err) {
    console.error('Exception during test:', err);
  }
}

testInventorySave();
