const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- BORRAR ---
async function borrarVideo(id, user, url) {
    if(!confirm("¿Seguro que quieres desaparecer la x?")) return;
    const { error } = await _supabase.from('videos').delete().eq('id', id);
    if (error) alert(error.message);
    else {
        alert(user + " borró el video: " + url + "\n\n¿Fuiste tú?");
        location.reload();
    }
}

// --- CARGAR ---
async function cargarVideos() {
    const cont = document.getElementById("feed-videos");
    const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
    if (error) return;
    cont.innerHTML = "";
    data.forEach(v => {
        const div = document.createElement("div");
        div.style = "position:relative; margin-bottom:30px; background:#111; padding:12px; border-radius:15px; border:1px solid #333;";
        div.innerHTML = `
            <button onclick="borrarVideo(${v.id}, '${v.usuario}', '${v.video_url}')" style="position:absolute; top:15px; right:15px; background:red; color:white; border-radius:50%; border:2px solid white; width:35px; height:35px; font-weight:bold; cursor:pointer; z-index:100;">X</button>
            <p style="color:#00f2ea; font-weight:bold; margin-bottom:10px;">${v.usuario}</p>
            <video src="${v.video_url}" controls loop playsinline style="width:100%; border-radius:10px;"></video>
        `;
        cont.appendChild(div);
    });
}

// --- SUBIR (ACTUALIZADO) ---
async function subirVideo(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.createElement("div");
    status.id = "status-subida";
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; flex-direction:column;";
    status.innerHTML = "<h2>SUBIENDO...</h2><p>No cierres la app</p>";
    document.body.appendChild(status);

    try {
        // Limpiamos el nombre: solo letras y números
        const nombreLimpio = Date.now() + "_" + file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        
        // 1. Subir al Bucket
        const { data: uploadData, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(nombreLimpio, file);

        if (storageError) throw storageError;

        // 2. Obtener URL
        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(nombreLimpio);

        // 3. Guardar en Tabla
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin", 
            avatar: "https://i.ibb.co/jkcM4khz/file.png" 
        }]);

        if (tableError) throw tableError;

        location.reload();
    } catch (error) {
        document.getElementById("status-subida").remove();
        alert("Error crítico: " + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const btn = document.querySelector('input[type="file"]');
    if (btn) btn.addEventListener('change', subirVideo);
});
