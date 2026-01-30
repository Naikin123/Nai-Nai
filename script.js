// Simple, self-contained frontend demo for Nai Nai prototype.
// No backend — uses localStorage to persist minimal state.
// Place this file at js/app.js

// ---- Utilities ----
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const byId = (id) => document.getElementById(id);

const LS_USER = 'nai_user_v1';
const LS_NOTES = 'nai_notes_v1';
const LS_FEED = 'nai_feed_v1';

function uid(prefix='u') { return prefix + Math.floor(Math.random()*1000000); }
function safeText(s){ return (s||'').toString().trim(); }

// ---- Initial data ----
let USER = {
  id: uid('u'),
  displayName: 'Invitado',
  accountNai: '.nai-guest',
  role: 'Usuario',
  gua: 0,
  achievements: [],
  tags: [],
  ghost: {
    like: 'none', // options: none, name, photo, both
    comment: 'none',
    subscribe: 'none',
    donate: 'none',
    survey: 'none',
    publicProfile: false,
    activityHidden: false
  }
};

let FEED = [
  { id:'v1', title:'Receta express: pancakes', author:'@cocina_marta', tags:['Cocina'], desc:'Rápido y rico', format:'horizontal'},
  { id:'v2', title:'Reacción al torneo', author:'@xreact', tags:['Videoreacción','Gaming'], desc:'Lo mejor', format:'vertical'},
  { id:'v3', title:'Análisis crítico de Película X', author:'@critico', tags:['Crítica','Informativo'], desc:'Opinión', format:'horizontal'},
];

function saveState(){
  localStorage.setItem(LS_USER, JSON.stringify(USER));
  localStorage.setItem(LS_FEED, JSON.stringify(FEED));
}
function loadState(){
  const u = localStorage.getItem(LS_USER);
  const f = localStorage.getItem(LS_FEED);
  if(u) USER = JSON.parse(u);
  if(f) FEED = JSON.parse(f);
}
loadState();

// ---- Render helpers ----
function renderProfileCard(){
  byId('avatar').textContent = USER.displayName.charAt(0).toUpperCase();
  byId('displayName').textContent = USER.displayName;
  byId('accountNai').textContent = USER.accountNai;
  byId('roleBadge').textContent = USER.role;
  byId('guaValue').textContent = USER.gua;
  const pct = Math.min(100, (USER.gua % 120) / 120 * 100);
  const inner = byId('guaBarInner') || byId('guaBarFull');
  if(inner) inner.style.width = pct + '%';
}

function renderFeed(){
  const container = byId('feedList');
  container.innerHTML = '';
  const tpl = byId('feedItemTpl');
  const viewMode = byId('viewMode').value;
  const filterFormat = byId('formatFilter').value;

  FEED.forEach(item => {
    if(filterFormat !== 'both' && item.format !== filterFormat) return;
    const el = tpl.content.cloneNode(true);
    const article = el.querySelector('.feed-item');
    article.querySelector('.thumb').textContent = item.tags[0] || 'VIDEO';
    article.querySelector('.v-title').textContent = item.title;
    article.querySelector('.v-author').textContent = item.author;
    article.querySelector('.v-tags').textContent = item.tags.join(', ');
    article.querySelector('.v-desc').textContent = item.desc;
    // actions
    article.querySelector('.btn-like').addEventListener('click', ()=>handleAction('like', item));
    article.querySelector('.btn-comment').addEventListener('click', ()=>handleAction('comment', item));
    article.querySelector('.btn-share').addEventListener('click', ()=>alert('Compartir (demo)'));
    article.querySelector('.btn-report').addEventListener('click', ()=>reportVideo(item));
    container.appendChild(el);
  });
}

// ---- Actions: ghost confirm & apply ----
function showGhostConfirm(action, cb){
  // If ghost setting is non-none, just apply.
  const setting = USER.ghost[action];
  if(setting && setting !== 'none'){
    // show a tiny prompt on first time
    if(!confirm(`Esta acción se registrará con modo fantasma (${setting}). Confirmar?`)) return;
    cb();
  } else {
    // offer to activate
    if(confirm('Quieres activar modo fantasma para esta acción (oculta nombre/foto)?')){
      // show quick choice: name/photo/both
      const choice = prompt('Elige: name / photo / both (escribe one)', 'both');
      if(choice && ['name','photo','both'].includes(choice.toLowerCase())){
        USER.ghost[action] = choice.toLowerCase();
        saveState();
        renderProfileModalGhost();
        if(confirm('Modo fantasma activado para esta acción. Ejecutar acción ahora?')) cb();
      }
    } else {
      // execute normally
      cb();
    }
  }
}

function handleAction(actionType, item){
  // map actionType to ghost key: like -> like; comment -> comment
  const key = actionType === 'comment' ? 'comment' : (actionType === 'like' ? 'like' : null);
  if(!key) return alert('Acción demo');
  showGhostConfirm(key, ()=>{
    // perform action
    // increment gua for engagement demo
    USER.gua += 1;
    saveState();
    renderProfileCard();
    showToast('Acción realizada. +1 GUA');
  });
}

// ---- Reporting ----
function reportVideo(item){
  const reason = prompt('¿Por qué reportas este vídeo? (leve, normal, grave, super)');
  if(!reason) return;
  const r = reason.toLowerCase();
  // push to report list (local demo)
  const reportsEl = byId('reportsList');
  reportsEl.textContent = `Reporte: ${item.title} — ${r}`;
  // moderate notification
  showToast('Reporte enviado — será revisado');
  // small effect: if it's false or abuse -> reduce GUA (demo)
  if(r === 'false') USER.gua = Math.max(0, USER.gua - 3);
  saveState();
  renderProfileCard();
}

// ---- Upload demo ----
function populateTags(){
  const tags = ['Cocina','Videoreacción','Crítica','Informativo','Vlog','Gaming','Humor','Noticia','Educativo','Animación','Música'];
  const strip = byId('tagStrip');
  strip.innerHTML = '';
  tags.forEach(t=>{
    const b = document.createElement('button');
    b.className = 'tag';
    b.textContent = t;
    b.addEventListener('click', ()=> {
      // toggle active
      $$('.tags button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      // quick filter:
      byId('formatFilter').value = 'both';
    });
    strip.appendChild(b);
  });
}

function initUI(){
  // wire basic buttons
  byId('openProfileBtn').addEventListener('click', ()=> openProfileModal());
  byId('openProfileFull').addEventListener('click', ()=> openProfileModal());
  byId('openUploadBtn').addEventListener('click', ()=> openUploadModal());
  byId('previewBtn').addEventListener('click', previewUpload);
  byId('uploadBtn').addEventListener('click', uploadDemo);
  byId('saveNote').addEventListener('click', ()=> {
    localStorage.setItem(LS_NOTES, byId('noteBlock').value||'');
    showToast('Nota guardada localmente');
  });
  byId('clearNote').addEventListener('click', ()=> { if(confirm('Borrar nota?')) { byId('noteBlock').value=''; localStorage.removeItem(LS_NOTES); }});
  byId('viewMode').addEventListener('change', renderFeed);
  byId('formatFilter').addEventListener('change', renderFeed);
  byId('btnInfinite').addEventListener('click', toggleInfinite);
  byId('openModPanel').addEventListener('click', ()=> openModPanel());
  byId('warnBtn')?.addEventListener('click', ()=> showToast('Advertencia enviada (demo)'));
  byId('limitBtn')?.addEventListener('click', ()=> showToast('Funciones limitadas (demo)'));
  byId('suspendBtn')?.addEventListener('click', ()=> { if(confirm('Confirmar suspensión demo?')) showToast('Usuario suspendido (demo)'); });

  // modal close
  $$('.modal .close').forEach(btn=>btn.addEventListener('click', ()=> closeAllModals()));
  $$('[data-action="close"]').forEach(b=>b.addEventListener('click', ()=> closeAllModals()));

  // profile save
  byId('saveProfile').addEventListener('click', ()=> {
    USER.displayName = byId('displayNameInput').value || USER.displayName;
    USER.tags = Array.from($$('.profile-tags input')).filter(i=>i.checked).map(i=>i.value);
    saveState();
    renderProfileCard();
    showToast('Perfil guardado');
  });

  // profile values load
  byId('displayNameInput').value = USER.displayName;
  byId('bioInput').value = USER.bio || '';

  // load notes
  const n = localStorage.getItem(LS_NOTES);
  if(n) byId('noteBlock').value = n;

  // load gua left bar
  renderProfileCard();
  populateTags();
  renderFeed();
  renderProfileModalGhost();
  loadFeedFromStorage();
}

function previewUpload(){
  const f = byId('fileInput').files && byId('fileInput').files[0];
  const box = byId('previewBox');
  if(!f){ box.textContent = 'Selecciona un archivo'; return; }
  const url = URL.createObjectURL(f);
  box.innerHTML = '';
  if(f.type.startsWith('video/')) {
    const v = document.createElement('video'); v.src = url; v.controls=true; v.style.maxWidth='100%'; box.appendChild(v);
  } else {
    const i = document.createElement('img'); i.src = url; i.style.maxWidth='100%'; box.appendChild(i);
  }
}

function uploadDemo(){
  const title = byId('titleInput').value || 'Sin título';
  const tags = (byId('tagsInput').value || '').split(',').map(s=>s.trim()).filter(Boolean);
  const format = (Math.random()>0.5)?'vertical':'horizontal';
  const item = { id: uid('v'), title, author: USER.displayName || USER.accountNai, tags, desc:'Demo', format };
  FEED.unshift(item);
  saveState();
  renderFeed();
  showToast('Video subido (demo). Si un usuario registrado te da dinero puedes monetizar');
}

// ---- Profile modal & ghost UI ----
function openProfileModal(){
  byId('profileModal').classList.remove('hidden');
  byId('displayNameInput').value = USER.displayName;
  byId('accountNaiFull').textContent = USER.accountNai;
  byId('guaValueFull').textContent = USER.gua;
  byId('guaBarFull').style.width = Math.min(100, (USER.gua % 120)/120*100) + '%';
  // render tags and achievements
  const tagsEl = byId('profileTags'); tagsEl.innerHTML = '';
  (USER.tags || []).forEach(t=>{
    const chip = document.createElement('div'); chip.className='chip'; chip.textContent = t; tagsEl.appendChild(chip);
  });
  const ach = byId('achList'); ach.innerHTML = '';
  (USER.achievements || []).forEach(a=>{
    const d = document.createElement('div'); d.className='ach'; d.textContent = a; ach.appendChild(d);
  });
  renderProfileModalGhost();
}

function closeAllModals(){
  $$('.modal').forEach(m=>m.classList.add('hidden'));
}

function renderProfileModalGhost(){
  const grid = byId('ghostGrid'); grid.innerHTML = '';
  const actions = ['like','comment','subscribe','donate','survey'];
  actions.forEach(act=>{
    const row = document.createElement('div'); row.className='ghost-row';
    const label = document.createElement('div'); label.textContent = `Ocultar identidad al ${act}`;
    const opts = document.createElement('div'); opts.className='ghost-options';
    ['none','name','photo','both'].forEach(opt=>{
      const b = document.createElement('button'); b.className='ghost-option';
      b.textContent = opt === 'none'? 'No' : (opt === 'name'? 'Nombre' : (opt === 'photo' ? 'Foto' : 'Ambos'));
      if(USER.ghost[act] === opt) b.style.borderColor = 'var(--accent1)';
      b.addEventListener('click', ()=>{
        USER.ghost[act] = opt;
        saveState();
        renderProfileModalGhost();
      });
      opts.appendChild(b);
    });
    row.appendChild(label);
    row.appendChild(opts);
    grid.appendChild(row);
  });

  // public profile & activity
  const publicRow = document.createElement('div'); publicRow.className='ghost-row';
  const pLabel = document.createElement('div'); pLabel.textContent = 'Ocultar perfil público';
  const pOpt = document.createElement('div'); pOpt.className='ghost-options';
  const btnOn = document.createElement('button'); btnOn.className='ghost-option'; btnOn.textContent='Activar';
  const btnOff = document.createElement('button'); btnOff.className='ghost-option'; btnOff.textContent='Desactivar';
  if(USER.ghost.publicProfile) btnOn.style.borderColor='var(--accent1)'; else btnOff.style.borderColor='var(--accent1)';
  btnOn.addEventListener('click', ()=>{ USER.ghost.publicProfile=true; saveState(); renderProfileModalGhost(); });
  btnOff.addEventListener('click', ()=>{ USER.ghost.publicProfile=false; saveState(); renderProfileModalGhost(); });
  pOpt.appendChild(btnOn); pOpt.appendChild(btnOff);
  publicRow.appendChild(pLabel); publicRow.appendChild(pOpt);
  grid.appendChild(publicRow);

  const actRow = document.createElement('div'); actRow.className='ghost-row';
  const aLabel = document.createElement('div'); aLabel.textContent='No aparecer en actividad pública';
  const aOpt = document.createElement('div'); aOpt.className='ghost-options';
  const aOn = document.createElement('button'); aOn.className='ghost-option'; aOn.textContent='Activar';
  const aOff = document.createElement('button'); aOff.className='ghost-option'; aOff.textContent='Desactivar';
  if(USER.ghost.activityHidden) aOn.style.borderColor='var(--accent1)'; else aOff.style.borderColor='var(--accent1)';
  aOn.addEventListener('click', ()=>{ USER.ghost.activityHidden=true; saveState(); renderProfileModalGhost(); });
  aOff.addEventListener('click', ()=>{ USER.ghost.activityHidden=false; saveState(); renderProfileModalGhost(); });
  aOpt.appendChild(aOn); aOpt.appendChild(aOff);
  actRow.appendChild(aLabel); actRow.appendChild(aOpt);
  grid.appendChild(actRow);
}

// ---- Moderation panel ----
function openModPanel(){
  byId('modPanel').classList.remove('hidden');
  // load reports region
  byId('modReports').innerHTML = byId('reportsList').textContent || 'Sin reportes';
}

// ---- small helpers & UI
function showToast(msg){
  const t = document.createElement('div'); t.className='toast'; t.textContent = msg;
  Object.assign(t.style,{position:'fixed',right:'18px',bottom:'18px',background:'linear-gradient(90deg,var(--accent1),var(--accent2))',padding:'10px 14px',borderRadius:'10px',color:'#021018',zIndex:9999});
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 2500);
}

function toggleInfinite(){
  const sel = byId('viewMode');
  sel.value = (sel.value === 'reels') ? 'list' : 'reels';
  renderFeed();
  showToast('Modo infinito: ' + (sel.value === 'reels' ? 'ON' : 'OFF'));
}

// ---- feed store/load ----
function saveFeedToStorage(){ localStorage.setItem(LS_FEED, JSON.stringify(FEED)); }
function loadFeedFromStorage(){ const s=localStorage.getItem(LS_FEED); if(s) FEED = JSON.parse(s); }

// ---- boot ----
document.addEventListener('DOMContentLoaded', ()=>{
  initUI();
  // wire modal interaction for upload modal
  byId('openUploadBtn').addEventListener('click', ()=> { byId('uploadModal').classList.remove('hidden'); });
  byId('publishBtn').addEventListener('click', ()=> {
    const title = byId('titleInputModal').value || 'Sin título';
    const tags = (byId('tagsInputModal').value||'').split(',').map(s=>s.trim()).filter(Boolean);
    const format = Math.random()>0.5?'vertical':'horizontal';
    const item = { id: uid('v'), title, author: USER.displayName||USER.accountNai, tags, desc: byId('descInputModal').value||'', format };
    FEED.unshift(item); saveState(); renderFeed(); closeAllModals(); showToast('Video publicado (demo).'); 
  });

  // small: allow sample GUA events
  document.body.addEventListener('keydown', (e)=>{
    if(e.key === 'g'){ USER.gua += 1; saveState(); renderProfileCard(); showToast('+1 GUA'); }
    if(e.key === 'G'){ USER.gua = Math.max(0, USER.gua-1); saveState(); renderProfileCard(); showToast('-1 GUA'); }
  });
});
