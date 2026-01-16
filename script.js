const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. FUNCIÓN PARA BORRAR (Contraseña: 1234)
async function borrarVideo(id) {
    if (!id) {
        alert("Este video es antiguo y no tiene ID. Bórralo desde el panel de Supabase.");
        return;
    }

    const pass = prompt("Contraseña para eliminar:");
    if (pass === "1234") { // <--- Puedes cambiar 1234 por la clave que quieras
        const { error } = await _supabase
            .from('videos')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Error al borrar: " + error.message);
        } else {
            alert("Video eliminado correctamente");
            location.reload();
        }
    } else if (pass !== null) {
        alert("Contraseña incorrecta");
    }
}

// 2. FUNCIÓN PARA MOSTRAR LOS VIDEOS
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        const { data, error } = await _supabase
            .from('videos')
            .select('*')
            .order('id', { ascending: false }); // Los más nuevos aparecen primero

        if (error) throw error;

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:gray; text-align:center; padding:50px;">No hay videos. ¡Sube el primero!</p>';
            return;
        }

        contenedor.innerHTML = ""; 
        data.forEach(v => {
            const card = document.createElement("div");
            card.className = "post-card";
            // Diseño de la tarjeta
            card.style = "position:relative; margin-bottom:35px; background:#111; border-radius:15px; padding:12px; border:1px solid #333; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";
            
            card.innerHTML = `
                <button onclick="borrarVideo(${v.id})" style="position:absolute; top:15px; right:15px; background:rgba(255, 0, 0, 0.85); color:white; border:2px solid white; border-radius:50%; width:35px; height:35px; font-weight:bold; cursor:pointer; z-index:100; font-size:16px;">X</button>
                
                <div style="display:flex; align-items:center; margin-bottom:12px;">
                    <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px; border: 1px solid #00f2ea;">
                    <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
                </div>
                
                <video src="${v.video_url}" controls loop playsinline style="width:100%; border-radius:10px; background:black; display:block;"></video>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        contenedor.innerHTML = `<p style="color:red; text-align:center;">Error: ${err.message}</p>`;
    }
}

// 3. FUNCIÓN PARA SUBIR VIDEOS
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.createElement("div");
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; text-align:center; font-family:sans-serif;";
    status.innerHTML = `<div><h2 id="msg">ENVIANDO VIDEO...</h2><h1 id="p" style="font-size:60px; margin:20px 0;">0%</h1><p style="color:white;">No cierres esta ventana</p></div>`;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        
        // A. Subir al Storage (Bucket)
        const { error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    const progreso = Math.round((p.loaded / p.total) * 100);
                    document.getElementById("p").innerText = progreso + "%";
                }
            });

        if (storageError) throw storageError;

        // B. Obtener el link público
        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        // C. Guardar registro en la base de datos
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin",
            avatar: "https://i.ibb.co/jkcM4khz/file.png"
        }]);

        if (tableError) throw tableError;

        document.getElementById("msg").innerText = "¡SUBIDA EXITOSA!";
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        status.remove();
        alert('Error: ' + error.message);
    }
}

// 4. INICIALIZAR LA APP
document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const inputSubir = document.querySelector('input[type="file"]');
    if (inputSubir) {
        inputSubir.addEventListener('change', subirVideoASupabase);
    }
});
