// script.js
function acceptRules() {
    document.getElementById('rules-page').style.display = 'none';
    document.getElementById('main-interface').style.display = 'block';
}

function zoomLogo() {
    // Animación de zoom para el logo
    const logo = document.querySelector('.logo img');
    logo.style.transform = 'scale(2)';
    setTimeout(() => logo.style.transform = 'scale(1)', 500);
}

function openUpload() {
    document.getElementById('main-interface').style.display = 'none';
    document.getElementById('upload-page').style.display = 'block';
}

function uploadVideo() {
    // Lógica para subir (placeholder)
    alert('Video subido');
    document.getElementById('upload-page').style.display = 'none';
    document.getElementById('main-interface').style.display = 'block';
}

function openProfile() {
    document.getElementById('main-interface').style.display = 'none';
    document.getElementById('profile-page').style.display = 'block';
}

document.getElementById('no-alg').addEventListener('change', function() {
    if (this.checked) {
        if (!confirm('¿Seguro? Tu feed será menos personalizado.')) {
            this.checked = false;
        }
    }
});

// Lógica para Montaña Rusa, modo edición, etc. (placeholders)
document.getElementById('montana-rusa').addEventListener('click', () => alert('Modo cambiado'));
document.getElementById('edit-layout').addEventListener('click', () => alert('Modo edición activado'));
