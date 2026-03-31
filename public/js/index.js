// index.js - MOTOR DE BÚSQUEDA COOMERC (VERSIÓN FINAL)
import { db } from './firebase-config.js';
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    const negociosContainer = document.getElementById('negocios-container');
    const tituloUbicacion = document.getElementById('titulo-ubicacion');
    const inputKeyword = document.getElementById('search-keyword');
    const inputCiudad = document.getElementById('search-city');
    const inputBarrio = document.getElementById('search-neighborhood');
    const btnSearch = document.getElementById('btn-search');

    let todosLosNegocios = [];
    let ciudadActual = "Copacabana";

    const normalizar = (t) => (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    async function inicializar() {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ciudadActual = data.city || "Copacabana";
        } catch { ciudadActual = "Copacabana"; }

        if (inputCiudad) inputCiudad.value = ciudadActual;
        actualizarTitulo(ciudadActual);
        await cargarBaseDeDatos();
    }

    async function cargarBaseDeDatos() {
        if (!negociosContainer) return;
        negociosContainer.innerHTML = '<p style="text-align:center; padding:20px;">Buscando comerciantes...</p>';

        try {
            const q = query(collection(db, "negocios"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            todosLosNegocios = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            ejecutarFiltro();
        } catch (e) {
            console.error(e);
            negociosContainer.innerHTML = '<p style="text-align:center; color:red;">Error de conexión.</p>';
        }
    }

    function ejecutarFiltro() {
        const key = normalizar(inputKeyword?.value);
        const ciu = normalizar(inputCiudad?.value);
        const bar = normalizar(inputBarrio?.value);

        if (ciu === "") {
            negociosContainer.innerHTML = '<p style="text-align:center; padding:20px;">📍 Escribe tu ciudad para empezar.</p>';
            return;
        }

        // --- DESTACADOS ---
        const hoy = new Date().toLocaleDateString('en-CA'); 
        const listaPremium = todosLosNegocios.filter(n => {
            const esActivo = n.esPremium === true && n.fechaFinPremium && n.fechaFinPremium >= hoy;
            return esActivo && normalizar(n.ciudad).includes(ciu);
        });
        renderizarDestacados(listaPremium);

        // --- RESULTADOS ---
        let resultados = todosLosNegocios.filter(n => {
            const ciudadNegocio = normalizar(n.ciudad);
            const barrioNegocio = normalizar(n.barrio);
            const dataNegocio = normalizar(`${n.nombre} ${n.categoria} ${n.descripcion}`);
            if (!ciudadNegocio.startsWith(ciu)) return false; 
            if (bar !== "" && !barrioNegocio.includes(bar)) return false;
            if (key !== "" && !dataNegocio.includes(key)) return false;
            return true;
        });

        const ubicacionLabel = bar !== "" ? `${bar}, ${ciu}` : ciu;
        actualizarTitulo(resultados.length > 0 ? ubicacionLabel : "No hay resultados");
        renderizar(resultados, inputKeyword?.value);
    }

    function renderizar(lista, termino = "") {
        if (!negociosContainer) return;
        negociosContainer.innerHTML = "";

        if (lista.length === 0) {
            negociosContainer.innerHTML = `<div class="no-results-card"><h3>🚀 Sé el primero</h3><p>No encontramos nada para "${termino || "esta zona"}"</p><a href="registro.html" class="btn-pionero">Registrar mi negocio</a></div>`;
            return;
        }

        lista.forEach(n => {
            const card = document.createElement('article');
            card.className = 'card-negocio';
            const fotoUrl = n.imagen || 'https://via.placeholder.com/400x250';
            card.style.setProperty('--bg-img', `url('${fotoUrl}')`);

            const mensajeWA = encodeURIComponent(`¡Hola! Vi tu negocio "${n.nombre}" en Coomerc y me interesa...`);
            const linkWA = `https://wa.me/${n.whatsapp}?text=${mensajeWA}`;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.acciones-card')) return;
                card.classList.toggle('is-open');
            });

            card.innerHTML = `
                <div class="img-container">
                    <img src="${fotoUrl}" alt="${n.nombre}" loading="lazy">
                    ${n.domicilio ? '<span class="tag-domicilio">🛵 Domicilio</span>' : ''}
                </div>
                <div class="info-negocio">
                    <span class="categoria-tag">${n.categoria || "General"}</span>
                    <h3>${n.nombre}</h3>
                    <p class="ubicacion">📍 ${n.barrio || "Sector"}, ${n.ciudad}</p>
                    <p class="direccion-detalle">🏠 ${n.direccion}</p>
                    <p class="descripcion">${n.descripcion || "Sin descripción disponible."}</p>
                    <div class="acciones-card">
                        <a href="${linkWA}" target="_blank" class="btn-wa-card" onclick="event.stopPropagation()">WhatsApp</a>
                        <button class="btn-share-card" data-nombre="${n.nombre}" data-id="${n.id}">
                            <i class="fa-solid fa-share-nodes"></i>
                        </button>
                    </div>
                </div>`;
            negociosContainer.appendChild(card);
        });
    }

    function renderizarDestacados(lista) {
        const destacadosCont = document.getElementById('destacados-container');
        if (!destacadosCont) return;
        const seccion = destacadosCont.closest('section');
        if (lista.length === 0) { if (seccion) seccion.style.display = "none"; return; }

        if (seccion) seccion.style.display = "block";
        destacadosCont.innerHTML = "";
        lista.sort(() => 0.5 - Math.random()).slice(0, 5).forEach(n => {
            const card = document.createElement('div');
            card.className = 'card-destacada';
            const mensajeWA = encodeURIComponent(`¡Hola! Vi tu negocio "${n.nombre}" en los destacados...`);
            card.innerHTML = `
                <div class="badge-premium">⭐ DESTACADO</div>
                <img src="${n.imagen || 'https://via.placeholder.com/150'}" alt="${n.nombre}">
                <h4>${n.nombre}</h4>
                <span class="categoria-tag-sm">${n.categoria}</span>
                <a href="https://wa.me/${n.whatsapp}?text=${mensajeWA}" target="_blank" class="btn-wa-sm">WhatsApp</a>`;
            destacadosCont.appendChild(card);
        });
    }

    function actualizarTitulo(txt) {
        if (!tituloUbicacion) return;
        const bonita = txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
        tituloUbicacion.innerText = `Negocios en ${bonita}`;
    }

    btnSearch?.addEventListener('click', (e) => { e.preventDefault(); ejecutarFiltro(); });
    [inputKeyword, inputCiudad, inputBarrio].forEach(el => {
        el?.addEventListener('input', ejecutarFiltro);
        el?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ejecutarFiltro(); el.blur(); } });
    });

    window.filtrarPorIcono = (cat) => {
        if (inputKeyword) inputKeyword.value = cat;
        if (inputBarrio) inputBarrio.value = "";
        ejecutarFiltro();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    inicializar();
});