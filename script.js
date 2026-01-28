// js/app.js
// Manejo de bienvenida, términos, almacenamiento local, feed demo, búsqueda y subida demo.

const LS_ACCEPT = 'nai_accepted_v1';
const LS_ORIGIN = 'nai_origin_v1';
const LS_SETTINGS = 'nai_settings_v1';
const LS_NOTES = 'nai_notes_v1';
const LS_TIP = 'nai_tip_seen_v1';

const PREDEF_TAGS = ["Cocina","Video reacción","Crítica","Informativo","Noticia","Vlog","Gaming","Humor","Humor negro","Spoiler","No apto para todo público"];

const $ = id => document.getElementById(id);
const q = sel => Array.from(document.querySelectorAll(sel));

function showEl(el){ el.classList.remove('hidden'); }
function hideEl(el){ el.classList.add('hidden'); }
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  loadInitialState();
  populateUploaderTags();
  seedFeed();
  renderFeed();
});

/* ---------- UI binding ---------- */
function bindUI(){
  // Welcome/terms/origin
  $('btn-read').addEventListener('click', ()=> {
    $('termsModal').classList.remove('hidden');
    $('termsModal').setAttribute('aria-hidden','false');
  });
  $('btn-terms-close').addEventListener('click', ()=> {
    $('termsModal').classList.add('hidden');
    $('termsModal').setAttribute('aria-hidden','true');
  });
  $('btn-terms-accept').addEventListener('click', showOriginForm);
  $('btn-accept').addEventListener('click', showOriginForm);
  $('btn-origin-submit').addEventListener('click', submitOrigin);

  // Search & order
  $('searchBtn').addEventListener('click', renderFeed);
  $('searchInput').addEventListener('keydown', e => { if(e.key === 'Enter') renderFeed(); });
  $('orderSelect').addEventListener('change', renderFeed);

  // Upload
  $('previewBtn').addEventListener('click', previewUpload);
  $('uploadBtn').addEventListener('click', performUpload);

  // Nav
  $('navFeed').addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
  $('navUpload').addEventListener('click', ()=> document.querySelector('input[type=file]').scrollIntoView({behavior:'smooth'}));
  $('navProfile').addEventListener('click', ()=> alert('Perfil: interfaz demo.'));

  // Settings
  $('openSettings').addEventListener('click', toggleSettings);
  $('saveSettings').addEventListener('click', ()=> { saveSettingsFromUI(); saveSettings(); applySettings(); $('settingsPanel').classList.add('hidden'); });
  $('closeSettings').addEventListener('click', ()=> $('settingsPanel').classList.add('hidden'));
  $('showTagsAll').addEventListener('click', ()=> { localSettings.showTags = true; saveSettings(); applySettings(); });
  $('showTagsNone').addEventListener('click', ()=> { localSettings.showTags = false; saveSettings(); applySettings(); });

  // Notes
  $('saveNote').addEventListener('click', ()=> {
    localStorage.setItem(LS_NOTES, $('noteBlock').value || '');
    alert('Nota guardada.');
  });
  $('clearNote').addEventListener('click', ()=> {
    if(confirm('¿Borrar nota?')) { $('noteBlock').value=''; localStorage.removeItem(LS_NOTES); }
  });

  // Tip dismiss
  $('tipDismiss').addEventListener('click', ()=> {
    hideEl($('tip')); localStorage.setItem(LS_TIP,'1');
  });

  // Tag strip clicks
  q('.tags-strip .tag').forEach(btn=>btn.addEventListener('click', ()=>{
    q('.tags-strip .tag').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active'); renderFeed();
  }));
}

/* ---------- Initial state ---------- */
let localSettings = { ghostMode:'off', confirmMode:'important', reminderFreq:'onEntry', showTags:true };
let FEED = [];

function loadInitialState(){
  const accepted = localStorage.getItem(LS_ACCEPT);
  if(!accepted){
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('app').setAttribute('aria-hidden','true');
  } else {
    closeOverlay();
    if(!localStorage.getItem(LS_TIP)) showEl($('tip'));
  }

  const s = localStorage.getItem(LS_SETTINGS);
  if(s) localSettings = JSON.parse(s);

  const notes = localStorage.getItem(LS_NOTES) || '';
  $('noteBlock').value = notes;
  applySettings();
}

/* ---------- Overlay flow ---------- */
function showOriginForm(){
  $('termsModal').classList.add('hidden');
  $('termsModal').setAttribute('aria-hidden','true');
  $('originForm').classList.remove('hidden');
  $('originForm').setAttribute('aria-hidden','false');
}
function submitOrigin(){
  const val = $('originInput').value && $('originInput').value.trim();
  if(!val){ alert('Debes indicar cómo conociste Nai Nai (usuario, correo o plataforma).'); $('originInput').focus(); return; }
  localStorage.setItem(LS_ACCEPT,'1');
  localStorage.setItem(LS_ORIGIN, val);
  closeOverlay();
  showTipIfNeeded();
  initAfterEntry();
}
function closeOverlay(){
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('app').removeAttribute('aria-hidden');
}
function showTipIfNeeded(){ if(!localStorage.getItem(LS_TIP)) showEl($('tip')); }

/* ---------- Settings ---------- */
function toggleSettings(e){ e.preventDefault(); $('settingsPanel').classList.toggle('hidden'); }
function saveSettingsFromUI(){
  localSettings.ghostMode = $('ghostMode').value;
  localSettings.confirmMode = $('confirmMode').value;
  localSettings.reminderFreq = $('reminderFreq').value;
}
function saveSettings(){ localStorage.setItem(LS_SETTINGS, JSON.stringify(localSettings)); }
function applySettings(){
  // UI reflect
  if($('ghostMode')) $('ghostMode').value = localSettings.ghostMode;
  if($('confirmMode')) $('confirmMode').value = localSettings.confirmMode;
  if($('reminderFreq')) $('reminderFreq').value = localSettings.reminderFreq;
}

// js/app.js
// Manejo de bienvenida, términos, almacenamiento local, feed demo, búsqueda y subida demo.

const LS_ACCEPT = 'nai_accepted_v1';
const LS_ORIGIN = 'nai_origin_v1';
const LS_SETTINGS = 'nai_settings_v1';
const LS_NOTES = 'nai_notes_v1';
const LS_TIP = 'nai_tip_seen_v1';

const PREDEF_TAGS = ["Cocina","Video reacción","Crítica","Informativo","Noticia","Vlog","Gaming","Humor","Humor negro","Spoiler","No apto para todo público"];

const $ = id => document.getElementById(id);
const q = sel => Array.from(document.querySelectorAll(sel));

function showEl(el){ el.classList.remove('hidden'); }
function hideEl(el){ el.classList.add('hidden'); }
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  loadInitialState();
  populateUploaderTags();
  seedFeed();
  renderFeed();
});

/* ---------- UI binding ---------- */
function bindUI(){
  // Welcome/terms/origin
  $('btn-read').addEventListener('click', ()=> {
    $('termsModal').classList.remove('hidden');
    $('termsModal').setAttribute('aria-hidden','false');
  });
  $('btn-terms-close').addEventListener('click', ()=> {
    $('termsModal').classList.add('hidden');
    $('termsModal').setAttribute('aria-hidden','true');
  });
  $('btn-terms-accept').addEventListener('click', showOriginForm);
  $('btn-accept').addEventListener('click', showOriginForm);
  $('btn-origin-submit').addEventListener('click', submitOrigin);

  // Search & order
  $('searchBtn').addEventListener('click', renderFeed);
  $('searchInput').addEventListener('keydown', e => { if(e.key === 'Enter') renderFeed(); });
  $('orderSelect').addEventListener('change', renderFeed);

  // Upload
  $('previewBtn').addEventListener('click', previewUpload);
  $('uploadBtn').addEventListener('click', performUpload);

  // Nav
  $('navFeed').addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
  $('navUpload').addEventListener('click', ()=> document.querySelector('input[type=file]').scrollIntoView({behavior:'smooth'}));
  $('navProfile').addEventListener('click', ()=> alert('Perfil: interfaz demo.'));

  // Settings
  $('openSettings').addEventListener('click', toggleSettings);
  $('saveSettings').addEventListener('click', ()=> { saveSettingsFromUI(); saveSettings(); applySettings(); $('settingsPanel').classList.add('hidden'); });
  $('closeSettings').addEventListener('click', ()=> $('settingsPanel').classList.add('hidden'));
  $('showTagsAll').addEventListener('click', ()=> { localSettings.showTags = true; saveSettings(); applySettings(); });
  $('showTagsNone').addEventListener('click', ()=> { localSettings.showTags = false; saveSettings(); applySettings(); });

  // Notes
  $('saveNote').addEventListener('click', ()=> {
    localStorage.setItem(LS_NOTES, $('noteBlock').value || '');
    alert('Nota guardada.');
  });
  $('clearNote').addEventListener('click', ()=> {
    if(confirm('¿Borrar nota?')) { $('noteBlock').value=''; localStorage.removeItem(LS_NOTES); }
  });

  // Tip dismiss
  $('tipDismiss').addEventListener('click', ()=> {
    hideEl($('tip')); localStorage.setItem(LS_TIP,'1');
  });

  // Tag strip clicks
  q('.tags-strip .tag').forEach(btn=>btn.addEventListener('click', ()=>{
    q('.tags-strip .tag').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active'); renderFeed();
  }));
}

/* ---------- Initial state ---------- */
let localSettings = { ghostMode:'off', confirmMode:'important', reminderFreq:'onEntry', showTags:true };
let FEED = [];

function loadInitialState(){
  const accepted = localStorage.getItem(LS_ACCEPT);
  if(!accepted){
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('app').setAttribute('aria-hidden','true');
  } else {
    closeOverlay();
    if(!localStorage.getItem(LS_TIP)) showEl($('tip'));
  }

  const s = localStorage.getItem(LS_SETTINGS);
  if(s) localSettings = JSON.parse(s);

  const notes = localStorage.getItem(LS_NOTES) || '';
  $('noteBlock').value = notes;
  applySettings();
}

/* ---------- Overlay flow ---------- */
function showOriginForm(){
  $('termsModal').classList.add('hidden');
  $('termsModal').setAttribute('aria-hidden','true');
  $('originForm').classList.remove('hidden');
  $('originForm').setAttribute('aria-hidden','false');
}
function submitOrigin(){
  const val = $('originInput').value && $('originInput').value.trim();
  if(!val){ alert('Debes indicar cómo conociste Nai Nai (usuario, correo o plataforma).'); $('originInput').focus(); return; }
  localStorage.setItem(LS_ACCEPT,'1');
  localStorage.setItem(LS_ORIGIN, val);
  closeOverlay();
  showTipIfNeeded();
  initAfterEntry();
}
function closeOverlay(){
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('app').removeAttribute('aria-hidden');
}
function showTipIfNeeded(){ if(!localStorage.getItem(LS_TIP)) showEl($('tip')); }

/* ---------- Settings ---------- */
function toggleSettings(e){ e.preventDefault(); $('settingsPanel').classList.toggle('hidden'); }
function saveSettingsFromUI(){
  localSettings.ghostMode = $('ghostMode').value;
  localSettings.confirmMode = $('confirmMode').value;
  localSettings.reminderFreq = $('reminderFreq').value;
}
function saveSettings(){ localStorage.setItem(LS_SETTINGS, JSON.stringify(localSettings)); }
function applySettings(){
  // UI reflect
  if($('ghostMode')) $('ghostMode').value = localSettings.ghostMode;
  if($('confirmMode')) $('confirmMode').value = localSettings.confirmMode;
  if($('reminderFreq')) $('reminderFreq').value = localSettings.reminderFreq;
}

/* ---------- Feed ---------- */
function seedFeed(){
  FEED = [
    {id:'v1',title:'Receta express: pancakes',author:'@cocina_marta',tags:['Cocina'],date:Date.now()-86400000},
    {id:'v2',title:'Reacción al torneo',author:'@xreact',tags:['Video reacción','Gaming'],date:Date.now()-7200000},
    {id:'v3',title:'Análisis crítico de Película X',author:'@critico',tags:['Crítica','Informativo'],date:Date.now()-3600000},
    {id:'v4',title:'Vlog: paseo urbano',author:'@vlogger',tags:['Vlog'],date:Date.now()-600000}
  ];
}

function getActiveTag(){
  const b = document.querySelector('.tags-strip .tag.active');
  return b ? b.dataset.tag : 'all';
}

function renderFeed(){
  const listEl = $('feedList'); listEl.innerHTML = '';
  let list = FEED.slice();

  const activeTag = getActiveTag();
  if(activeTag && activeTag !== 'all') list = list.filter(i => i.tags.includes(activeTag));

  const qStr = ($('searchInput').value || '').trim().toLowerCase();
  if(qStr){
    list = list.filter(i => {
      return (i.title && i.title.toLowerCase().includes(qStr)) ||
             (i.author && i.author.toLowerCase().includes(qStr)) ||
             (i.tags && i.tags.join(' ').toLowerCase().includes(qStr)) ||
             (i.description && i.description.toLowerCase().includes(qStr));
    });
  }

  const ord = $('orderSelect').value;
  if(ord === 'new') list.sort((a,b)=>b.date - a.date);
  if(ord === 'old') list.sort((a,b)=>a.date - b.date);

  if(list.length === 0){
    const n = document.createElement('div'); n.className='card'; n.textContent='No se encontraron videos.'; listEl.appendChild(n); return;
  }

  list.forEach(item=>{
    const el = document.createElement('div'); el.className='video-item';
    el.innerHTML = `<div class="thumb">${escapeHtml(item.tags[0]||'')}</div>
      <div class="meta">
        <h4>${escapeHtml(item.title)}</h4>
        <p class="muted">Por ${escapeHtml(item.author)} · ${escapeHtml(item.tags.join(', '))}</p>
        <p class="muted" style="font-size:12px;margin-top:6px">${item.description ? escapeHtml(item.description) : ''}</p>
      </div>`;
    listEl.appendChild(el);
  });
}

/* ---------- Upload ---------- */
function populateUploaderTags(){
  const tagSelect = $('tagSelect');
  PREDEF_TAGS.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tag';
    b.textContent = t;
    b.dataset.tag = t;
    b.addEventListener('click', ()=> b.classList.toggle('active'));
    tagSelect.appendChild(b);
  });
}

function previewUpload(){
  const f = $('fileInput').files && $('fileInput').files[0];
  if(!f) return alert('Selecciona un archivo primero.');
  const box = $('previewBox'); box.innerHTML = '';
  const url = URL.createObjectURL(f);
  if(f.type.startsWith('video/')){
    const v = document.createElement('video'); v.src = url; v.controls = true; v.style.maxWidth = '100%'; box.appendChild(v);
  } else {
    const i = document.createElement('img'); i.src = url; i.style.maxWidth = '100%'; box.appendChild(i);
  }
}

function performUpload(){
  const f = $('fileInput').files && $('fileInput').files[0];
  if(!f) return alert('Selecciona un archivo.');
  const title = ($('titleInput').value||'').trim();
  if(!title) return alert('Añade un título.');
  const selected = Array.from($('tagSelect').querySelectorAll('.tag.active')).map(b=>b.dataset.tag);
  if(selected.length === 0) return alert('Debes seleccionar al menos una etiqueta predefinida.');
  const desc = ($('descInput').value||'').trim();
  const author = localStorage.getItem(LS_ORIGIN) || 'invitado';
  const item = { id:'v'+Date.now(), title, author:'@'+author, tags:selected, description:desc, date:Date.now() };
  FEED.unshift(item);
  renderFeed();
  // reset uploader
  $('fileInput').value=''; $('titleInput').value=''; $('descInput').value=''; $('previewBox').innerHTML='Previsualización';
  $('tagSelect').querySelectorAll('.tag.active').forEach(b=>b.classList.remove('active'));
  alert('Video subido (demo). Nota: Invitados no pueden crear encuestas ni monetizar.');
}

/* ---------- Profile / notes ---------- */
function updateProfileSummary(){
  const origin = localStorage.getItem(LS_ORIGIN) || 'Invitado';
  $('displayName').textContent = origin;
  $('userTag').textContent = 'usuario no registrado';
  $('guaDisplay').textContent = 'GUA: 0';
  const av = $('avatar'); av.textContent = (origin[0]||'U').toUpperCase();
}

/* ---------- After entry init ---------- */
function initAfterEntry(){
  updateProfileSummary();
  seedFeed();
  renderFeed();
}

/* ---------- Utility ---------- */
// simple query helper for arrays
function q(selector){
  return Array.from(document.querySelectorAll(selector));
}/* ---------- Feed ---------- */
function seedFeed(){
  FEED = [
    {id:'v1',title:'Receta express: pancakes',author:'@cocina_marta',tags:['Cocina'],date:Date.now()-86400000},
    {id:'v2',title:'Reacción al torneo',author:'@xreact',tags:['Video reacción','Gaming'],date:Date.now()-7200000},
    {id:'v3',title:'Análisis crítico de Película X',author:'@critico',tags:['Crítica','Informativo'],date:Date.now()-3600000},
    {id:'v4',title:'Vlog: paseo urbano',author:'@vlogger',tags:['Vlog'],date:Date.now()-600000}
  ];
}

function getActiveTag(){
  const b = document.querySelector('.tags-strip .tag.active');
  return b ? b.dataset.tag : 'all';
}

function renderFeed(){
  const listEl = $('feedList'); listEl.innerHTML = '';
  let list = FEED.slice();

  const activeTag = getActiveTag();
  if(activeTag && activeTag !== 'all') list = list.filter(i => i.tags.includes(activeTag));

  const qStr = ($('searchInput').value || '').trim().toLowerCase();
  if(qStr){
    list = list.filter(i => {
      return (i.title && i.title.toLowerCase().includes(qStr)) ||
             (i.author && i.author.toLowerCase().includes(qStr)) ||
             (i.tags && i.tags.join(' ').toLowerCase().includes(qStr)) ||
             (i.description && i.description.toLowerCase().includes(qStr));
    });
  }

  const ord = $('orderSelect').value;
  if(ord === 'new') list.sort((a,b)=>b.date - a.date);
  if(ord === 'old') list.sort((a,b)=>a.date - b.date);

  if(list.length === 0){
    const n = document.createElement('div'); n.className='card'; n.textContent='No se encontraron videos.'; listEl.appendChild(n); return;
  }

  list.forEach(item=>{
    const el = document.createElement('div'); el.className='video-item';
    el.innerHTML = `<div class="thumb">${escapeHtml(item.tags[0]||'')}</div>
      <div class="meta">
        <h4>${escapeHtml(item.title)}</h4>
        <p class="muted">Por ${escapeHtml(item.author)} · ${escapeHtml(item.tags.join(', '))}</p>
        <p class="muted" style="font-size:12px;margin-top:6px">${item.description ? escapeHtml(item.description) : ''}</p>
      </div>`;
    listEl.appendChild(el);
  });
}

/* ---------- Upload ---------- */
function populateUploaderTags(){
  const tagSelect = $('tagSelect');
  PREDEF_TAGS.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button';
