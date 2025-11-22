import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrosdlkghyprphuzlyqt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyb3NkbGtnaHlwcnBodXpseXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NjIzMTcsImV4cCI6MjA3OTMzODMxN30.jbIh7U9nJHnYm892GK6dwrR1gyz9YVGtMK13ikrXLD0';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
