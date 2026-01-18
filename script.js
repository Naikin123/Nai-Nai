const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- 1. BORRAR VIDEO ---
async function borrarVideo(id, user, url) {
    if(!confirm("¿Seguro que quieres desaparecer la x?")) return;
    
    const { error } = await _supabase.from('videos').delete().eq('id', id);
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert(user + " borró el video: " + url + "\n\n¿Fuiste tú?");
        location.reload();
    }
}

// --- 2. CARGAR VIDEOS ---
async function cargarVideos() {
    const cont = document.getElementById("feed-videos");
    if (!cont) return;

    const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
    
    if (error) {
        cont.innerHTML = "<p style='text-align:center; padding:20px;'>Error de conexión</p>";
        return;
    }
    
    cont.innerHTML = "";
    data.forEach(v => {
        const div = document.createElement("div");
        div.className = "post-card"; // Usamos la clase de tu CSS
        div.style = "position:relative; margin-bottom:30px; background:#111; padding:10px; border-radius:15px; border:1px solid #333;";
        
        div.innerHTML = `
            <div class="post-header">
                <div style="display:flex; align-items:center;">
                    <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:35px; height:35px; border-radius:50%; margin-right:10px; border:1px solid #00f2ea;">
                    <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
                </div>
                <button onclick="borrarVideo(${v.id}, '${v.usuario}', '${v.video_url}')" style="background:red; color:white; border:none; border-radius:50%; width:30px; height:30px; font-weight:bold; cursor:pointer;">X</button>
            </div>
            
            <video src="${v.video_url}" controls loop playsinline style="width:100%; border-radius:10px; margin-top:5px; background:black;"></video>
        `;
        cont.appendChild(div);
    });
}

// --- 3. SUBIR VIDEO ---
async function subirVideo(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Aviso de carga
    const status = document.createElement("div");
    status.id = "status-subida";
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#00f2ea;";
    status.innerHTML = "<h2 style='font-family:sans-serif;'>SUBIENDO...</h2><p style='color:white;'>No cierres la app</p>";
    document.body.appendChild(status);

    try {
        // Limpiar nombre del archivo
        const nombreLimpio = Date.now() + "_" + file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        
        // A. Subir al Bucket
        const { error: storageError } = await _supabase.storage.from('videos').upload(nombreLimpio, file);
        if (storageError) throw storageError;

        // B. Obtener URL
        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(nombreLimpio);

        // C. Guardar en Base de Datos
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin", 
            avatar: "https://i.ibb.co/jkcM4khz/file.png" 
        }]);

        if (tableError) throw tableError;

        location.reload(); // Recargar al terminar

    } catch (error) {
        document.getElementById("status-subida").remove();
        alert("Error al subir: " + error.message);
    }
}

// --- 4. INICIALIZAR BOTÓN ---
function inicializarSubida() {
    const btn = document.getElementById("input-subir");
    if (btn) {
        // Clonamos el botón para asegurar que no tenga eventos viejos
        const nuevoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBtn, btn);
        
        nuevoBtn.addEventListener('change', (e) => {
            console.log("Archivo seleccionado, iniciando subida...");
            subirVideo(e);
        });
        console.log("Botón de subida activado correctamente 🥊");
    } else {
        console.error("No se encontró el botón de subir");
    }
}

// ARRANCAR APP
document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    inicializarSubida();
});
