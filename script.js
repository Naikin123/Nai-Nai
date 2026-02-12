// Verifica si ya aceptó las reglas al cargar la página
window.addEventListener('load', () => {
    if (localStorage.getItem('rulesAccepted') === 'true') {
        document.getElementById('rules-page').style.display = 'none';
        document.getElementById('main-interface').style.display = 'block';
    }
});

function acceptRules() {
    localStorage.setItem('rulesAccepted', 'true');
    document.getElementById('rules-page').style.display = 'none';
    document.getElementById('main-interface').style.display = 'block';
}

function zoomLogo() {
    const logo = document.querySelector('.logo img');
    logo.style.transform = 'scale(2)';
    setTimeout(() => logo.style.transform = 'scale(1)', 500);
}

function openUpload() {
    alert('Abriendo subida de video...');
    // Aquí va lógica real para mostrar #upload-page
}

function openProfile() {
    alert('Abriendo perfil...');
    // Aquí va lógica para mostrar #profile-page
}

// Otras funciones como antes
