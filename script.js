// js/app.js - versión corregida con reglas modal
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const byId = (id) => document.getElementById(id);

const LS_RULES = 'nai_rules_accepted_v1';
const LS_USER = 'nai_user_v1';
const LS_FEED = 'nai_feed_v1';

function uid(prefix='u') { return prefix + Math.floor(Math.random()*1000000); }

let USER = { id: uid('u'), displayName:'Invitado', accountNai:'.nai-guest', role:'Usuario', gua:0, achievements:[], tags:[], ghost:{ like:'none', comment:'none', subscribe:'none', donate:'none', survey:'none', publicProfile:false, activityHidden:false } };
let FEED = [];

function saveState(){ localStorage.setItem(LS_USER, JSON.stringify(USER)); localStorage.setItem(LS_FEED, JSON.stringify(FEED)); }
function loadState(){ const u = localStorage.getItem(LS_USER); const f = localStorage.getItem(LS_FEED); if(u) USER = JSON.parse(u); if(f) FEED = JSON.parse(f); }
loadState();

// --- RULES modal management
function showRulesIfNeeded(){
  const accepted = localStorage.getItem(LS_RULES);
  if(!accepted){
    byId('rulesModal').classList.remove('hidden');
    // block interactions visually (optional): add overlay via CSS modal covers app
  } else {
    byId('rulesModal').classList.add('hidden');
  }
}

function acceptRules(){
  localStorage.setItem(LS_RULES, '1');
  byId('rulesModal').classList.add('hidden');
  showToast('Reglas aceptadas — Bienvenido a Nai Nai');
}

// --- basic UI and feed
function renderProfileCard(){
  byId('avatar').textContent = USER.displayName.charAt(0).toUpperCase();
  byId('displayName').textContent = USER.displayName;
  byId('accountNai').textContent = USER.accountNai;
  byId('roleBadge').textContent = USER.role;
  byId('guaValue').textContent = USER.gua;
  const pct = Math.min(100, (USER.gua % 120) / 120 * 100);
  const inner = document.getElementById('guaBarInner');
  if(inner) inner.style.width = pct + '%';
}

function populateTags(){
  const tags = ['Cocina','Videoreacción','Crítica','Informativo','Vlog','Gaming','Humor','Noticia','Educativo','Animación','Música'];
  const strip = byId('tagStrip');
  strip.innerHTML = '';
  tags.forEach(t=>{
    const b = document.createElement('button');
    b.className = 'tag';
    b.textContent = t;
    b.addEventListener('click', ()=> {
      $$('.tags button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      byId('formatFilter').value = 'both';
    });
    strip.appendChild(b);
  });
}

function renderFeed(){
  const container = byId('feedList');
  container.innerHTML = '';
  const feedData = FEED.length ? FEED : [
    { id:'v1', title:'Receta express: pancakes', author:'@cocina_marta', tags:['Cocina'], desc:'Rápido y rico', format:'horizontal'},
    { id:'v2', title:'Reacción al torneo', author:'@xreact', tags:['Videoreacción','Gaming'], desc:'Lo mejor', format:'vertical'},
    { id:'v3', title:'Análisis crítico de Película X', author:'@critico', tags:['Crítica','Informativo'], desc:'Opinión', format:'horizontal'},
  ];
  feedData.forEach(item=>{
    if(byId('formatFilter').value !== 'both' && item.format !== byId('formatFilter').value) return;
    const art = document.createElement('article'); art.className='feed-item';
    art.innerHTML = `<div class="thumb">${item.tags[0]||'VIDEO'}</div>
      <div class="meta"><h4 class="v-title">${item.title}</h4>
      <div class="v-meta">por <span class="v-author">${item.author}</span> · <span class="v-tags">${item.tags.join(', ')}</span></div>
      <p class="v-desc">${item.desc}</p>
      <div class="v-actions">
        <button class="btn ghost btn-like">Like</button>
        <button class="btn ghost btn-comment">Comentar</button>
        <button class="btn ghost btn-share">Compartir</button>
        <button class="btn ghost btn-report">Reportar</button>
      </div></div>`;
    art.querySelector('.btn-like').addEventListener('click', ()=>handleAction('like', item));
    art.querySelector('.btn-comment').addEventListener('click', ()=>handleAction('comment', item));
    art.querySelector('.btn-report').addEventListener('click', ()=>reportVideo(item));
    container.appendChild(art);
  });
}

// ghost action flow (lightweight)
function showGhostConfirm(action, cb){
  const setting = USER.ghost[action];
  if(setting && setting !== 'none'){
    if(!confirm(`Esta acción se registrará con modo fantasma (${setting}). Confirmar?`)) return;
    cb();
  } else {
    if(confirm('Deseas activar modo fantasma para esta acción (oculta nombre/foto)?')){
      const choice = prompt('Elige: name / photo / both (escribe one)', 'both');
      if(choice && ['name','photo','both'].includes(choice.toLowerCase())){
        USER.ghost[action] = choice.toLowerCase();
        saveState();
        renderProfileModalGhost();
        if(confirm('Modo fantasma activado para esta acción. Ejecutar acción ahora?')) cb();
      }
    } else cb();
  }
}

function handleAction(actionType, item){
  const key = actionType === 'comment' ? 'comment' : (actionType === 'like' ? 'like' : null);
  if(!key) return alert('Acción demo');
  showGhostConfirm(key, ()=>{
    USER.gua += 1;
    saveState();
    renderProfileCard();
    showToast('Acción realizada. +1 GUA');
  });
}

function reportVideo(item){
  const reason = prompt('¿Por qué reportas este vídeo? (leve, normal, grave, super)');
  if(!reason) return;
  byId('reportsList').textContent = `Reporte: ${item.title} — ${reason}`;
  showToast('Reporte enviado — será revisado');
  if(reason.toLowerCase() === 'false') { USER.gua = Math.max(0, USER.gua - 3); saveState(); renderProfileCard(); }
}

function uploadDemo(){
  const title = byId('titleInput').value || 'Sin título';
  const tags = (byId('tagsInput').value || '').split(',').map(s=>s.trim()).filter(Boolean);
  const format = (Math.random()>0.5)?'vertical':'horizontal';
  const item = { id: uid('v'), title, author: USER.displayName || USER.accountNai, tags, desc:'Demo', format };
  FEED.unshift(item); saveState(); renderFeed(); showToast('Video subido (demo)');
}

// profile modal ghost UI
function renderProfileModalGhost(){
  const grid = byId('ghostGrid'); if(!grid) return;
  grid.innerHTML = '';
  const actions = ['like','comment','subscribe','donate','survey'];
  actions.forEach(act=>{
    const row = document.createElement('div'); row.className='ghost-row';
    const label = document.createElement('div'); label.textContent = `Ocultar identidad al ${act}`;
    const opts = document.createElement('div'); opts.className='ghost-options';
    ['none','name','photo','both'].forEach(opt=>{
      const b = document.createElement('button'); b.className='ghost-option';
      b.textContent = opt === 'none'? 'No' : (opt === 'name'? 'Nombre' : (opt === 'photo' ? 'Foto' : 'Ambos'));
      if(USER.ghost[act] === opt) b.style.borderColor = 'var(--accent1)';
      b.addEventListener('click', ()=>{ USER.ghost[act] = opt; saveState(); renderProfileModalGhost(); });
      opts.appendChild(b);
    });
    row.appendChild(label); row.appendChild(opts); grid.appendChild(row);
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
  publicRow.appendChild(pLabel); publicRow.appendChild(pOpt); grid.appendChild(publicRow);

  const actRow = document.createElement('div'); actRow.className='ghost-row';
  const aLabel = document.createElement('div'); aLabel.textContent='No aparecer en actividad pública';
  const aOpt = document.createElement('div'); aOpt.className='ghost-options';
  const aOn = document.createElement('button'); aOn.className='ghost-option'; aOn.textContent='Activar';
  const aOff = document.createElement('button'); aOff.className='ghost-option'; aOff.textContent='Desactivar';
  if(USER.ghost.activityHidden) aOn.style.borderColor='var(--accent1)'; else aOff.style.borderColor='var(--accent1)';
  aOn.addEventListener('click', ()=>{ USER.ghost.activityHidden=true; saveState(); renderProfileModalGhost(); });
  aOff.addEventListener('click', ()=>{ USER.ghost.activityHidden=false; saveState(); renderProfileModalGhost(); });
  aOpt.appendChild(aOn); aOpt.appendChild(aOff); actRow.appendChild(aLabel); actRow.appendChild(aOpt); grid.appendChild(actRow);
}

// small UI helpers
function showToast(msg){ const t = document.createElement('div'); t.className='toast'; t.textContent = msg; Object.assign(t.style,{position:'fixed',right:'18px',bottom:'18px',background:'linear-gradient(90deg,var(--accent1),var(--accent2))',padding:'10px 14px',borderRadius:'10px',color:'#021018',zIndex:9999}); document.body.appendChild(t); setTimeout(()=> t.remove(), 2400); }

function init(){
  // wire event listeners
  byId('btnAcceptRules').addEventListener('click', acceptRules);
  byId('btnReadMore').addEventListener('click', ()=>{ byId('readMoreModal').classList.remove('hidden'); });
  $$('.modal .close').forEach(btn=>btn.addEventListener('click', ()=> $$('.modal').forEach(m=>m.classList.add('hidden'))));
  $$('.modal [data-action="close"]').forEach(b=>b.addEventListener('click', ()=> $$('.modal').forEach(m=>m.classList.add('hidden'))));

  byId('openProfileBtn').addEventListener('click', ()=> { byId('profileModal').classList.remove('hidden'); });
  byId('openUploadBtn').addEventListener('click', ()=> { byId('uploadModal').classList.remove('hidden'); });
  byId('previewBtn').addEventListener('click', ()=> { /* preview handled earlier */ });
  byId('uploadBtn').addEventListener('click', uploadDemo);
  byId('openModPanel').addEventListener('click', ()=> byId('modPanel').classList.remove('hidden'));

  populateTags();
  renderProfileCard();
  renderFeed();
  renderProfileModalGhost();
  showRulesIfNeeded();
}

document.addEventListener('DOMContentLoaded', init);
