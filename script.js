// Nai Nai — app.js (Fixed)

// -----------------------------
// 1. Configuración e Inicialización
// -----------------------------
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
// Nota: Es seguro usar la KEY pública (anon) si tienes RLS configurado en el backend.
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Estado local de la aplicación
const state = {
  user: null, // null = invitado
  feed: [],
  notesKey: 'nai_local_note_v1'
};

// Helpers rápidos
const el = id => document.getElementById(id);

// -----------------------------
// 2. Lógica del Feed
// -----------------------------
function seedFeed() {
  // Datos falsos para probar la interfaz
  state.feed = [
    { id: 1, title: 'Tutorial de JS', author: '@dev_master', type: 'vertical', repeated: false, desc: 'Aprende hooks rápidos.' },
    { id: 2, title: 'Paisaje 4K', author: '@traveler', type: 'horizontal', repeated: false, desc: 'Vistas de la montaña.' },
    { id: 3, title: 'Meme del gato', author: '@funny_cat', type: 'vertical', repeated: true, desc: 'Jajaja miren esto.' },
    { id: 4, title: 'Música LoFi', author: '@chill_beats', type: 'horizontal', repeated: true, desc: 'Para estudiar.' },
    { id: 5, title: 'Unboxing tech', author: '@tech_guy', type: 'vertical', repeated: false, desc: 'Nuevo gadget.' }
  ];
  renderFeed();
}

function renderFeed() {
  const container = el('feedList');
  container.innerHTML = ''; // Limpiar

  const formatFilter = el('feedFormat').value; // mix, vertical, horizontal
  const repeatFilter = el('feedRepeat').value; // both, unique

  // Filtrar datos
  let items = state.feed.filter(item => {
    // Filtro de formato
    if (formatFilter === 'vertical' && item.type !== 'vertical') return false;
    if (formatFilter === 'horizontal' && item.type !== 'horizontal') return false;
    
    // Filtro de repetidos
    if (repeatFilter === 'unique' && item.repeated === true) return false;
    
    return true;
  });

  if (items.length === 0) {
    container.innerHTML = '<p class="muted" style="text-align:center; padding:20px;">No hay videos con estos filtros.</p>';
    return;
  }

  // Generar HTML
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'feed-item';
    card.innerHTML = `
      <div class="thumb">
        <span>${item.type === 'vertical' ? '📱' : '📺'} PLAY</span>
      </div>
      <div class="feed-meta">
        <h4>${item.title}</h4>
        <p class="small text-blue">${item.author}</p>
        <p class="muted">${item.desc}</p>
        ${item.repeated ? '<span style="font-size:0.7rem; color:var(--danger)">[Repetido]</span>' : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

// Eventos de filtros
el('feedFormat').addEventListener('change', renderFeed);
el('feedRepeat').addEventListener('change', renderFeed);

// -----------------------------
// 3. Lógica de Subida (Preview)
// -----------------------------
el('previewBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const fileInput = el('videoFile');
  const previewBox = el('videoPreview');
  
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);
    
    // Detectar si es imagen o video para el tag correcto
    if (file.type.startsWith('video/')) {
      previewBox.innerHTML = `<video src="${url}" controls style="max-width:100%; max-height:200px; border-radius:8px;"></video>`;
    } else {
      previewBox.innerHTML = `<img src="${url}" style="max-width:100%; max-height:200px; border-radius:8px;">`;
    }
  } else {
    previewBox.innerHTML = '<span style="color:var(--danger)">Por favor selecciona un archivo primero.</span>';
  }
});

el('publishBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const desc = el('videoDesc').value;
  if(!desc) return alert('Añade una descripción');
  
  // Simular publicación agregando al feed local
  state.feed.unshift({
    id: Date.now(),
    title: 'Nuevo Upload (Demo)',
    author: state.user ? state.user : '@invitado',
    type: 'vertical', // Default para demo
    repeated: false,
    desc: desc
  });
  
  alert('¡Video publicado en el feed local!');
  renderFeed();
  el('videoDesc').value = '';
  el('videoPreview').innerHTML = 'Vista previa aquí';
});

// -----------------------------
// 4. Perfil y Auth (Simulado)
// -----------------------------
function updateProfileUI() {
  if (state.user) {
    // Logueado
    el('profileDisplay').textContent = state.user;
    el('profileHandle').textContent = '@usuario_verificado';
    el('userBadge').textContent = 'Usuario';
    el('avatarUi').style.background = 'var(--neon-blue)';
    
    el('loginBtn').style.display = 'none';
    el('inputUser').style.display = 'none';
    el('logoutBtn').style.display = 'inline-block';
    
    // GUA Simulado
    el('gua-value').textContent = '150';
  } else {
    // Invitado
    el('profileDisplay').textContent = 'Invitado';
    el('profileHandle').textContent = '@anonimo';
    el('userBadge').textContent = 'Invitado';
    el('avatarUi').style.background = '#333';
    
    el('loginBtn').style.display = 'inline-block';
    el('inputUser').style.display = 'block';
    el('logoutBtn').style.display = 'none';
    el('gua-value').textContent = '0';
  }
}

el('loginBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const name = el('inputUser').value || 'Usuario Test';
  state.user = name;
  updateProfileUI();
});

el('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  state.user = null;
  updateProfileUI();
});

// -----------------------------
// 5. Block de Notas (LocalStorage)
// -----------------------------
function loadNote() {
  const saved = localStorage.getItem(state.notesKey);
  if (saved) el('noteBlock').value = saved;
}

el('saveNoteBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const text = el('noteBlock').value;
  localStorage.setItem(state.notesKey, text);
  alert('Nota guardada en este dispositivo.');
});

el('clearNoteBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem(state.notesKey);
  el('noteBlock').value = '';
});

// -----------------------------
// 6. Init
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  seedFeed();
  loadNote();
  updateProfileUI();
  console.log('Nai Nai app iniciada.');
});
