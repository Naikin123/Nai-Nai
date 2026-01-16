// Busca esta parte en tu script.js dentro de la función cargarVideos
data.forEach(v => {
    if (v.video_url) {
        const card = document.createElement("div");
        card.className = "post-card";
        // IMPORTANTE: El style debe tener position:relative
        card.style = "position:relative; margin-bottom:30px; background:#111; border-radius:15px; padding:12px; border:1px solid #333;";
        
        card.innerHTML = `
            <button onclick="borrarVideo(${v.id})" style="position:absolute; top:10px; right:10px; background:red; color:white; border:none; border-radius:50%; width:30px; height:30px; font-weight:bold; cursor:pointer; z-index:100; border:1px solid white;">X</button>
            
            <div style="display:flex; align-items:center; margin-bottom:12px;">
                <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px; border: 1px solid #00f2ea;">
                <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
            </div>
            <video src="${v.video_url}" controls loop playsinline style="width:100%; border-radius:10px; background:black;"></video>
        `;
        contenedor.appendChild(card);
    }
});
