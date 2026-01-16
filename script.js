const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. FUNCIÓN PARA CARGAR LOS VIDEOS EN EL FEED
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
        if (error) throw error;
        contenedor.innerHTML = ""; 

        data.forEach(v => {
            const link = v.video_url || v.url; 
            if (link) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 25px; background: #111; border-radius: 15px; padding: 12px; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:12px;">
                        <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:45px; height:45px; border-radius:50%; margin-right:12px; border: 2px solid #00f2ea;">
                        <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
                    </div>
                    <video src="${link}" controls loop playsinline style="width:100%; border-radius:10px; background:black;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) { console.error("Error al cargar:", err); }
}

// 2. FUNCIÓN PARA SUBIR (La que muestra el porcentaje)
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // CREAR EL CARTEL DE CARGA A LA FUERZA
    const status = document.createElement("div");
    status.id = "cartel-carga";
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#00f2ea; font-family:sans-serif;";
    status.innerHTML = `
        <div style="border: 4px solid #00f2ea; padding: 40px; border-radius: 20px; text-align:center;">
            <h2 style="margin:0;">SUBIENDO VIDEO...</h2>
            <div style="font-size: 60px; font-weight:bold; margin: 20px 0;" id="percent">0%</div>
            <p style="color:white;">No cierres esta ventana</p>
        </div>
    `;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // Subir al Storage
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded / p.total) * 100);
                    const el = document.getElementById("percent");
                    if (el) el.innerText = percent + "%";
                }
            });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        // Guardar en la tabla (con la columna video_url que creaste)
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin",
            avatar: "https://i.ibb.co/jkcM4khz/file.png"
        }]);

        if (tableError) throw tableError;

        document.getElementById("cartel-carga").innerHTML = "<h2 style='color:#2ecc71'>✅ ¡PUBLICADO!</h2>";
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        if(status) status.remove();
        alert('❌ Error: ' + error.message);
    }
}

// 3. AUTO-CONECTOR: Busca el botón apenas carga la página
document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();

    // Esto busca CUALQUIER botón de subir archivos en tu HTML
    const inputFiles = document.querySelectorAll('input[type="file"]');
    
    if (inputFiles.length > 0) {
        inputFiles.forEach(input => {
            input.addEventListener('change', subirVideoASupabase);
        });
        console.log("Botón encontrado y conectado");
    } else {
        // Si no encuentra el botón, te avisa para que revises el HTML
        alert("⚠️ ATENCIÓN: No encontré ningún botón para elegir archivos en tu HTML.");
    }
});
                          
