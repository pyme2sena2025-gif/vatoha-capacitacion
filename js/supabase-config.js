// ============================================================================
// CONFIGURACIÓN DE SUPABASE - VATOHA INGENIERÍA S.A.S.
// Reemplaza los dos valores con los de tu proyecto en:
// Supabase -> Project Settings -> API
// ============================================================================
const VATOHA_SUPABASE_URL = 'https://eoauxlscpocdfoybiyne.supabase.co/rest/v1/';
const VATOHA_SUPABASE_ANON_KEY = 'sb_publishable_Z7nb_BBd3_TjfYchBLX9wQ_otSnSH5I';

function isSupabaseConfigured() {
  return (
    VATOHA_SUPABASE_URL &&
    VATOHA_SUPABASE_ANON_KEY &&
    !VATOHA_SUPABASE_URL.includes('PEGA_AQUI') &&
    !VATOHA_SUPABASE_ANON_KEY.includes('PEGA_AQUI') &&
    typeof window.supabase !== 'undefined'
  );
}

const supabaseClient = isSupabaseConfigured()
  ? window.supabase.createClient(VATOHA_SUPABASE_URL, VATOHA_SUPABASE_ANON_KEY)
  : null;
