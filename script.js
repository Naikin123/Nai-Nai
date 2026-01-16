// Configuración exacta con tus datos de Supabase
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        // Consultamos tu tabla 'videos'
        const { data, error } = await _supabase
            .from('videos')
            .select('*');

        if (error) throw error;

        contenedor.innerHTML = ""; 

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">Todavía no hay videos. ¡Sube el primero!</p>';
            return;
        }

        data.forEach(v => {
            const card = document.createElement("div");
            card.className = "post-card";
            // Usamos tus nombres de columna: url, usuario, avatar
            card.innerHTML = `
                <div class="user-info">
                    <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" class="avatar">
                    <span>${v.usuario || 'Usuario'}</span>
                </div>
                <video src="${v.url}" controls loop playsinline style="width:100%; border-radius:12px; margin-top:10px;"></video>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        contenedor.innerHTML = '<p style="color:white; text-align:center;">Error de conexión. Revisa las políticas de Supabase.</p>';
    }
}

async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("⏳ Subiendo video... esto puede tardar unos segundos.");

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // 1. Subir al Storage (Bucket VIDEOS)
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('VIDEOS')
            .upload(fileName, file);

        if (storageError) throw storageError;

        // 2. Obtener URL pública
        const { data: { publicUrl } } = _supabase.storage
            .from('VIDEOS')
            .getPublicUrl(fileName);

        // 3. Insertar en tabla 'videos' (usando url, usuario, avatar)
        const { error: tableError } = await _supabase
            .from('videos')
            .insert([{ 
                url: publicUrl, 
                usuario: "Nai-Kin", 
                avatar: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        alert('✅ ¡Video subido con éxito!');
        location.reload(); 

    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarVideos);
