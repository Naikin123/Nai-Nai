// -----------------------------
// Nai Nai — app.js
// -----------------------------
// Supabase setup (tu configuración)
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --------- State (simple) ----------
const state = {
  user: null,     // null = invitado
  gua: 0,
  feed: [],       // items
  achievements: [],
  localNotesKey: 'nai_notes_v1',
  localSettingsKey: 'nai_settings_v1'
};

// --------- Demo initial feed ----------
function seedFeed(){
  state.feed = [
    { id: 'f1', title: 'Demo Vertical - Humor', tags:['humor'], orientation:'vertical', src:null, repeated:false, author:'@demo' },
    { id: 'f2', title: 'Demo Horizontal - Edu', tags:['educativo'], orientation:'horizontal', src:null, repeated:false, author:'@demo' },
    { id: 'f3', title: 'Mix sample', tags:['música','tendencia'], orientation:'both', src:null, repeated:true, author:'@music' }
  ];
}
seedFeed();

// --------- DOM helpers ----------
const el = id => document.getElementById(id);

// render feed
function renderFeed(){
  const list = el('feedList');
  list.innerHTML = '';
  const filterFormat = el('feedFormat').value;
  const filterRepeat = el('feedRepeat').value;

  let items = state.feed.slice();

  // format filter
  if(filterFormat === 'vertical') items = items.filter(i => i.orientation === 'vertical' || i.orientation === 'both');
  if(filterFormat === 'horizontal') items = items.filter(i => i.orientation === 'horizontal' || i.orientation === 'both');

  // repeat filter (simple)
  if(filterRepeat === 'repeated') items = items.filter(i => i.repeated);
  if(filterRepeat === 'unique') items = items.filter(i => !i.repeated);

  items.forEach(it => {
    const card = document.createElement('article');
    card.className = 'feed-item';
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.textContent = it.orientation.toUpperCase();
    const meta = document.createElement('div');
    meta.className = 'feed-meta';
    meta.innerHTML = `<h4>${escapeHtml(it.title)}</h4><p class="muted">Por ${escapeHtml(it.author)} · ${it.tags.join(', ')}</p>`;
    card.appendChild(thumb);
    card.appendChild(meta);
    list.appendChild(card);
  });
}

// escape
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }

// --------- Profile / auth (demo) ----------
async function registerAccount(){
  const display = el('inputDisplayName').value.trim();
  const nai = el('inputNai').value.trim();
  const pass = el('inputPass').value;

  if(!nai || !pass){ alert('Si quieres crear cuenta .Nai, ingresa handle y contraseña.'); return; }

  // Supabase auth: signup (email optional) - here we use nai as "email-like" placeholder (NOT recommended for prod)
  try{
    const emailLike = nai + '@nai.local';
    const res = await supabase.auth.signUp({ email: emailLike, password: pass }, { data: { display, nai } });
    if(res.error) { console.warn(res.error); alert('Error creando cuenta (demo). Revisa consola.'); return; }
    state.user = { id: res.data.user.id, display, nai, registered:true };
    updateProfileUI();
    alert('Cuenta creada (demo). Revisa tu correo si se solicitó verificación (dependiente de Supabase).');
  }catch(e){ console.error(e); alert('Error al crear cuenta.'); }
}

async function loginAccount(){
  const nai = el('inputNai').value.trim();
  const pass = el('inputPass').value;
  if(!nai || !pass){ alert('Handle y contraseña requeridos.'); return; }
  try{
    const emailLike = nai + '@nai.local';
    const res = await supabase.auth.signInWithPassword({ email: emailLike, password: pass });
    if(res.error) { console.warn(res.error); alert('Error iniciando sesión (demo).'); return; }
    state.user = { id: res.data.user.id, display: res.data.user.user_metadata?.display || nai, nai, registered:true };
    updateProfileUI();
    alert('Sesión iniciada (demo).');
  }catch(e){ console.error(e); alert('Error al iniciar sesión.'); }
}

async function logout(){
  await supabase.auth.signOut();
  state.user = null;
  updateProfileUI();
}

// --------- Profile UI update ----------
function updateProfileUI(){
  const badge = el('userBadge');
  const display = el('profileDisplay');
  const handle = el('profileHandle');
  const naiText = el('naiHandleText');

  if(state.user){
    badge.textContent = state.user.display || state.user.nai || 'Usuario';
    display.textContent = state.user.display || 'Usuario';
    handle.textContent = (state.user.nai) ? '@' + state.user.nai : '@registrado';
    naiText.textContent = state.user.nai || '—';
    el('logoutBtn').style.display = '';
    el('registerBtn').style.display = 'none';
    el('loginBtn').style.display = 'none';
  } else {
    badge.textContent = 'Invitado';
    display.textContent = 'Invitado';
    handle.textContent = '@invitado';
    naiText.textContent = '—';
    el('logoutBtn').style.display = 'none';
    el('registerBtn').style.display = '';
    el('loginBtn').style.display = '';
  }
  el('profileGua').textContent = 'GUA: ' + state.gua;
}

// --------- Notes storage ----------
function saveNotes(){
  const text = el('noteBlock').value;
  if(state.user && state.user.registered){
    // TODO: save to Supabase user metadata or a notes table
    // For demo we save to localStorage keyed by user id
    localStorage.setItem('nai_notes_' + state.user.id, text);
    alert('Nota guardada (local demo).');
  } else {
    localStorage.setItem(state.localNotesKey, text);
    alert('Nota guardada localmente (invitado).');
  }
}
function loadNotes(){
  if(state.user && state.user.registered){
    const text = localStorage.getItem('nai_notes_' + state.user.id) || '';
    el('noteBlock').value = text;
  } else {
    const text = localStorage.getItem(state.localNotesKey) || '';
    el('noteBlock').value = text;
  }
}
function clearNotes(){
  if(confirm('Borrar notas?')){
    if(state.user && state.user.registered) localStorage.removeItem('nai_notes_' + state.user.id);
    else localStorage.removeItem(state.localNotesKey);
    el('noteBlock').value = '';
  }
}

// --------- Upload preview and meta saving ----------
const inputFile = el('videoFile');
inputFile.addEventListener('change', handleFileSelect);

function handleFileSelect(e){
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  // simple preview: if video show <video>, if image show <img>
  const preview = el('videoPreview');
  preview.innerHTML = '';
  const url = URL.createObjectURL(f);
  if(f.type.startsWith('video/')){
    const v = document.createElement('video');
    v.src = url; v.controls = true; v.style.maxWidth = '100%'; v.style.height = 'auto';
    preview.appendChild(v);
  } else {
    const i = document.createElement('img');
    i.src = url; i.style.maxWidth = '100%';
    preview.appendChild(i);
  }
}

// save metadata (demo)
el('saveMetaBtn').addEventListener('click', ()=>{
  const tags = el('videoTags').value.split(',').map(s=>s.trim()).filter(Boolean);
  const desc = el('videoDesc').value.trim();
  const orientation = el('videoOrientation').value;
  const cropMode = document.querySelector('input[name="cropMode"]:checked').value;
  const meta = { tags, desc, orientation, cropMode, author: (state.user? state.user.nai : 'invitado') };
  // store in local feed for demo (in prod, upload video to storage and store metadata server-side)
  const id = 'f'+(Date.now());
  state.feed.unshift({ id, title: desc || 'Sin título', tags, orientation, src:null, repeated:false, author:meta.author });
  renderFeed();
  alert('Metadatos guardados (demo).');
});

// publish simulated
el('publishBtn').addEventListener('click', ()=> {
  // in prod: upload file -> store storage path -> set live
  alert('Publicación simulada. Implementar backend para publicación real.');
});

// Preview button: capture a frame if video
el('previewBtn').addEventListener('click', ()=>{
  const f = inputFile.files && inputFile.files[0];
  if(!f){ alert('Selecciona un archivo primero'); return; }
  const url = URL.createObjectURL(f);
  const preview = el('editorArea');
  preview.innerHTML = '';
  if(f.type.startsWith('video/')){
    const v = document.createElement('video');
    v.src = url; v.controls = true; v.autoplay = false; v.style.maxWidth='100%';
    preview.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = url; img.style.maxWidth='100%';
    preview.appendChild(img);
  }
});

// --------- Achievements basic ----------
function seedAchievements(){
  state.achievements = [
    'Subidor de videos (10)',
    'Comentarista (10 comentarios)',
    'Usuario Rate',
    'Usuario Certificado',
    'Curador (100 upvotes)'
  ];
  renderAchievements();
}
function renderAchievements(){
  const ul = el('achievementsList');
  ul.innerHTML = '';
  state.achievements.forEach(a=>{
    const li = document.createElement('li');
    li.textContent = a;
    ul.appendChild(li);
  });
}

// --------- Events binding ----------
function bindUI(){
  el('feedFormat').addEventListener('change', renderFeed);
  el('feedRepeat').addEventListener('change', renderFeed);
  el('registerBtn').addEventListener('click', registerAccount);
  el('loginBtn').addEventListener('click', loginAccount);
  el('logoutBtn').addEventListener('click', logout);
  el('saveNoteBtn').addEventListener('click', saveNotes);
  el('clearNoteBtn').addEventListener('click', clearNotes);
}

// --------- GUA simple demo updates ----------
function changeGua(delta, reason){
  state.gua = Math.max(0, state.gua + delta);
  el('gua-value').textContent = state.gua;
  el('profileGua').textContent = 'GUA: ' + state.gua;
  console.info('GUA change', delta, reason);
}
// quick demo: increase GUA when app starts
changeGua(10, 'Inicio demo');

// --------- Init ----------
function init(){
  bindUI();
  renderFeed();
  seedAchievements();
  updateProfileUI();
  loadNotes();
  el('gua-value').textContent = state.gua;
}
init();
