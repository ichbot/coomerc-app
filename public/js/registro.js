// registro.js - Exclusivo para el formulario de inscripción
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const CLOUD_NAME = "coomerc";
const UPLOAD_PRESET = "coomerc_preset";

const form = document.getElementById('registroNegocio');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const previewContainer = document.getElementById('preview-container');

// 1. Previsualización
fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (imagePreview) imagePreview.src = event.target.result;
            if (previewContainer) previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// 2. Función Cloudinary
async function subirACloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });
    if (!resp.ok) throw new Error("Error al subir imagen");
    const data = await resp.json();
    return data.secure_url;
}

// 3. Envío a Firestore
form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnGuardar');
    const mensajeDiv = document.getElementById('mensaje');
    
    btn.disabled = true;
    btn.innerText = "⏳ Procesando...";

    try {
        let urlFotoFinal = "https://via.placeholder.com/400x300?text=Coomerc+Negocio";
        if (fileInput.files[0]) {
            btn.innerText = "⏳ Subiendo foto...";
            urlFotoFinal = await subirACloudinary(fileInput.files[0]);
        }

        const nombre = document.getElementById('nombre').value.trim();
        const ciudad = document.getElementById('ciudad').value.trim();
        const barrio = document.getElementById('barrio').value.trim();
        const prefijo = document.getElementById('reg-prefijo')?.value || "57";
        const numeroLimpio = document.getElementById('whatsapp').value.replace(/\D/g, "");

        const datos = {
            nombre,
            nombreSearch: nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            categoria: document.getElementById('categoria').value,
            whatsapp: `${prefijo}${numeroLimpio}`,
            ciudad: ciudad.toLowerCase(),
            barrio: barrio.toLowerCase(),
            ciudadDisplay: ciudad,
            barrioDisplay: barrio,
            direccion: document.getElementById('direccion')?.value.trim() || "",
            descripcion: document.getElementById('descripcion').value.trim(),
            historia: historia,
            imagen: urlFotoFinal,
            domicilio: document.getElementById('reg-domicilio').checked,
            createdAt: new Date()
        };

        await addDoc(collection(db, "negocios"), datos);

        mensajeDiv.innerHTML = `<div class="success-msg"><h3>¡Publicado con éxito! 🎉</h3></div>`;
        form.reset();
        if (previewContainer) previewContainer.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        mensajeDiv.innerHTML = `<p style="color:red;">❌ Error: ${error.message}</p>`;
    } finally {
        btn.disabled = false;
        btn.innerText = "PUBLICAR MI NEGOCIO";
    }
});