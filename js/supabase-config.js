// ============================================================================
// CONFIGURACIÓN DE SUPABASE - VATOHA INGENIERÍA S.A.S.
// Obtén ambos valores en: Supabase -> Project Settings -> API
// ============================================================================
const RAW_SUPABASE_URL = 'https://TU_ID_DE_PROYECTO.supabase.co';
const RAW_SUPABASE_ANON_KEY = 'PEGA_AQUI_TU_ANON_PUBLIC_KEY';

const VATOHA_SUPABASE_URL = RAW_SUPABASE_URL.trim().replace(/\/+$/, '');
const VATOHA_SUPABASE_ANON_KEY = RAW_SUPABASE_ANON_KEY.trim();

function isSupabaseConfigured() {
  try {
    const parsed = new URL(VATOHA_SUPABASE_URL);
    const isRootPath = parsed.pathname === '' || parsed.pathname === '/';
    return (
      parsed.protocol === 'https:' &&
      isRootPath &&
      !VATOHA_SUPABASE_URL.includes('supabase.com/dashboard') &&
      !VATOHA_SUPABASE_URL.includes('TU_ID_DE_PROYECTO') &&
      VATOHA_SUPABASE_ANON_KEY.length > 20 &&
      !VATOHA_SUPABASE_ANON_KEY.includes('PEGA_AQUI') &&
      typeof window.supabase !== 'undefined'
    );
  } catch (e) {
    return false;
  }
}

const supabaseClient = isSupabaseConfigured()
  ? window.supabase.createClient(VATOHA_SUPABASE_URL, VATOHA_SUPABASE_ANON_KEY)
  : null;
