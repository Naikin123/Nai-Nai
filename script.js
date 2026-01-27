// Nai Nai — app.js (vanilla)

// -----------------------------
// Supabase setup
// -----------------------------
// WARNING: In production, do NOT expose service_role keys or secret keys in frontend.
// Use server functions or edge functions for sensitive operations.
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// -----------------------------
// Simple client state (demo)
// -----------------------------
const state = {
  user: null,
  gua: 0,
  feed: [],
  achievements: [],
  localNotesKey: 'nai_notes_v1'
};

// ---------- helper ----------
const el = id => document.getElementById(id);
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ---------- seed feed ----------
function seedFeed(){
  state.feed = [
    { id:'f1', title:'Demo Vertical — Humor', tags:['humor'], orientation:'vertical', repeated:false, author:'@demo' },
    { id:'f2', title:'Demo Horizontal — Edu', tags:['educativo'], orientation:'horizontal', repeated:false, author:'@demo' },
    { id:'f3', title:'Demo Mix — Música', tags:['música','tendencia'], orientation:'both', repeated:true, author:'@music' }
  ];
}
seedFeed();

// ---------- render feed ----------
function renderFeed(){
  const list = el('feedList');
  list.innerHTML = '';
  const format = el('feedFormat').value;
  const repeat = el('feedRepeat').value;
  let items = state.feed.slice();

  if(format === 'vertical') items = items.filter(i => i.orientation === 'vertical' || i.orientation === 'both');
  if(format === 'horizontal') items = items.filter(i => i.orientation === 'horizontal' || i.orientation === 'both');

  if(repeat === 'repeated') items = items.filter(i => i.repeated);
  if(repeat === 'unique') items = items.filter(i => !i.repeated);

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

// ---------- profile UI ----------
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
  el('gua-value').textContent = state.gua;
}

// ---------- notes ----------
function saveNotes(){
  const text = el('noteBlock').value;
  if(state.user && state.user.registered){
    localStorage.setItem('nai_notes_' + state.user.id, text);
    alert('Nota guardada (demo).');
  } else {
    localStorage.setItem(state.localNotesKey, text);
    alert('Nota guardada localmente (invitado).');
  }
}
function loadNotes(){
  if(state.user && state.user.registered){
    el('noteBlock').value = localStorage.getItem('nai_notes_' + state.user.id) || '';
  } else {
    el('noteBlock').value = localStorage.getItem(state.localNotesKey) || '';
  }
}
function clearNotes(){
  if(confirm('Borrar notas?')){
    if(state.user && state.user.registered) localStorage.removeItem('nai_notes_' + state.user.id);
    else localStorage.removeItem(state.localNotesKey);
    el('noteBlock').value = '';
  }
}

// ---------- file preview ----------
const inputFile = el('videoFile');
if(inputFile){
  inputFile.addEventListener('change', handleFileSelect);
}
function handleFileSelect(e){
  const f = e.target.files && e.target.files[0];
  if(!f) return;
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

// ---------- meta save ----------
if(el('saveMetaBtn')){
  el('saveMetaBtn').addEventListener('click', ()=>{
    const tags = el('videoTags').value.split(',').map(s=>s.trim()).filter(Boolean);
    const desc = el('videoDesc').value.trim();
    const orientation = el('videoOrientation').value;
    const cropMode = document.querySelector('input[name="cropMode"]:checked').value;
    const author = state.user ? state.user.nai : 'invitado';
    const id = 'f'+(Date.now());
    state.feed.unshift({ id, title: desc || 'Sin título', tags, orientation, repeated:false, author });
    renderFeed();
    alert('Metadatos guardados (demo).');
  });
}

// ---------- register / login (demo using emailLike) ----------
async function registerAccount(){
  const display = el('inputDisplayName').value.trim();
  const nai = el('inputNai').value.trim();
  const pass = el('inputPass').value;
  if(!nai || !pass){ alert('Handle y contraseña requeridos para registro.'); return; }
  try{
    const emailLike = nai + '@nai.local';
    const res = await supabase.auth.signUp({ email: emailLike, password: pass }, { data: { display, nai } });
    if(res.error) { console.warn(res.error); alert('Error creando cuenta (demo).'); return; }
    state.user = { id: res.data.user.id, display, nai, registered:true };
    updateProfileUI(); loadNotes();
    alert('Cuenta creada (demo).');
  }catch(e){ console.error(e); alert('Error en registro.'); }
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
    updateProfileUI(); loadNotes();
    alert('Sesión iniciada (demo).');
  }catch(e){ console.error(e); alert('Error al iniciar sesión.'); }
}
async function logout(){
  await supabase.auth.signOut();
  state.user = null;
  updateProfileUI();
  loadNotes();
}

// ---------- achievements ----------
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
  if(!ul) return;
  ul.innerHTML = '';
  state.achievements.forEach(a=>{
    const li = document.createElement('li');
    li.textContent = a;
    ul.appendChild(li);
  });
}

// ---------- GUA demo ----------
function changeGua(delta, reason){
  state.gua = Math.max(0, state.gua + delta);
  el('gua-value').textContent = state.gua;
  if(el('profileGua')) el('profileGua').textContent = 'GUA: ' + state.gua;
  console.info('GUA change', delta, reason);
}

// ---------- binding & init ----------
function bindUI(){
  if(el('feedFormat')) el('feedFormat').addEventListener('change', renderFeed);
  if(el('feedRepeat')) el('feedRepeat').addEventListener('change', renderFeed);
  if(el('registerBtn')) el('registerBtn').addEventListener('click', registerAccount);
  if(el('loginBtn')) el('loginBtn').addEventListener('click', loginAccount);
  if(el('logoutBtn')) el('logoutBtn').addEventListener('click', logout);
  if(el('saveNoteBtn')) el('saveNoteBtn').addEventListener('click', saveNotes);
  if(el('clearNoteBtn')) el('clearNoteBtn').addEventListener('click', clearNotes);
  if(el('previewBtn')) el('previewBtn').addEventListener('click', (e)=>{ e.preventDefault(); const f = inputFile.files && inputFile.files[0]; if(!f){ alert('Selecciona archivo.'); return; } const url = URL.createObjectURL(f); const preview = el('editorArea'); preview.innerHTML=''; if(f.type.startsWith('video/')){ const v=document.createElement('video'); v.src=url; v.controls=true; v.style.maxWidth='100%'; preview.appendChild(v); } else { const img=document.createElement('img'); img.src=url; img.style.maxWidth='100%'; preview.appendChild(img);} });
  if(el('saveMetaBtn')) el('saveMetaBtn').addEventListener('click',(e)=>{ e.preventDefault(); });
}

function init(){
  bindUI();
  renderFeed();
  seedAchievements();
  updateProfileUI();
  loadNotes();
  changeGua(10, 'Inicio demo');
}
init();
