/* PRECV landing: menú móvil, pestañas registro/login y validación de formularios.
   Es una página estática (GitHub Pages): los formularios son una demo, no envían datos a ningún servidor. */

(function () {
    'use strict';

    /* ---------- Menú hamburguesa ---------- */
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('menu-principal');

    function cerrarMenu() {
        menu.classList.remove('abierto');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
    }

    toggle.addEventListener('click', function () {
        const abierto = menu.classList.toggle('abierto');
        toggle.setAttribute('aria-expanded', String(abierto));
        toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) cerrarMenu();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('abierto')) {
            cerrarMenu();
            toggle.focus();
        }
    });

    /* ---------- Pestañas: Registrarse / Iniciar sesión ---------- */
    const tabs = {
        registro: { boton: document.getElementById('btn-registro'), panel: document.getElementById('form-registro') },
        login: { boton: document.getElementById('btn-login'), panel: document.getElementById('form-login') }
    };

    function mostrarTab(nombre, darFoco) {
        Object.keys(tabs).forEach(function (clave) {
            const activa = clave === nombre;
            tabs[clave].boton.setAttribute('aria-selected', String(activa));
            tabs[clave].boton.tabIndex = activa ? 0 : -1;
            tabs[clave].panel.hidden = !activa;
        });
        if (darFoco) tabs[nombre].boton.focus();
    }

    Object.keys(tabs).forEach(function (clave) {
        tabs[clave].boton.addEventListener('click', function () { mostrarTab(clave); });
        // Flechas izquierda/derecha cambian de pestaña (patrón accesible de tabs)
        tabs[clave].boton.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                mostrarTab(clave === 'registro' ? 'login' : 'registro', true);
            }
        });
    });

    // Los enlaces con data-abrir="registro" (navbar y "Comienza ahora") abren esa pestaña
    document.querySelectorAll('[data-abrir]').forEach(function (a) {
        a.addEventListener('click', function () { mostrarTab(a.dataset.abrir); });
    });
    if (location.hash === '#login') mostrarTab('login');

    /* ---------- Mostrar / ocultar contraseña ---------- */
    document.querySelectorAll('[data-toggle-pass]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const input = document.getElementById(btn.dataset.togglePass);
            const oculto = input.type === 'password';
            input.type = oculto ? 'text' : 'password';
            btn.textContent = oculto ? 'Ocultar' : 'Mostrar';
            btn.setAttribute('aria-label', oculto ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });
    });

    /* ---------- Validación ---------- */
    const reglas = {
        nombre: function (v) { return v.trim().length >= 3 ? '' : 'Ingresa tu nombre completo.'; },
        correo: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Ingresa un correo válido, por ejemplo nombre@correo.com.'; },
        password: function (v) { return v.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres.'; },
        requerido: function (v) { return v.length > 0 ? '' : 'Ingresa tu contraseña.'; },
        etapa: function (v) { return v ? '' : 'Selecciona tu etapa.'; }
    };

    function validarCampo(input) {
        const mensaje = reglas[input.dataset.validar](input.value);
        const error = document.getElementById(input.id + '-error');
        error.textContent = mensaje;
        error.hidden = !mensaje;
        input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
        return !mensaje;
    }

    // Guarda solo correos (nunca contraseñas) para simular "el correo ya existe" (HU-013)
    function leerCorreos() {
        try { return JSON.parse(localStorage.getItem('precv-correos') || '[]'); } catch (e) { return []; }
    }
    function guardarCorreo(correo) {
        try {
            const lista = leerCorreos();
            lista.push(correo);
            localStorage.setItem('precv-correos', JSON.stringify(lista));
        } catch (e) { /* sin almacenamiento: la demo sigue funcionando */ }
    }

    function mostrarEstado(form, texto, esError) {
        const estado = form.querySelector('.precv-status');
        estado.textContent = texto;
        estado.classList.toggle('es-error', !!esError);
        estado.hidden = false;
    }

    document.querySelectorAll('.precv-auth-form').forEach(function (form) {
        const campos = form.querySelectorAll('[data-validar]');

        campos.forEach(function (input) {
            input.addEventListener('blur', function () { if (input.value !== '' || input.getAttribute('aria-invalid')) validarCampo(input); });
            input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') validarCampo(input); });
            input.addEventListener('change', function () { if (input.tagName === 'SELECT') validarCampo(input); });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            form.querySelector('.precv-status').hidden = true;

            let primerError = null;
            campos.forEach(function (input) {
                if (!validarCampo(input) && !primerError) primerError = input;
            });
            if (primerError) { primerError.focus(); return; }

            if (form.dataset.form === 'registro') {
                const correo = form.querySelector('[data-validar="correo"]').value.trim().toLowerCase();
                if (leerCorreos().indexOf(correo) !== -1) {
                    mostrarEstado(form, 'Este correo ya está registrado. Prueba iniciando sesión.', true);
                    return;
                }
                guardarCorreo(correo);
                form.reset();
                campos.forEach(function (i) { i.removeAttribute('aria-invalid'); });
                mostrarEstado(form, '¡Cuenta creada! (Demostración: en la app real pasarías al onboarding).');
            } else {
                mostrarEstado(form, 'Demostración: en la app real entrarías a tu dashboard.');
            }
        });
    });
})();