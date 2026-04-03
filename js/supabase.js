/* ══════════════════════════════════════════════════════
   SUPABASE.JS — Client initialisation
   Replace the URL and ANON KEY with your real values
   from https://supabase.com/dashboard → Project Settings → API
══════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY  = 'YOUR_ANON_PUBLIC_KEY';

const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* Note: add this script tag BEFORE supabase.js in your HTML:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
*/