import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tdzglepfyqnteatmtfna.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkemdsZXBmeXFudGVhdG10Zm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzA1MjUsImV4cCI6MjA4NDA0NjUyNX0.qzWiJNAG1rX-kMBhEzjxhf9FqhRJVQsOakn8SersF1I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


