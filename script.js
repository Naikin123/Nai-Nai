// Nai Nai — app.js (Código Reparado y Completado)

// -----------------------------
// 1. Configuración de Supabase
// -----------------------------
// IMPORTANTE: Reemplaza estas variables con las de tu proyecto en Supabase.com
// NO uses las que tenías antes, crea unas nuevas por seguridad.
const supabaseUrl = 'TU_SUPABASE_URL_AQUI'; 
const supabaseKey = 'TU_SUPABASE_ANON_KEY_AQUI';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// -----------------------------
// 2. Estado de la Aplicación
// -----------------------------
const state = {
  user: null, // Usuario logueado
  gua: 10,    // GUA inicial
  feed: [],   // Lista de videos
};

// -----------------------------
// 3. Funciones del Sistema
// -----------------------------

// Referencias rápidas al HTML
const el = id => document.getElementById(id);

// --- Cargar Feed Simulado ---
function seedFeed() {
  state.feed = [
    { id: 1, title: 'POV: Programando a las 3AM', author: '@DevNai', type: 'vertical', tag: 'humor' },
    { id: 2, title: 'Tutorial CSS Neón', author: '@DesignPro', type: 'horizontal', tag: 'ciencia' },
    { id: 3, title: 'Gato Cyberpunk', author: '@Mishi2077', type: 'vertical', tag: 'humor' },
    { id: 4, title: 'Intro Nai Nai Beta', author: '@Admin', type: 'both', tag: 'noticias' }
  ];
  renderFeed();
}

// --- Renderizar (Dibujar) el Feed ---
function renderFeed() {
  const list = el('feedList');
  list.innerHTML = ''; // Limpiar lista

  // Obtener filtros del usuario
  const formatFilter = el('feedFormat').value;
  const repeatFilter = el('feedRepeat').value;

  // Filtrar videos
  let items = state.feed.filter(item => {
    // Lógica de filtro completada
    if (formatFilter === 'mix') return true;
    if (formatFilter === 'vertical' && item.type === 'horizontal') return false;
    if (formatFilter === 'horizontal' && item.type === 'vertical') return false;
    return true;
  });

  if (items.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#555;">No hay videos con este filtro.</p>';
    return;
  }

  // Crear HTML de cada video
  items.forEach(video => {
    const videoHTML = `
      <div class="feed-item">
        <div class="video-placeholder">
          <span>▶ ${video.type.toUpperCase()}</span>
        </div>
        <div class="feed-meta">
          <h4>${video.title}</h4>
          <p class="small muted">Subido por <span style="color:var(--neon-cyan)">${video.author}</span></p>
          <span class="badge" style="font-size:0.7rem; background:#222; color:#fff; border:1px solid #444;">#${video.tag}</span>
        </div>
      </div>
    `;
    list.innerHTML += videoHTML;
  });
}

// --- Manejo de Usuario (Simulación + Supabase) ---
async function handleLogin() {
  const email = el('inputEmail').value;
  const password = el('inputPass').value;

  if (!email || !password) {
    alert("Por favor escribe correo y contraseña.");
    return;
  }

  // Ejemplo de login real con Supabase (Descomentar cuando tengas las llaves)
  /*
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  if (error) alert(error.message);
  else updateUserUI(data.user);
  */

  // Simulación temporal
  alert(`Bienvenido de nuevo, ${email}. (Modo Simulación)`);
  updateUserUI({ email: email, role: 'Usuario' });
}

function handleLogout() {
  /* await supabase.auth.signOut(); */
  updateUserUI(null);
}

function updateUserUI(user) {
  state.user = user;
  if (user) {
    el('userBadge').innerText = 'Registrado';
    el('profileDisplay').innerText = user.email.split('@')[0]; // Usar parte del correo como nombre
    el('profileHandle').innerText = '@' + user.email.split('@')[0];
    el('authDetails').style.display = 'none'; // Ocultar form login
    el('logoutBtn').style.display = 'block';  // Mostrar botón salir
    el('gua-value').innerText = '15'; // Bono por registrarse
  } else {
    el('userBadge').innerText = 'Invitado';
    el('profileDisplay').innerText = 'Invitado';
    el('profileHandle').innerText = '@anonimo';
    el('authDetails').style.display = 'block';
    el('logoutBtn').style.display = 'none';
    el('gua-value').innerText = '0';
  }
}

// --- Block de Notas (LocalStorage) ---
function saveNote() {
  const nota = el('noteBlock').value;
  localStorage.setItem('nai_nota_privada', nota);
  alert("Nota guardada en este dispositivo.");
}

function loadNote() {
  const notaGuardada = localStorage.getItem('nai_nota_privada');
  if (notaGuardada) {
    el('noteBlock').value = notaGuardada;
  }
}

// -----------------------------
// 4. Inicialización (Cuando carga la página)
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  console.log("Sistema Nai Nai Iniciado...");
  
  // Cargar feed inicial
  seedFeed();
  
  // Cargar nota guardada
  loadNote();

  // Escuchar cambios en los filtros
  el('feedFormat').addEventListener('change', renderFeed);
  el('feedRepeat').addEventListener('change', renderFeed);

  // Botones
  el('loginBtn').addEventListener('click', handleLogin);
  el('logoutBtn').addEventListener('click', handleLogout);
  el('saveNoteBtn').addEventListener('click', saveNote);
  
  el('previewBtn').addEventListener('click', () => {
    alert("Función de previsualización pendiente de backend.");
  });
});
