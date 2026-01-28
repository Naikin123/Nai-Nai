// js/app.js
// Lógica principal: overlay/terms/origin, feed demo, búsqueda, uploader, settings minimal.
// Asegúrate de subir este archivo a ./js/app.js (ruta relativa desde index.html).

const LS_ACCEPT = 'nai_accepted_v1';
const LS_ORIGIN = 'nai_origin_v1';
const LS_SETTINGS = 'nai_settings_v1';
const LS_NOTES = 'nai_notes_v1';
const LS_TIP = 'nai_tip_seen_v1';

const PREDEF_TAGS = ["Cocina","Video reacción","Crítica","Informativo","Noticia","Vlog","Gaming","Humor","Humor negro","Spoiler","No apto para todo público"];

const $ = id => document.getElementById(id);
const q = sel => Array.from(document.querySelectorAll(sel));
const escapeHtml = s => String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  loadInitialState();
  populateUploaderTags();
  seedFeed();
  renderFeed();
});

function bindUI(){
  // overlay controls
  if($('btn-read')) $('btn-read').addEventListener('click', ()=> { $('termsModal').classList.remove('hidden'); $('termsModal').setAttribute('aria-hidden','false'); });
  if($('btn-terms-close')) $('btn-terms-close').addEventListener('click', ()=> { $('termsModal').classList.add('hidden'); $('termsModal').setAttribute('aria-hidden','true'); });
  if($('btn-terms-accept')) $('btn-terms-accept').addEventListener('click', showOriginForm);
  if($('btn-accept')) $('btn-accept').addEventListener('click', showOriginForm);
  if($('btn-origin-submit')) $('btn-origin-submit').addEventListener('click', submitOrigin);

  // search
  if($('searchBtn')) $('searchBtn').addEventListener('click', renderFeed);
  if($('searchInput')) $('searchInput').addEventListener('keydown', e=> { if(e.key==='Enter') renderFeed(); });
  if($('orderSelect')) $('orderSelect').addEventListener('change', renderFeed);

  // upload
  if($('previewBtn')) $('previewBtn').addEventListener('click', previewUpload);
  if($('uploadBtn')) $('uploadBtn').addEventListener('click', performUpload);

  // settings
  if($('openSettings')) $('openSettings').addEventListener('click', toggleSettings);
  if($('saveSettings')) $('saveSettings').addEventListener('click', ()=> { saveSettingsFromUI(); saveSettings(); applySettings(); $('settingsPanel').classList.add('hidden'); });
  if($('closeSettings')) $('closeSettings').addEventListener('click', ()=> $('settingsPanel').classList.add('hidden'));
  if($('showTagsAll')) $('showTagsAll').addEventListener('click', ()=> { localSettings.showTags = true; saveSettings(); applySettings(); });
  if($('showTagsNone')) $('showTagsNone').addEventListener('click', ()=> { localSettings.showTags = false; saveSettings(); applySettings(); });

  // notes
  if($('saveNote')) $('saveNote').addEventListener('click', ()=> { localStorage.setItem(LS_NOTES, $('noteBlock').value || ''); alert('Nota guardada.'); });
  if($('clearNote')) $('clearNote').addEventListener('click', ()=> { if(confirm('¿Borrar nota?')) { $('noteBlock').value=''; localStorage.removeItem(LS_NOTES); } });

  // tip dismiss
  if($('tipDismiss')) $('tipDismiss').addEventListener('click', ()=> { $('tip').classList.add('hidden'); localStorage.setItem(LS_TIP,'1'); });

  // tag strip listeners
  q('.tags-strip .tag').forEach(btn => btn.addEventListener('click', ()=> { q('.tags-strip .tag').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); renderFeed(); }));
}

let localSettings = { ghostMode:'off', confirmMode:'important', reminderFreq:'onEntry', showTags:true };
let FEED = [];

function loadInitialState(){
  const accepted = localStorage.getItem(LS_ACCEPT);
  if(!accepted){
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('app').setAttribute('aria-hidden','true');
  } else {
    closeOverlay();
    if(!localStorage.getItem(LS_TIP)) $('tip').classList.remove('hidden');
  }
  const s = localStorage.getItem(LS_SETTINGS);
  if(s) localSettings = JSON.parse(s);
  const notes = localStorage.getItem(LS_NOTES) || '';
  if($('noteBlock')) $('noteBlock').value = notes;
  applySettings();
}

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
  if(!localStorage.getItem(LS_TIP)) $('tip').classList.remove('hidden');
  initAfterEntry();
}
function closeOverlay(){ document.getElementById('overlay').style.display='none'; document.getElementById('app').removeAttribute('aria-hidden'); }

function toggleSettings(e){ e && e.preventDefault(); $('settingsPanel').classList.toggle('hidden'); }
function saveSettingsFromUI(){ if($('ghostMode')) localSettings.ghostMode = $('ghostMode').value; if($('confirmMode')) localSettings.confirmMode = $('confirmMode').value; if($('reminderFreq')) localSettings.reminderFreq = $('reminderFreq').value; }
function saveSettings(){ localStorage.setItem(LS_SETTINGS, JSON.stringify(localSettings)); }
function applySettings(){ if($('ghostMode')) $('ghostMode').value = localSettings.ghostMode; if($('confirmMode')) $('confirmMode').value = localSettings.confirmMode; if($('reminderFreq')) $('reminderFreq').value = localSettings.reminderFreq; }

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
  const listEl = $('feedList'); if(!listEl) return; listEl.innerHTML = '';
  let list = FEED.slice();
  const activeTag = getActiveTag();
  if(activeTag && activeTag !== 'all') list = list.filter(i => i.tags.includes(activeTag));
  const qStr = ($('searchInput').value || '').trim().toLowerCase();
  if(qStr){
    list = list.filter(i => (i.title && i.title.toLowerCase().includes(qStr)) || (i.author && i.author.toLowerCase().includes(qStr)) || (i.tags && i.tags.join(' ').toLowerCase().includes(qStr)) || (i.description && i.description.toLowerCase().includes(qStr)));
  }
  const ord = $('orderSelect').value;
  if(ord === 'new') list.sort((a,b)=>b.date - a.date);
  if(ord === 'old') list.sort((a,b)=>a.date - b.date);

  if(list.length === 0){ const n = document.createElement('div'); n.className='card'; n.textContent='No se encontraron videos.'; listEl.appendChild(n); return; }

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

function populateUploaderTags(){
  const tagSelect = $('tagSelect'); if(!tagSelect) return;
  PREDEF_TAGS.forEach(t=>{
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tag'; b.textContent = t; b.dataset.tag = t;
    b.addEventListener('click', ()=> b.classList.toggle('active'));
    tagSelect.appendChild(b);
  });
}

function previewUpload(){
  const f = $('fileInput').files && $('fileInput').files[0]; if(!f) return alert('Selecciona un archivo primero.');
  const box = $('previewBox'); box.innerHTML = ''; const url = URL.createObjectURL(f);
  if(f.type.startsWith('video/')){ const v = document.createElement('video'); v.src = url; v.controls = true; v.style.maxWidth='100%'; box.appendChild(v); }
  else { const i = document.createElement('img'); i.src = url; i.style.maxWidth='100%'; box.appendChild(i); }
}

function performUpload(){
  const f = $('fileInput').files && $('fileInput').files[0]; if(!f) return alert('Selecciona un archivo.');
  const title = ($('titleInput').value||'').trim(); if(!title) return alert('Añade un título.');
  const selected = Array.from($('tagSelect').querySelectorAll('.tag.active')).map(b=>b.dataset.tag); if(selected.length === 0) return alert('Debes seleccionar al menos una etiqueta predefinida.');
  const desc = ($('descInput').value||'').trim(); const author = localStorage.getItem(LS_ORIGIN) || 'invitado';
  const item = { id:'v'+Date.now(), title, author:'@'+author, tags:selected, description:desc, date:Date.now() };
  FEED.unshift(item); renderFeed();
  $('fileInput').value=''; $('titleInput').value=''; $('descInput').value=''; $('previewBox').innerHTML='Previsualización';
  $('tagSelect').querySelectorAll('.tag.active').forEach(b=>b.classList.remove('active'));
  alert('Video subido (demo). Nota: Invitados no pueden crear encuestas ni monetizar.');
}

function updateProfileSummary(){
  const origin = localStorage.getItem(LS_ORIGIN) || 'Invitado'; if($('displayName')) $('displayName').textContent = origin;
  if($('userTag')) $('userTag').textContent = 'usuario no registrado';
  if($('guaDisplay')) $('guaDisplay').textContent = 'GUA: 0';
  const av = $('avatar'); if(av) av.textContent = (origin[0]||'U').toUpperCase();
}

function initAfterEntry(){ updateProfileSummary(); seedFeed(); renderFeed(); }
