const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. FUNCIÓN PARA BORRAR (Con contraseña)
async function borrarVideo(id) {
    const pass = prompt("Introduce la contraseña para eliminar este video:");
    if (pass === "1234") { // <--- AQUÍ PUEDES CAMBIAR TU CONTRASEÑA
        const { error } = await _supabase.from('videos').delete().eq('id', id);
        if (error) {
            alert("Error: Los videos viejos no se pueden borrar desde aquí porque no tienen ID. Bórralos desde Supabase.");
        } else {
            location.reload();
        }
    } else if (pass !== null) {
        alert("Contraseña incorrecta");
    }
}

// 2. FUNCIÓN PARA MOSTRAR VIDEOS
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        const { data, error } = await _supabase
            .from('videos')
            .select('*')
            .order('id', { ascending: false }); // Muestra los más nuevos arriba

        if (error) throw error;

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:gray; text-align:center; padding:40px;">No hay videos aún. ¡Sube el primero!</p>';
            return;
        }

        contenedor.innerHTML = ""; 
        data.forEach(v => {
            if (v.video_url) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "position:relative; margin-bottom:30px; background:#111; border-radius:15px; padding:12px; border:1px solid #333; overflow:hidden;";
                card.innerHTML = `
                    <button onclick="borrarVideo(${v.id})" style="position:absolute; top:10px; right:10px; background:rgba(255,0,0,0.8); color:white; border:none; border-radius:50%; width:32px; height:32px; font-weight:bold; cursor:pointer; z-index:10; border: 1px solid white;">X</button>
                    
                    <div style="display:flex; align-items:center; margin-bottom:12px;">
                        <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px; border: 1px solid #00f2ea;">
                        <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
                    </div>
                    <video src="${v.video_url}" controls loop playsinline style="width:100%; border-radius:10px; background:black; display:block;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) {
        console.error(err);
        contenedor.innerHTML = `<p style="color:red; text-align:center;">Error al cargar.</p>`;
    }
}

// 3. FUNCIÓN PARA SUBIR VIDEOS
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.createElement("div");
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; text-align:center; font-family:sans-serif;";
    status.innerHTML = `<div><h2 id="msg">SUBIENDO VIDEO...</h2><h1 id="p" style="font-size:60px;">0%</h1></div>`;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // Subida al Storage
        const { data, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    document.getElementById("p").innerText = Math.round((p.loaded / p.total) * 100) + "%";
                }
            });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        // Guardar en tabla
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin",
            avatar: "https://i.ibb.co/jkcM4khz/file.png"
        }]);

        if (tableError) throw tableError;

        document.getElementById("msg").innerText = "¡LISTO!";
        setTimeout(() => location.reload(), 1000);

    } catch (error) {
        status.remove();
        alert('Error: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const btn = document.querySelector('input[type="file"]');
    if (btn) btn.addEventListener('change', subirVideoASupabase);
});
