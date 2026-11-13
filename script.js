const listaRios = document.getElementById('contenido-rios');
const buscador = document.getElementById('buscador');
const datosPorTarjeta = new WeakMap();
const localidadesAnteriores = [
    'Cosquín',
    'La Falda',
    'La Cumbre',
    'Villa Giardino',
    'Capilla del Monte',
    'San Esteban',
    'Los Cocos',
    'Bialet Massé',
    'Casa Grande',
    'San Roque',
    'Valle Hermoso'
];
let localidadAbierta = null;
let rioAbierto = null;

fetch('rios.json')
    .then((response) => {
        if (!response.ok) throw new Error(`Error ${response.status} al cargar rios.json`);
        return response.json();
    })
    .then(mostrarRios)
    .catch((error) => {
        console.error('No se pudieron cargar los ríos:', error);
        listaRios.innerHTML = '<p class="mensaje-error">No se pudieron cargar los ríos.</p>';
    });

function mostrarRios(datos) {
    listaRios.replaceChildren();

    localidadesAnteriores.forEach((localidad, indice) => {
        const rios = Array.isArray(datos[localidad]) ? datos[localidad] : [];
        listaRios.appendChild(crearTarjetaLocalidad(localidad, rios, indice));
    });
}

function crearTarjetaLocalidad(localidad, rios, indiceLocalidad) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'card-localidad';
    tarjeta.dataset.busqueda = localidad.toLowerCase();

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'card-localidad-titulo';
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', `rios-localidad-${indiceLocalidad}`);

    const nombres = document.createElement('span');
    nombres.className = 'nombres-localidad';

    const nombre = document.createElement('span');
    nombre.className = 'nombre-localidad';
    nombre.textContent = localidad;

    const cantidad = document.createElement('span');
    cantidad.className = 'resumen-localidad';
    cantidad.textContent = `${rios.length} ${rios.length === 1 ? 'río o balneario' : 'ríos y balnearios'}`;
    nombres.append(nombre, cantidad);

    const flecha = crearFlecha();
    flecha.className = 'flecha-localidad';
    boton.append(nombres, flecha);
    boton.addEventListener('click', () => seleccionarLocalidad(tarjeta));

    const panelRios = document.createElement('div');
    panelRios.className = 'rios-localidad';
    panelRios.id = `rios-localidad-${indiceLocalidad}`;
    panelRios.setAttribute('aria-hidden', 'true');
    panelRios.setAttribute('inert', '');

    const contenidoRios = document.createElement('div');
    contenidoRios.className = 'rios-localidad-contenido';

    if (rios.length > 0) {
        const tarjetasRios = document.createElement('div');
        tarjetasRios.className = 'tarjetas-rios';
        rios.forEach((rio, indiceRio) => {
            tarjetasRios.appendChild(crearTarjetaRio(rio, localidad, indiceLocalidad, indiceRio));
        });
        contenidoRios.appendChild(tarjetasRios);
    } else {
        const mensaje = document.createElement('p');
        mensaje.className = 'mensaje-inicial';
        mensaje.textContent = 'No hay ríos cargados para esta localidad.';
        contenidoRios.appendChild(mensaje);
    }

    panelRios.appendChild(contenidoRios);
    tarjeta.append(boton, panelRios);
    return tarjeta;
}

function crearTarjetaRio(rio, localidad, indiceLocalidad, indiceRio) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'card-rio';
    tarjeta.dataset.busqueda = `${rio.rio || ''} ${localidad}`.toLowerCase();
    datosPorTarjeta.set(tarjeta, { rio, localidad });

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'card-rio-titulo';
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', `informacion-rio-${indiceLocalidad}-${indiceRio}`);

    const nombreRio = document.createElement('span');
    nombreRio.className = 'nombre-rio';
    nombreRio.textContent = rio.rio || 'Río sin nombre';

    const flecha = crearFlecha();
    flecha.className = 'flecha-rio';
    boton.append(nombreRio, flecha);
    boton.addEventListener('click', () => seleccionarRio(tarjeta));

    const informacion = document.createElement('div');
    informacion.className = 'informacion-rio';
    informacion.id = `informacion-rio-${indiceLocalidad}-${indiceRio}`;
    informacion.setAttribute('aria-hidden', 'true');
    informacion.setAttribute('inert', '');

    const contenidoInformacion = document.createElement('div');
    contenidoInformacion.className = 'informacion-rio-contenido';
    informacion.appendChild(contenidoInformacion);

    tarjeta.append(boton, informacion);
    return tarjeta;
}

function crearFlecha() {
    const flecha = document.createElement('span');
    flecha.className = 'flecha-rio';
    flecha.textContent = '⌄';
    flecha.setAttribute('aria-hidden', 'true');
    return flecha;
}

function seleccionarLocalidad(seleccionada) {
    localidadAbierta = localidadAbierta === seleccionada ? null : seleccionada;
    rioAbierto = null;

    listaRios.querySelectorAll('.card-localidad').forEach((tarjeta) => {
        const activa = tarjeta === localidadAbierta;
        tarjeta.classList.toggle('seleccionada', activa);
        tarjeta.querySelector('.card-localidad-titulo').setAttribute('aria-expanded', String(activa));

        const panel = tarjeta.querySelector('.rios-localidad');
        panel.setAttribute('aria-hidden', String(!activa));
        panel.toggleAttribute('inert', !activa);
    });

    listaRios.querySelectorAll('.card-rio').forEach((tarjeta) => actualizarEstadoRio(tarjeta, false));
}

function seleccionarRio(seleccionada) {
    rioAbierto = rioAbierto === seleccionada ? null : seleccionada;

    listaRios.querySelectorAll('.card-rio').forEach((tarjeta) => {
        const activa = tarjeta === rioAbierto;
        actualizarEstadoRio(tarjeta, activa);
    });

    if (rioAbierto) mostrarInformacionRio(rioAbierto);
}

function actualizarEstadoRio(tarjeta, activa) {
    tarjeta.classList.toggle('seleccionada', activa);
    const boton = tarjeta.querySelector('.card-rio-titulo');
    const informacion = tarjeta.querySelector('.informacion-rio');
    boton.setAttribute('aria-expanded', String(activa));
    informacion.setAttribute('aria-hidden', String(!activa));
    informacion.toggleAttribute('inert', !activa);
}

function mostrarInformacionRio(tarjeta) {
    const { rio, localidad } = datosPorTarjeta.get(tarjeta);
    const informacion = tarjeta.querySelector('.informacion-rio-contenido');
    const apartados = document.createElement('div');
    apartados.className = 'apartados-rio';

    agregarApartado(apartados, 'Estado', rio.estado || 'Sin datos', '≈', claseEstado(rio.estado));
    agregarApartado(apartados, 'Caudal', rio.caudal || 'Sin medición disponible', '▤');
    agregarApartado(
        apartados,
        'Ubicación',
        rio.ubicacion || `${localidad}, Punilla - Córdoba`,
        '⌖',
        '',
        crearEnlaceGoogleMaps(rio, localidad)
    );
    agregarApartado(
        apartados,
        'Seguridad',
        rio.precauciones || rio.recomendacion || 'Consultá las condiciones antes de ingresar al agua.',
        '△'
    );

    informacion.replaceChildren(apartados);
}

function agregarApartado(contenedor, nombre, valor, icono, clase = '', url = '') {
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

    if (url) {
        const enlaceMapa = document.createElement('a');
        enlaceMapa.className = 'enlace-mapa';
        enlaceMapa.href = url;
        enlaceMapa.target = '_blank';
        enlaceMapa.rel = 'noopener noreferrer';
        enlaceMapa.textContent = 'Abrir en Google Maps';
        apartado.appendChild(enlaceMapa);
    }

    contenedor.appendChild(apartado);
}

function crearEnlaceGoogleMaps(rio, localidad) {
    const coordenadas = rio.coordenadas;
    const tieneCoordenadasValidas =
        coordenadas &&
        Number.isFinite(coordenadas.lat) &&
        Number.isFinite(coordenadas.lng) &&
        coordenadas.lat >= -90 &&
        coordenadas.lat <= 90 &&
        coordenadas.lng >= -180 &&
        coordenadas.lng <= 180;

    const consulta = tieneCoordenadasValidas
        ? `${coordenadas.lat},${coordenadas.lng}`
        : `${rio.rio}, ${localidad}, Punilla, Córdoba`;
    const parametros = new URLSearchParams({ api: '1', query: consulta });

    return `https://www.google.com/maps/search/?${parametros}`;
}

function claseEstado(estado) {
    const valor = (estado || '').toLowerCase();

    if (valor.includes('bueno')) return 'estado-bueno';
    if (valor.includes('normal')) return 'estado-normal';
    if (valor.includes('seco') || valor.includes('bajo')) return 'estado-seco';
    if (valor.includes('crecido') || valor.includes('alto')) return 'estado-crecido';

    return '';
}

buscador.addEventListener('input', () => {
    const termino = buscador.value.trim().toLowerCase();
    localidadAbierta = null;
    rioAbierto = null;

    listaRios.querySelectorAll('.card-localidad').forEach((tarjeta) => {
        const coincideLocalidad = tarjeta.dataset.busqueda.includes(termino);
        const rios = Array.from(tarjeta.querySelectorAll('.card-rio'));
        const riosCoincidentes = rios.filter((rio) => rio.dataset.busqueda.includes(termino));

        rios.forEach((rio) => {
            rio.hidden = Boolean(termino) && !coincideLocalidad && !rio.dataset.busqueda.includes(termino);
            actualizarEstadoRio(rio, false);
        });

        tarjeta.hidden = Boolean(termino) && !coincideLocalidad && riosCoincidentes.length === 0;
        tarjeta.classList.remove('seleccionada');
        tarjeta.querySelector('.card-localidad-titulo').setAttribute('aria-expanded', 'false');

        const panel = tarjeta.querySelector('.rios-localidad');
        panel.setAttribute('aria-hidden', 'true');
        panel.setAttribute('inert', '');
    });
});
