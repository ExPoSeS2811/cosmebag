import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qhsncjaeiarifkgwhtwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoc25jamFlaWFyaWZrZ3dodHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAyMjcsImV4cCI6MjA3NDE3NjIyN30.Jv9fki8f82XWMCS3l6yrTEy13vhfLQXoCMCsTg3ZWxk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Функция для тестирования подключения
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    console.log('Connection test successful');
    return true;
  } catch (err) {
    console.error('Connection test error:', err);
    return false;
  }
}