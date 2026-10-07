let datosGlobales = {};

fetch('rios.json')
    .then(response => response.json())
    .then(data => {
        datosGlobales = data;
        construirMenu(data);
    })
    .catch(error => {
        console.error('Error cargando rios.json:', error);
    });

function construirMenu(data) {
    const menu = document.getElementById('menu-localidades');
    menu.innerHTML = '';

    Object.keys(data).forEach(localidad => {
        const li = document.createElement('li');
        li.textContent = localidad;

        li.addEventListener('click', () => {
            document.querySelectorAll('#menu-localidades li').forEach(item => {
                item.classList.remove('activa');
            });

            li.classList.add('activa');
            mostrarRios(localidad, data);
        });

        menu.appendChild(li);
    });
}

function mostrarRios(localidad, data) {
    const contenedor = document.getElementById('contenido-rios');
    contenedor.innerHTML = '';

    const rios = data[localidad];

    if (!rios || rios.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-inicial">No hay ríos cargados para esta localidad.</p>';
        return;
    }

    rios.forEach(rio => {
        const card = document.createElement('div');
        card.className = 'card-rio';
        card.dataset.busqueda = `${rio.rio} ${rio.estado} ${rio.caudal}`.toLowerCase();

        card.innerHTML = `
            <div class="card-header">
                <div class="card-header-left">
                    <span class="icono-rio">🌊</span>
                    <span class="nombre-rio">${rio.rio}</span>
                </div>
                <div class="card-header-right">
                    <span class="icono-flecha">▾</span>
                </div>
            </div>

            <div class="card-info" style="display:none;">
                <p><strong>Estado:</strong> <span class="${claseEstado(rio.estado)}">${rio.estado}</span></p>
                <p><strong>Caudal:</strong> ${rio.caudal}</p>
            </div>
        `;

        const header = card.querySelector('.card-header');
        const info = card.querySelector('.card-info');
        const flecha = card.querySelector('.icono-flecha');

        header.addEventListener('click', () => {
            const abierta = info.style.display === 'block';
            info.style.display = abierta ? 'none' : 'block';
            flecha.textContent = abierta ? '▾' : '▴';
        });

        contenedor.appendChild(card);
    });
}

function claseEstado(estado) {
    const valor = (estado || '').toLowerCase();

    if (valor === 'bueno') return 'estado-bueno';
    if (valor === 'seco') return 'estado-seco';
    if (valor === 'crecido') return 'estado-crecido';
    if (valor === 'normal') return 'estado-normal';

    return '';
}

// Filtro de búsqueda
const input = document.getElementById('buscador');
if (input) {
    input.addEventListener('input', function() {
        const searchTerm = input.value.trim().toLowerCase();
        const menu = document.getElementById('menu-localidades');
        const items = menu.querySelectorAll('li');

        items.forEach(item => {
            const texto = item.textContent.toLowerCase();
            const coincide = !searchTerm || texto.includes(searchTerm);
            item.style.display = coincide ? '' : 'none';
        });
    });
}