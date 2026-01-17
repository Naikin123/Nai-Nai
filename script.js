const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';

// Inicializa supabase de forma segura (comprueba que window.supabase exista)
const _supabase = (window.supabase && typeof window.supabase.createClient === 'function')
    ? window.supabase.createClient(supabaseUrl, supabaseKey)
    : null;

if (!_supabase) {
    console.error('Supabase no está disponible en window.supabase. Asegúrate de importar el cliente de Supabase.');
}

// --------------------------------------------------
// FUNCIÓN PARA MOSTRAR LOS VIDEOS
// --------------------------------------------------
async function cargarVideos() {
    if (!_supabase) return;
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        const { data, error } = await _supabase
            .from('videos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:gray; text-align:center; padding:50px;">No hay videos. ¡Sube el primero!</p>';
            return;
        }

        contenedor.innerHTML = "";
        data.forEach(v => {
            const card = document.createElement("div");
            card.className = "post-card";
            card.style.cssText = "position:relative; margin-bottom:35px; background:#111; border-radius:15px; padding:12px; border:1px solid #333; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";

            // Cabecera usuario
            const header = document.createElement("div");
            header.style.cssText = "display:flex; align-items:center; margin-bottom:12px;";

            const avatar = document.createElement("img");
            avatar.src = v.avatar || 'https://i.ibb.co/jkcM4khz/file.png';
            avatar.style.cssText = "width:40px; height:40px; border-radius:50%; margin-right:10px; border: 1px solid #00f2ea;";
            header.appendChild(avatar);

            const username = document.createElement("span");
            username.style.cssText = "color:white; font-weight:bold;";
            username.textContent = v.usuario || 'Nai-Kin';
            header.appendChild(username);

            // Botón de borrar (creado con event listener para evitar inyección)
            const btnBorrar = document.createElement("button");
            btnBorrar.textContent = "X";
            btnBorrar.title = "Borrar video";
            btnBorrar.style.cssText = "position:absolute; top:15px; right:15px; background:rgba(255, 0, 0, 0.85); color:white; border:2px solid white; border-radius:50%; width:35px; height:35px; font-weight:bold; cursor:pointer; z-index:100; font-size:16px;";
            btnBorrar.addEventListener('click', () => borrarVideo(v.id, v.usuario || 'Nai-Kin', v.video_url || ''));

            // Video
            const videoEl = document.createElement("video");
            videoEl.src = v.video_url || '';
            videoEl.controls = true;
            videoEl.loop = true;
            videoEl.playsInline = true;
            videoEl.style.cssText = "width:100%; border-radius:10px; background:black; display:block;";

            // Montaje en tarjeta
            card.appendChild(btnBorrar);
            card.appendChild(header);
            card.appendChild(videoEl);

            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        contenedor.innerHTML = `<p style="color:red; text-align:center;">Error: ${err.message}</p>`;
    }
}

// --------------------------------------------------
// FUNCIÓN PARA SUBIR VIDEOS
// --------------------------------------------------
async function subirVideoASupabase(event) {
    if (!_supabase) return;
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // UI de estado (simple)
    const status = document.createElement("div");
    status.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; text-align:center; font-family:sans-serif;";
    status.innerHTML = `<div><h2 id="msg">ENVIANDO VIDEO...</h2><h1 id="p" style="font-size:60px; margin:20px 0;">...</h1><p style="color:white;">No cierres esta ventana</p></div>`;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

        // Subir al bucket 'videos'
        const { data: uploadData, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file);

        if (storageError) throw storageError;

        // Obtener URL pública
        const { data: publicData, error: publicError } = _supabase.storage
            .from('videos')
            .getPublicUrl(fileName);

        if (publicError) throw publicError;
        const publicUrl = publicData?.publicUrl || '';

        if (!publicUrl) throw new Error('No se pudo obtener la URL pública del archivo.');

        // Guardar registro en la tabla 'videos'
        const { data: insertData, error: tableError } = await _supabase.from('videos').insert([{
            video_url: publicUrl,
            usuario: "Nai-Kin",
            avatar: "https://i.ibb.co/jkcM4khz/file.png"
        }]);

        if (tableError) throw tableError;

        // Éxito: actualiza UI y recarga después
        const msg = status.querySelector('#msg');
        if (msg) msg.innerText = "¡SUBIDA EXITOSA!";
        setTimeout(() => {
            status.remove();
            location.reload();
        }, 1200);

    } catch (error) {
        // limpiar UI y mostrar error
        status.remove();
        console.error(error);
        alert('Error: ' + (error.message || error));
    }
}

// --------------------------------------------------
// FUNCIÓN DE BORRADO (VENTANA DE CONFIRMACIÓN PROFESIONAL)
// --------------------------------------------------
async function borrarVideo(id, nombreUsuario = 'Usuario', urlVideo = '') {
    if (!_supabase) return;

    // Fondo modal
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; align-items:center; justify-content:center; font-family:sans-serif; padding:20px;";

    modal.innerHTML = `
        <div style="background:#111; border:2px solid #00f2ea; padding:25px; border-radius:15px; text-align:center; max-width:400px; width:100%; color:white;">
            <h3 style="margin-top:0;">¿Seguro que quieres desaparecer la x?</h3>
            <p style="color:gray; font-size:14px; margin-bottom:20px;">
                Esta acción eliminará el video permanentemente de la red.
            </p>
            <div style="display:flex; justify-content:center; gap:15px;">
                <button id="btn-cancelar" style="background:#333; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">X Cancelar</button>
                <button id="btn-aceptar" style="background:#ff4b2b; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">Aceptar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Cancelar
    modal.querySelector('#btn-cancelar').onclick = () => modal.remove();

    // Aceptar -> borrar en supabase
    modal.querySelector('#btn-aceptar').onclick = async () => {
        try {
            const { error } = await _supabase.from('videos').delete().eq('id', id);

            if (error) {
                alert("Error: " + error.message);
            } else {
                modal.remove();
                alert(`${nombreUsuario} borró el video: ${urlVideo}\n\n¿Fuiste tú?`);
                location.reload();
            }
        } catch (err) {
            console.error(err);
            alert("Error al borrar: " + (err.message || err));
            modal.remove();
        }
    };
}

// --------------------------------------------------
// INICIALIZAR APP
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const inputSubir = document.querySelector('input[type="file"]');
    if (inputSubir) {
        inputSubir.addEventListener('change', subirVideoASupabase);
    }
});
