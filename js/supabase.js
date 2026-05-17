/* ══════════════════════════════════════════════════════
   SUPABASE.JS — Client initialisation
   AmyServes · Supabase v2
══════════════════════════════════════════════════════ */

var SUPABASE_URL = 'https://zkxugnwugevbhazgjobu.supabase.co';
var SUPABASE_KEY = 'sb_publishable_BPuC7GZSTD5GBDOwirSrjA_AzexoXVH';

var supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'amyserves-auth'
    }
  });
} else {
  console.error('Supabase library not loaded');
}
