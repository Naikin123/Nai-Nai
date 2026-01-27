// script.js (corregido para carga desde la raíz)

// Supabase config (demo). En producción, mueve operaciones sensibles al servidor.
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNvdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';

let supabase = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase client not available (demo).');
}

// Helpers
const el = id => document.getElementById(id);
const exists = id => !!el(id);
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// State
const state = {
  user: null,
  gua: 0,
  feed: [],
  achievements: [],
  localNotesKey: 'nai_notes_v1'
};

// Seed
function seedFeed(){
  state.feed = [
    { id:'f1', title:'Demo Vertical — Humor', tags:['humor'], orientation:'vertical', repeated:false, author:'@demo' },
    { id:'f2', title:'Demo Horizontal — Edu', tags:['educativo'], orientation:'horizontal', repeated:false, author:'@demo' },
    { id:'f3', title:'Demo Mix — Música', tags:['música','tendencia'], orientation:'both', repeated:true, author:'@music' }
  ];
}
function seedAchievements(){
  state.achievements = [
    'Subidor de videos (10)',
    'Comentarista (10 comentarios)',
    'Usuario Rate',
    'Usuario Certificado',
    'Curador (100 upvotes)'
  ];
}

// Render functions
function renderFeed(){
  if(!exists('feedList')) return;
  const list = el('feedList'); list.innerHTML = '';
  const format = exists('feedFormat') ? el('feedFormat').value : 'mix';
  const repeat = exists('feedRepeat') ? el('feedRepeat').value : 'both';
  let items = state.feed.slice();

  if(format === 'vertical') items = items.filter(i => i.orientation === 'vertical' || i.orientation === 'both');
  if(format === 'horizontal') items = items.filter(i => i.orientation === 'horizontal' || i.orientation === 'both');

  if(repeat === 'repeated') items = items.filter(i => i.repeated);
  if(repeat === 'unique') items = items.filter(i => !i.repeated);

  items.forEach(it=>{
    const card = document.createElement('article'); card.className = 'feed-item';
    const thumb = document.createElement('div'); thumb.className = 'thumb'; thumb.textContent = it.orientation.toUpperCase();
    const meta = document.createElement('div'); meta.className = 'feed-meta';
    meta.innerHTML = `<h4>${escapeHtml(it.title)}</h4><p class="muted">Por ${escapeHtml(it.author)} · ${it.tags.join(', ')}</p>`;
    card.appendChild(thumb); card.appendChild(meta);
    list.appendChild(card);
  });
}

function renderAchievements(){
  if(!exists('achievementsList')) return;
  const ul = el('achievementsList'); ul.innerHTML = '';
  state.achievements.forEach(a=>{
    const li = document.createElement('li'); li.textContent = a; ul.appendChild(li);
  });
}

function updateProfileUI(){
  if(!exists('userBadge')) return;
  const badge = el('userBadge');
  const display = exists('profileDisplay') ? el('profileDisplay') : null;
  const handle = exists('profileHandle') ? el('profileHandle') : null;
  const naiText = exists('naiHandleText') ? el('naiHandleText') : null;

  if(state.user){
    badge.textContent = state.user.display || state.user.nai || 'Usuario';
    if(display) display.textContent = state.user.display || 'Usuario';
    if(handle) handle.textContent = (state.user.nai) ? '@' + state.user.nai : '@registrado';
    if(naiText) naiText.textContent = state.user.nai || '—';
    if(exists('logoutBtn')) el('logoutBtn').style.display = '';
    if(exists('registerBtn')) el('registerBtn').style.display = 'none';
    if(exists('loginBtn')) el('loginBtn').style.display = 'none';
  } else {
    badge.textContent = 'Invitado';
    if(display) display.textContent = 'Invitado';
    if(handle) handle.textContent = '@invitado';
    if(naiText) naiText.textContent = '—';
    if(exists('logoutBtn')) el('logoutBtn').style.display = 'none';
    if(exists('registerBtn')) el('registerBtn').style.display = '';
    if(exists('loginBtn')) el('loginBtn').style.display = '';
  }
  if(exists('profileGua')) el('profileGua').textContent = 'GUA: ' + state.gua;
  if(exists('gua-value')) el('gua-value').textContent = state.gua;
}

// Notes
function saveNotes(){
  if(!exists('noteBlock')) return;
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
  if(!exists('noteBlock')) return;
  if(state.user && state.user.registered){
    el('noteBlock').value = localStorage.getItem('nai_notes_' + state.user.id) || '';
  } else {
    el('noteBlock').value = localStorage.getItem(state.localNotesKey) || '';
  }
}
function clearNotes(){
  if(!exists('noteBlock')) return;
  if(!confirm('¿Borrar notas?')) return;
  if(state.user && state.user.registered) localStorage.removeItem('nai_notes_' + state.user.id);
  else localStorage.removeItem(state.localNotesKey);
  el('noteBlock').value = '';
}

// File preview
function handleFileSelect(e){
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  if(!exists('videoPreview')) return;
  const preview = el('videoPreview'); preview.innerHTML = '';
  const url = URL.createObjectURL(f);
  if(f.type.startsWith('video/')){
    const v = document.createElement('video'); v.src = url; v.controls = true; v.style.maxWidth = '100%'; v.style.height = 'auto';
    preview.appendChild(v);
  } else {
    const i = document.createElement('img'); i.src = url; i.style.maxWidth = '100%'; preview.appendChild(i);
  }
}

// Save metadata demo
function saveMetaDemo(){
  if(!exists('videoTags') || !exists('videoDesc') || !exists('videoOrientation')) return alert('Campos faltan (demo).');
  const tags = el('videoTags').value.split(',').map(s=>s.trim()).filter(Boolean);
  const desc = el('videoDesc').value.trim();
  const orientation = el('videoOrientation').value;
  const cropMode = document.querySelector('input[name="cropMode"]:checked') ? document.querySelector('input[name="cropMode"]:checked').value : 'vertical';
  const author = state.user ? state.user.nai : 'invitado';
  const id = 'f'+(Date.now());
  state.feed.unshift({ id, title: desc || 'Sin título', tags, orientation, repeated:false, author });
  renderFeed();
  alert('Metadatos guardados (demo).');
}

// Upload demo to Supabase Storage (requires bucket 'videos')
async function uploadToSupabaseStorage(){
  if(!supabase) return alert('Supabase no inicializado (demo).');
  const fileInput = el('videoFile');
  if(!fileInput || !fileInput.files || !fileInput.files[0]) return alert('Selecciona archivo primero');
  const file = fileInput.files[0];
  const path = `videos/${Date.now()}_${file.name}`;
  try{
    const { data, error } = await supabase.storage.from('videos').upload(path, file);
    if(error){ console.error(error); alert('Error subiendo (ver consola)'); return; }
    alert('Archivo subido a storage (demo). Ruta: ' + data.path);
  }catch(err){ console.error(err); alert('Error al subir (demo).'); }
}

// Auth demo (emailLike)
async function registerAccount(){
  if(!exists('inputNai') || !exists('inputPass')) return alert('Formulario no disponible (demo).');
  const display = el('inputDisplayName').value.trim();
  const nai = el('inputNai').value.trim();
  const pass = el('inputPass').value;
  if(!nai || !pass) return alert('Handle y contraseña requeridos.');
  if(!supabase) return alert('Supabase no disponible (demo).');
  try{
    const emailLike = nai + '@nai.local';
    const res = await supabase.auth.signUp({ email: emailLike, password: pass }, { data: { display, nai } });
    if(res.error) { console.warn(res.error); alert('Error creando cuenta (demo).'); return; }
    state.user = { id: res.data.user.id, display, nai, registered:true };
    updateProfileUI(); loadNotes(); alert('Cuenta creada (demo).');
  }catch(e){ console.error(e); alert('Error en registro.'); }
}
async function loginAccount(){
  if(!exists('inputNai') || !exists('inputPass')) return alert('Formulario no disponible (demo).');
  const nai = el('inputNai').value.trim();
  const pass = el('inputPass').value;
  if(!nai || !pass) return alert('Handle y contraseña requeridos.');
  if(!supabase) return alert('Supabase no disponible (demo).');
  try{
    const emailLike = nai + '@nai.local';
    const res = await supabase.auth.signInWithPassword({ email: emailLike, password: pass });
    if(res.error) { console.warn(res.error); alert('Error iniciando sesión (demo).'); return; }
    state.user = { id: res.data.user.id, display: res.data.user.user_metadata?.display || nai, nai, registered:true };
    updateProfileUI(); loadNotes(); alert('Sesión iniciada (demo).');
  }catch(e){ console.error(e); alert('Error al iniciar sesión.'); }
}
async function logout(){
  if(!supabase){ state.user = null; updateProfileUI(); loadNotes(); return; }
  await supabase.auth.signOut();
  state.user = null;
  updateProfileUI();
  loadNotes();
}

// GUA demo
function changeGua(delta, reason){
  state.gua = Math.max(0, state.gua + delta);
  if(exists('gua-value')) el('gua-value').textContent = state.gua;
  if(exists('profileGua')) el('profileGua').textContent = 'GUA: ' + state.gua;
  console.info('GUA change', delta, reason);
}

// Bind UI
function bindUI(){
  if(exists('feedFormat')) el('feedFormat').addEventListener('change', renderFeed);
  if(exists('feedRepeat')) el('feedRepeat').addEventListener('change', renderFeed);
  if(exists('videoFile')) el('videoFile').addEventListener('change', handleFileSelect);
  if(exists('saveMetaBtn')) el('saveMetaBtn').addEventListener('click', (e)=>{ e.preventDefault(); saveMetaDemo(); });
  if(exists('previewBtn')) el('previewBtn').addEventListener('click', (e)=>{ e.preventDefault(); if(exists('videoFile')){ const f = el('videoFile').files && el('videoFile').files[0]; if(!f) return alert('Selecciona archivo.'); const url = URL.createObjectURL(f); const preview = el('editorArea'); preview.innerHTML=''; if(f.type.startsWith('video/')){ const v=document.createElement('video'); v.src=url; v.controls=true; v.style.maxWidth='100%'; preview.appendChild(v);} else { const img=document.createElement('img'); img.src=url; img.style.maxWidth='100%'; preview.appendChild(img);} }});
  if(exists('uploadToStorageBtn')) el('uploadToStorageBtn').addEventListener('click',(e)=>{ e.preventDefault(); uploadToSupabaseStorage(); });
  if(exists('registerBtn')) el('registerBtn').addEventListener('click',(e)=>{ e.preventDefault(); registerAccount(); });
  if(exists('loginBtn')) el('loginBtn').addEventListener('click',(e)=>{ e.preventDefault(); loginAccount(); });
  if(exists('logoutBtn')) el('logoutBtn').addEventListener('click',(e)=>{ e.preventDefault(); logout(); });
  if(exists('saveNoteBtn')) el('saveNoteBtn').addEventListener('click',(e)=>{ e.preventDefault(); saveNotes(); });
  if(exists('clearNoteBtn')) el('clearNoteBtn').addEventListener('click',(e)=>{ e.preventDefault(); clearNotes(); });
}

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  seedFeed();
  seedAchievements();
  bindUI();
  renderFeed();
  renderAchievements();
  updateProfileUI();
  loadNotes();
  changeGua(10, 'Inicio demo');
  console.log('Nai Nai demo inicializado — CSS/JS cargados correctamente.');
});
