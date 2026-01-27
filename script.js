// =======================
// SUPABASE CONFIG
// =======================

const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

// =======================
// APP BASE LOGIC
// =======================

console.log('Nai Nai iniciado');
console.log('Supabase conectado:', supabase);

// Ejemplo futuro:
// - detectar sesión
// - cargar perfil
// - cargar feed
