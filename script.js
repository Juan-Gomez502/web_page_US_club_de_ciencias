const listaRios = document.getElementById('contenido-rios');
const buscador = document.getElementById('buscador');
const datosPorTarjeta = new WeakMap();
let rioAbierto = null;
let columnasActuales = obtenerCantidadColumnas();

fetch('rios.json')
    .then(response => {
        if (!response.ok) throw new Error(`Error ${response.status} al cargar rios.json`);
        return response.json();
    })
    .then(mostrarRios)
    .catch(error => {
        console.error('No se pudieron cargar los ríos:', error);
        listaRios.innerHTML = '<p class="mensaje-error">No se pudieron cargar los ríos.</p>';
    });

function mostrarRios(datos) {
    const tarjetas = [];

    Object.entries(datos).forEach(([localidad, rios]) => {
        rios.forEach(rio => {
            const tarjeta = document.createElement('article');
            tarjeta.className = 'card-rio';
            const nombreLocalidad = rio.localidad || localidad;
            tarjeta.dataset.busqueda = `${rio.rio} ${nombreLocalidad}`.toLowerCase();
            datosPorTarjeta.set(tarjeta, { rio, localidad });

            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'card-rio-titulo';
            boton.setAttribute('aria-expanded', 'false');

            const nombres = document.createElement('span');
            nombres.className = 'nombres-localidad';
            const nombre = document.createElement('span');
            nombre.className = 'nombre-localidad';
            nombre.textContent = nombreLocalidad;

            const nombreRio = document.createElement('span');
            nombreRio.className = 'nombre-rio';
            nombreRio.textContent = rio.rio;
            nombres.append(nombre, nombreRio);

            const flecha = document.createElement('span');
            flecha.className = 'flecha-rio';
            flecha.textContent = '⌄';
            flecha.setAttribute('aria-hidden', 'true');
            boton.append(nombres, flecha);
            boton.addEventListener('click', () => seleccionarRio(tarjeta));

            tarjeta.appendChild(boton);
            tarjetas.push(tarjeta);
        });
    });

    organizarTarjetas(tarjetas, columnasActuales);
    window.addEventListener('resize', reorganizarTarjetas);
}

function obtenerCantidadColumnas() {
    if (window.matchMedia('(max-width: 520px)').matches) return 1;
    if (window.matchMedia('(max-width: 760px)').matches) return 2;
    return 3;
}

function reorganizarTarjetas() {
    const columnas = obtenerCantidadColumnas();
    if (columnas === columnasActuales) return;

    columnasActuales = columnas;
    organizarTarjetas(
        Array.from(listaRios.querySelectorAll('.card-rio')),
        columnas
    );
}

function organizarTarjetas(tarjetas, columnas) {
    listaRios.replaceChildren();

    for (let indice = 0; indice < tarjetas.length; indice += columnas) {
        const fila = document.createElement('section');
        fila.className = 'fila-rios';

        const tarjetasFila = document.createElement('div');
        tarjetasFila.className = 'tarjetas-fila';

        const informacion = document.createElement('div');
        informacion.className = 'informacion-rio';
        informacion.id = `informacion-rio-${indice}`;
        informacion.setAttribute('aria-hidden', 'true');
        informacion.setAttribute('inert', '');

        const contenidoInformacion = document.createElement('div');
        contenidoInformacion.className = 'informacion-rio-contenido';
        informacion.appendChild(contenidoInformacion);

        tarjetas.slice(indice, indice + columnas).forEach(tarjeta => {
            tarjeta.querySelector('.card-rio-titulo').setAttribute('aria-controls', informacion.id);
            tarjetasFila.appendChild(tarjeta);
        });

        fila.append(tarjetasFila, informacion);
        listaRios.appendChild(fila);
        fila.hidden = !fila.querySelector('.card-rio:not([hidden])');
    }

    if (rioAbierto) {
        const seleccionada = rioAbierto;
        rioAbierto = null;
        seleccionarRio(seleccionada);
    }
}

function seleccionarRio(seleccionada) {
    rioAbierto = rioAbierto === seleccionada ? null : seleccionada;
    const filaAbierta = rioAbierto ? rioAbierto.closest('.fila-rios') : null;

    listaRios.querySelectorAll('.fila-rios').forEach(fila => {
        const activa = fila === filaAbierta;
        const informacion = fila.querySelector('.informacion-rio');
        fila.classList.toggle('seleccionada', activa);
        informacion.setAttribute('aria-hidden', String(!activa));
        informacion.toggleAttribute('inert', !activa);
    });

    listaRios.querySelectorAll('.card-rio').forEach(tarjeta => {
        const activa = tarjeta === rioAbierto;
        tarjeta.classList.toggle('seleccionada', activa);
        tarjeta.querySelector('.card-rio-titulo').setAttribute('aria-expanded', String(activa));
    });

    if (!rioAbierto) return;

    const fila = filaAbierta.querySelector('.informacion-rio-contenido');
    const { rio, localidad } = datosPorTarjeta.get(rioAbierto);
    const apartados = document.createElement('div');
    apartados.className = 'apartados-rio';
    agregarApartado(apartados, 'Estado', rio.estado || 'Sin datos', '≈', claseEstado(rio.estado));
    agregarApartado(apartados, 'Caudal', rio.caudal || 'Sin datos', '▤');
    agregarApartado(apartados, 'Ubicación', rio.ubicacion || `${localidad}, Punilla - Córdoba`, '⌖');
    agregarApartado(
        apartados,
        'Seguridad',
        rio.recomendacion || 'Consultá las condiciones antes de ingresar al agua.',
        '△'
    );
    fila.replaceChildren(apartados);
}

function agregarApartado(contenedor, nombre, valor, icono, clase = '') {
    const apartado = document.createElement('article');
    apartado.className = 'apartado-rio';

    const encabezado = document.createElement('h3');
    const simbolo = document.createElement('span');
    simbolo.setAttribute('aria-hidden', 'true');
    simbolo.textContent = icono;
    encabezado.append(simbolo, document.createTextNode(` ${nombre}`));

    const texto = document.createElement('p');
    texto.className = clase;
    texto.textContent = valor;

    apartado.append(encabezado, texto);
    contenedor.appendChild(apartado);
}

function claseEstado(estado) {
    return {
        bueno: 'estado-bueno',
        normal: 'estado-normal',
        seco: 'estado-seco',
        crecido: 'estado-crecido'
    }[(estado || '').toLowerCase()] || '';
}

buscador.addEventListener('input', () => {
    const termino = buscador.value.trim().toLowerCase();
    listaRios.querySelectorAll('.card-rio').forEach(tarjeta => {
        tarjeta.hidden = !tarjeta.dataset.busqueda.includes(termino);
    });

    if (rioAbierto && rioAbierto.hidden) {
        seleccionarRio(rioAbierto);
    }

    listaRios.querySelectorAll('.fila-rios').forEach(fila => {
        fila.hidden = !fila.querySelector('.card-rio:not([hidden])');
    });
});
