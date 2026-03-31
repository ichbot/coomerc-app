// main.js - Lógica de Interfaz y Funciones Globales
document.addEventListener('DOMContentLoaded', () => {

    // 1. SIDEBAR (MENÚ LATERAL)
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');

    const toggleMenu = () => {
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('show');
    };

    [openMenu, closeMenu, overlay].forEach(el => {
        if (el) el.addEventListener('click', toggleMenu);
    });

    // 2. CONTADORES ANIMADOS (Solo si existen en la página)
    const seccionContadores = document.getElementById('coomerc-counters');
    if (seccionContadores) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                document.querySelectorAll('.counter-number').forEach(c => {
                    const target = +c.getAttribute('data-target');
                    let actual = 0;
                    const inc = target / 50;
                    const upd = () => {
                        actual += inc;
                        if (actual < target) {
                            c.innerText = Math.ceil(actual);
                            setTimeout(upd, 30);
                        } else { c.innerText = target; }
                    };
                    upd();
                });
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        observer.observe(seccionContadores);
    }

    // 3. SHARE APP (Botón de compartir la App general)
    document.getElementById('shareApp')?.addEventListener('click', (e) => {
        e.preventDefault();
        const data = {
            title: 'Coomerc',
            text: 'Encuentra negocios locales aquí:',
            url: window.location.origin
        };
        if (navigator.share) {
            navigator.share(data).catch(() => {});
        } else {
            navigator.clipboard.writeText(data.url);
            alert("Enlace de la App copiado 🚀");
        }
    });

    // 4. SISTEMA SHARE DE TARJETAS (Delegación de eventos)
    let shareData = { nombre: "", url: "" };
    const menuShare = document.getElementById('share-menu');

    document.addEventListener('click', (e) => {
        const btnShare = e.target.closest('.btn-share-card');

        // Abrir Menú
        if (btnShare) {
            e.stopPropagation();
            shareData.nombre = btnShare.dataset.nombre || "Negocio";
            shareData.url = `${window.location.origin}/index.html?negocio=${btnShare.dataset.id}`;
            menuShare?.classList.remove('hidden');
            return;
        }

        // Botones de Redes Sociales dentro del modal
        const btnSocial = e.target.closest('#share-wa, #share-fb, #share-x, #share-ln');
        if (btnSocial) {
            e.preventDefault();
            const texto = `📍 Mira este negocio: *${shareData.nombre}* en Coomerc 👇`;
            const u = encodeURIComponent(shareData.url);
            const t = encodeURIComponent(texto);

            if (btnSocial.id === 'share-wa') window.open(`https://wa.me/?text=${t}%20${u}`, '_blank');
            if (btnSocial.id === 'share-fb') window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, '_blank');
            if (btnSocial.id === 'share-x')  window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, '_blank');
            if (btnSocial.id === 'share-ln') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`, '_blank');
            
            menuShare.classList.add('hidden');
        }

        // Cerrar si toca afuera
        if (menuShare && !menuShare.classList.contains('hidden') && !e.target.closest('.share-content')) {
            menuShare.classList.add('hidden');
        }
    });

    // 5. FORMULARIO DE CONTACTO (About/Footer)
    const formContacto = document.getElementById('form-contacto-about');
    formContacto?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.innerText = "Enviando...";

        try {
            const res = await fetch(e.target.action, {
                method: 'POST',
                body: new FormData(e.target),
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                alert("¡Mensaje enviado! Te contactaremos pronto.");
                e.target.reset();
            }
        } catch (err) { alert("Error de conexión."); }
        finally { btn.disabled = false; btn.innerText = "Enviar"; }
    });
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("SW registrado"))
    .catch(err => console.log("Error SW:", err));
}

document.addEventListener("DOMContentLoaded", () => {

  let deferredPrompt;

  const btnSidebar = document.getElementById("btnInstalarSidebar");
const btnFooter = document.getElementById("btnInstalarFooter");

  if (!btnSidebar && !btnFooter) return; // 👈 evita errores

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (btnSidebar) btnSidebar.style.display = "block";
  });

  async function instalarApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    deferredPrompt = null;

    if (btnSidebar) btnSidebar.style.display = "none";
    if (btnFooter) btnFooter.style.display = "none";
  }

  btnSidebar?.addEventListener("click", instalarApp);
  btnFooter?.addEventListener("click", instalarApp);

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const altura = document.body.scrollHeight - window.innerHeight;

    if (scrollY > altura - 300) {
      if (btnSidebar) btnSidebar.style.display = "none";
      if (btnFooter && deferredPrompt) btnFooter.style.display = "block";
    } else {
      if (btnSidebar && deferredPrompt) btnSidebar.style.display = "block";
      if (btnFooter) btnFooter.style.display = "none";
    }
  });

});