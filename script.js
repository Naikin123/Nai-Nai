// 1. CONFIGURACIÓN Y DATOS

const categorias = [

"Gracioso", "Epico", "Educativo", "Motivacional", "Animación",

"Proyectos Indy", "Videojuegos", "Tutorial", "Vlog",

"Musical", "Documental", "Cocina/Recetas"

1:

let misGua 600;

let usuarioActual = "Nai-kin";

let avatarActual = "https://i.ibb.co/jkcM4khz/file-000000000bd461fb894402f0ff51670d.png";

// SIMULACIÓN DE BASE DE DATOS (Videos de "otros")

let feedGlobal = [

{

id: 1, usuario: "DarkAngel_99", avatar: "https://i.ibb.co/XZTpkLPW/file-00000000566061f7b0aca36e6e40d8c0.png",

video: "https://www.w3schools.com/html/mov_bbb.mp4", // Video de ejemplo

desc: "Probando animación nueva #Animación",

tag: "Animación", likes: 120, naria: false,

comentarios: [{user: "Fan1", text: "Increible!"}]

},

{

id: 2, usuario: "Chef_Ramses", avatar: "https://i.ibb.co/hRTfBsKL/47-sin-t-tulo11.png",

video: "https://www.w3schools.com/html/movie.mp4",

desc: "Receta rápida de pasta #Cocina",

tag: "Cocina/Recetas", likes: 45, naria: false,

comentarios: []

1;

let misVideos = [];

112 INICIO

window.onload = () => {

cargar Tags();

renderFeed('global'); // Muestra videos globales al inicio

cargarGaleria();

};

// 3. FUNCIONES VISUALES

function cargar Tags() {

const cont = document.getElementById("listaTags");

cont.innerHTML = "<span class="tag-pill activo" onclick="filtrar(this, 'todo')">Todo</span>";

categorias.forEach(cat => {

cont.innerHTML += '<span class="tag-pill" onclick="filtrar(this, '${cat}')">${cat}

</span>:

});

}

function cambiar Tab(modo) {

document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));

event.target.classList.add("activo');

renderFeed(modo);

}

function filtrar(elemento, categoria) (

document.querySelectorAll('.tag-pill').forEach(t => t.classList.remove('activo'));

elemento.classList.add('activo');

alert('Filtrando por: $(categoria) (Aquí se actualizaría el feed)");

      }

    //----4. RENDERIZADO DE VIDEOS (EL CORAZÓN DE LA APP)

function render Feed(modo) {

const contenedor document.getElementById("feed-videos");

contenedor.innerHTML="

const lista modo === 'global' ? feedGlobal: misVideos;

if(lista.length === 0) {

contenedor.innerHTML = "<p style='text-align:center; color: #555;'>No hay videos aquí aún.

</p>";

return;

}

lista.forEach(post => {

let comentariosHTML post.comentarios.map(c => <div><strong>${c.user}:</strong> ${c.text)</div>').join('');

let card document.createElement("div");

card.className = "post-card";

card.innerHTML =

<div class="post-header">

<div style="display: flex; align-items:center; gap:10px;">

<img src="${post.avatar)" style="width: 35px; height:35px; border-

radius: 50%;">

<div>

<div style="font-weight:bold;">${post.usuario)</div>

<small style="color:#00f2ff;">${post.tag}</small>

</div>

</div>

>button class="btn-naria ${post.naria? 'suscripto':י"

onclick="toggleNaria(this)">

${post.naria? ¡Naria-llamad@!: 'Naria-llanme"}

</button>

</div>

<video src="${post.video)" controls loop></video>

<div class="acciones">

<button class="btn-icon" onclick="darLike(this)"> ${post.likes}</button>

<button class="btn-icon"> ${post.comentarios.length}</button>

<button class="btn-icon" onclick="alert('Compartidol')"></button>

</div>

<div class="zona-extra">

<div class="rec-box">

<span>¿Recomendarías este video?</span><br>

<label><input type="radio" name="rec${post.id}"> Si</label>

<label><input type="radio" name="rec${post.id}"> No</label>

<input type="text" placeholder="¿Por qué? (Opcional)" style="background:#222; border:none; color:white; width:95%; margin-top: 5px; border-radius: 5px;">

</div>

<div id="comments-5{post.id}" style="margin-bottom: 10px; max-height:100px;

overflow-y:auto; font-size:0.85rem; color:#ccc;">

${comentariosHTML)

</div>

<div style="display: flex; ">

   <input type="text" id="input-${post.id}" class="input-comentario"

placeholder="Escribe un comentario...">

<button onclick="publicarComentario(${post.id})" style="background: none;

border:none; color:#00f2ff; font-weight:bold; ">Enviar</button>

});

}

</div>

</div>

contenedor.appendChild(card);

//---5, INTERACCIONES

function toggleNaria(btn) {

if(btn.innerText == "Naria-llanme") {

btn.innerText = "Naria-llamad@!";

btn.classList.add("suscripto");

alert("Te has suscrito a este usuario.");

} else {

btn.innerText = "Naria-llanme":

btn.classList.remove("suscripto");

}

}

function darLike(btn) {

parseInt(btn.innerText.split(' ')[1]); let num

}

btn.inner Text ${num+ 1}';

btn.style.color "#ff0055";

   function publicarComentario(idPost) {

const input document.getElementById("input-$(idPost}');

const texto input.value;

if(texto) {

const area document.getElementById('comments-${idPost));

area.innerHTML += '<div><strong style="color:#00f2ff;">Tú:</strong> ${texto}</div>';

input.value = "";

}

}

6. SUBIR VIDEO (SIMULADO)

function procesar Video(event) {

const file = event.target.files[0];

if(file) {

const url= URL.createObjectURL(file);

// Creamos un video nuevo en la lista "Mis Videos"

misVideos.unshift({

id: Date.now().

usuario: usuarioActual,

avatar: avatarActual,

video: url,

tag: "Vlog", // Por defecto

likes: 0,

naria: false,

comentarios: []

});

    alert(" Video subido! Ve a la pestaña 'Mis Videos para verlo.");

// Cambiamos automáticamente a la pestaña de mis videos

cambiarTab('mios');

document.querySelectorAll('.tab-btn')[1].click();

//--- 7. GALERÍA DE AVATARES (Tu código original adaptado)

const fotos = [

1:

"https://i.ibb.co/jkcM4khz/file-000000000bd461fb894402f0ff51670d.png".

"https://i.ibb.co/XZTpkLPW/file-0000000056b061f7b0aca36e6e40d8c0.png".

"https://i.ibb.co/hRTfBsKL/47-sin-t-tulo11.png"

function abrirPerfil() {

document.getElementById("modalPerfil").style.display = "flex";

}

function cargarGaleria() {

const grid = document.getElementById("galeria");

fotos.forEach(src => {

let ing document.createElement("img");

img.src = src;

img.onclick = () => {

avatarActual = src;

document.getElementById("miAvatarMini").src = src;

};

grid.appendChild(img);

              }

Nai Nai X

Project ove

Nai-Nai/sc

21 mendoz

Nai Nai Ap

41%

<

codepen.io/Naikin/pen/gbMw

5

Nai Nai

lan

HTML

CSS JS

Result

function cargarGaleria() {

const grid document.getElementById("galeria");

fotos, forEach(src => {

let ing document.createElement("img");

img.src = src;

img.onclick = () => {

avatarActual = src;

document.getElementById("miAvatarMini").src = src;

});

};

grid.appendChild(img);

}
