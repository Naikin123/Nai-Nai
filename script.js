const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. FUNCIÓN PARA BORRAR (Con tu mensaje personalizado)
async function borrarVideo(id, user, url) {
    if(!confirm("¿Seguro que quieres desaparecer la x?")) return;
    
    const { error } = await _supabase.from('videos').delete().eq('id', id);
    if (error) {
        alert("Error al borrar: " + error.message);
    } else {
        alert(user + " borró el video: " + url + "\n\n¿Fuiste tú?");
        location.reload();
    }
}

// 2. FUNCIÓN PARA CARGAR LOS VIDEOS EN PANTALLA
async function cargarVideos() {
    const cont = document.getElementById("feed-videos");
    if (!cont) return;
    
    const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
    
    if (error) { 
        cont.innerHTML = "<p style='text-align:center;'>Error de conexión</p>"; 
        return; 
    }
    
    cont.innerHTML = "";
    data.forEach(v => {
        const div = document.createElement("div");
        div.className = "post-card";
        div.style = "position:relative; margin-bottom:35px; background:#111; padding:12px; border-radius:15px; border:1px solid #333;";
        div.innerHTML = `
            <button onclick="borrarVideo(${v.id}, '${v.usuario}', '${v.video_url}')" style="position:absolute; top:15px; right:15px; background:red; color:white; border-radius:50%; border:2px solid white; width:35px; height:35px; font-weight:bold; cursor:pointer; z-index:100;">X</button>
            <div style="display:flex; align-items:center; margin-bottom:12px;">
                <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px; border: 1px solid #00f2ea;">
                <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
            </div>
            <video src="${v.video_url}" controls loop playsinline style="width:100%; border-radius:10px; background:black;"></video>
        `;
        cont.appendChild(div);
    });
}

// 3. FUNCIÓN PARA SUBIR VIDEOS (La que faltaba)
async function subirVideo(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Aviso de "Subiendo..."
    const status = document.createElement("div");
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; font-family:sans-serif;";
    status.innerHTML = "<h2>SUBIENDO VIDEO... ESPERA</h2>";
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // A. Subir al almacenamiento
        const { error: storageError } = await _supabase.storage.from('videos').upload(fileName, file);
        if (storageError) throw storageError;

        // B. Obtener link
        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        // C. Guardar en la tabla
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin", 
            avatar: "https://i.ibb.co/jkcM4khz/file.png" 
        }]);
        if (tableError) throw tableError;

        location.reload();
    } catch (error) {
        alert("Error al subir: " + error.message);
        status.remove();
    }
}

// 4. ARRANCAR TODO
document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const inputFile = document.querySelector('input[type="file"]');
    if (inputFile) {
        inputFile.addEventListener('change', subirVideo);
    }
});
