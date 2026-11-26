// ============================================================================
// CONFIGURACIÓN DE SUPABASE - VATOHA INGENIERÍA S.A.S.
// Reemplaza los dos valores con los de tu proyecto en:
// Supabase -> Project Settings -> API
// ============================================================================
const VATOHA_SUPABASE_URL = 'PEGA_AQUI_TU_SUPABASE_URL';
const VATOHA_SUPABASE_ANON_KEY = 'PEGA_AQUI_TU_SUPABASE_ANON_KEY';

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