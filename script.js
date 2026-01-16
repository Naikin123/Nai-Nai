const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        contenedor.innerHTML = ""; 

        if (data.length === 0) {
            contenedor.innerHTML = '<p style="color:white; text-align:center;">No hay videos aún. ¡Sé el primero!</p>';
            return;
        }

        data.forEach(v => {
            const card = document.createElement("div");
            card.className = "post-card";
            card.innerHTML = `
                <div class="user-info">
                    <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" class="avatar">
                    <span>${v.usuario || 'Nai-Kin'}</span>
                </div>
                <video src="${v.url}" controls loop playsinline style="width:100%; border-radius:10px;"></video>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        contenedor.innerHTML = '<p style="color:red; text-align:center;">Error al conectar.</p>';
    }
}

async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("⏳ Subiendo video... espera el mensaje de éxito.");

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // 1. Subir al Storage (Bucket VIDEOS en mayúsculas)
        const { data: storageData, error: storageError } = await supabase.storage
            .from('VIDEOS')
            .upload(fileName, file);

        if (storageError) throw storageError;

        // 2. Obtener URL
        const { data: { publicUrl } } = supabase.storage
            .from('VIDEOS')
            .getPublicUrl(fileName);

        // 3. Insertar en Tabla 'videos' (usando url, usuario, avatar)
        const { error: tableError } = await supabase
            .from('videos')
            .insert([{ 
                url: publicUrl, 
                usuario: "Nai-Kin", 
                avatar: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        alert('✅ ¡Video subido con éxito!');
        cargarVideos(); 

    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

window.onload = cargarVideos;
