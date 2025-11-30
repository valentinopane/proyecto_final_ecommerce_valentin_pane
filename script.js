// script.js — Mejorado: búsqueda, animación al agregar y paginación
// -----------------------------------------------------------
// Configuración
const API_URL = "https://fakestoreapi.com/products"; // API pública
const PER_PAGE = 6; // items por página (paginación)
let productosAll = []; // productos traídos de la API
let productosFiltrados = []; // resultados filtrados por búsqueda/categoría
let paginaActual = 1;

// Elementos del DOM (existentes)
const listaProductos = document.getElementById("lista-productos");
const carritoBtn = document.getElementById("carrito-boton");
const carritoPanel = document.getElementById("carrito-panel");
const carritoLista = document.getElementById("carrito-lista");
const carritoTotal = document.getElementById("carrito-total");

// Crear/insertar controles (search, paginación) si no existen
function crearControlesUI() {
    // Wrapper para controles encima de productos
    let controles = document.getElementById("controles-productos");
    if (!controles) {
        controles = document.createElement("div");
        controles.id = "controles-productos";
        controles.style.display = "flex";
        controles.style.flexWrap = "wrap";
        controles.style.gap = "10px";
        controles.style.justifyContent = "space-between";
        controles.style.alignItems = "center";
        controles.style.marginBottom = "12px";
        // Insertar antes de #lista-productos
        listaProductos.parentNode.insertBefore(controles, listaProductos);
    }

    // Buscador (input)
    if (!document.getElementById("buscador-productos")) {
        const buscador = document.createElement("input");
        buscador.id = "buscador-productos";
        buscador.type = "search";
        buscador.placeholder = "Buscar productos...";
        buscador.style.padding = "10px";
        buscador.style.borderRadius = "8px";
        buscador.style.border = "1px solid #ccc";
        buscador.style.minWidth = "220px";
        buscador.addEventListener("input", () => {
            paginaActual = 1;
            aplicarFiltrosYRender();
        });
        controles.appendChild(buscador);
    }

    // Contenedor de paginación
    if (!document.getElementById("paginacion-productos")) {
        const pagWrap = document.createElement("div");
        pagWrap.id = "paginacion-productos";
        pagWrap.style.display = "flex";
        pagWrap.style.justifyContent = "center";
        pagWrap.style.marginTop = "14px";
        // lo insertamos después de la lista de productos (en el DOM)
        listaProductos.parentNode.insertBefore(pagWrap, listaProductos.nextSibling);
    }
}

// ==============================
// Cargar productos desde API
// ==============================
async function fetchProductos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        productosAll = Array.isArray(data) ? data : [];
        productosFiltrados = [...productosAll];
        paginaActual = 1;
        aplicarFiltrosYRender();
    } catch (err) {
        console.error("Error al obtener productos:", err);
        listaProductos.innerHTML = "<p>Error al cargar los productos. Intentá recargar la página.</p>";
    }
}

// Aplica filtros (búsqueda) y renderiza la página actual
function aplicarFiltrosYRender() {
    const termino = (document.getElementById("buscador-productos")?.value || "").trim().toLowerCase();

    if (termino === "") {
        productosFiltrados = [...productosAll];
    } else {
        productosFiltrados = productosAll.filter(p => {
            return p.title.toLowerCase().includes(termino) || (p.description || "").toLowerCase().includes(termino);
        });
    }

    // Calcular páginas totales
    const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PER_PAGE));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;

    renderProductosPagina(paginaActual);
    renderPaginacion(totalPaginas);
}

// Renderiza una página de productos (según PER_PAGE)
function renderProductosPagina(page) {
    listaProductos.innerHTML = "";
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const slice = productosFiltrados.slice(start, end);

    if (slice.length === 0) {
        listaProductos.innerHTML = "<p class='text-center'>No se encontraron productos.</p>";
        return;
    }

    slice.forEach(prod => {
        const col = document.createElement("div");
        col.className = "col-md-4 mb-3";

        // tarjeta producto
        const card = document.createElement("div");
        card.className = "producto-card";
        card.style.padding = "12px";
        card.style.borderRadius = "10px";
        card.style.textAlign = "center";

        const img = document.createElement("img");
        img.src = prod.image;
        img.alt = prod.title;
        img.style.width = "100%";
        img.style.height = "180px";
        img.style.objectFit = "contain";
        img.style.cursor = "pointer";
        img.addEventListener("click", () => mostrarDetalle(prod));

        const title = document.createElement("h5");
        title.className = "mt-2";
        title.innerText = prod.title;

        const price = document.createElement("p");
        price.className = "text-success fw-bold";
        price.style.fontWeight = "700";
        price.innerText = `$${Number(prod.price).toFixed(2)}`;

        const btnDetail = document.createElement("button");
        btnDetail.className = "btn btn-secondary w-100 mb-2";
        btnDetail.type = "button";
        btnDetail.innerText = "Ver detalle";
        btnDetail.addEventListener("click", () => mostrarDetalle(prod));

        const btnAdd = document.createElement("button");
        btnAdd.className = "btn btn-primary w-100";
        btnAdd.type = "button";
        btnAdd.innerText = "Agregar al carrito";
        btnAdd.addEventListener("click", (e) => {
            agregarAlCarrito(prod);
            animarImagenAlCarrito(e, img);
        });

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(btnDetail);
        card.appendChild(btnAdd);

        col.appendChild(card);
        listaProductos.appendChild(col);
    });
}

// Renderiza controles de paginación
function renderPaginacion(totalPaginas) {
    const pag = document.getElementById("paginacion-productos");
    pag.innerHTML = "";

    if (totalPaginas <= 1) return;

    const prev = document.createElement("button");
    prev.className = "btn btn-outline-primary me-2";
    prev.innerText = "« Prev";
    prev.disabled = paginaActual === 1;
    prev.addEventListener("click", () => {
        paginaActual = Math.max(1, paginaActual - 1);
        aplicarFiltrosYRender();
        window.scrollTo({ top: 200, behavior: "smooth" });
    });

    pag.appendChild(prev);

    const maxButtons = 7;
    let start = Math.max(1, paginaActual - 3);
    let end = Math.min(totalPaginas, start + maxButtons - 1);
    if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

    for (let i = start; i <= end; i++) {
        const pbtn = document.createElement("button");
        pbtn.className = "btn me-1";
        pbtn.style.minWidth = "40px";
        pbtn.innerText = i;
        if (i === paginaActual) {
            pbtn.classList.add("btn-primary");
        } else {
            pbtn.classList.add("btn-outline-secondary");
            pbtn.addEventListener("click", () => {
                paginaActual = i;
                aplicarFiltrosYRender();
                window.scrollTo({ top: 220, behavior: "smooth" });
            });
        }
        pag.appendChild(pbtn);
    }

    const next = document.createElement("button");
    next.className = "btn btn-outline-primary ms-2";
    next.innerText = "Next »";
    next.disabled = paginaActual === totalPaginas;
    next.addEventListener("click", () => {
        paginaActual = Math.min(totalPaginas, paginaActual + 1);
        aplicarFiltrosYRender();
        window.scrollTo({ top: 200, behavior: "smooth" });
    });

    pag.appendChild(next);
}

// ==============================
// Modal simple (detalle)
// ==============================
let modalOverlay = null;

function mostrarDetalle(prod) {
    if (modalOverlay) modalOverlay.remove();

    modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.left = 0;
    modalOverlay.style.top = 0;
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.background = "rgba(0,0,0,0.6)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.zIndex = 1500;
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) modalOverlay.remove();
    });

    const modal = document.createElement("div");
    modal.style.width = "90%";
    modal.style.maxWidth = "720px";
    modal.style.background = "white";
    modal.style.borderRadius = "10px";
    modal.style.padding = "16px";
    modal.style.maxHeight = "85vh";
    modal.style.overflowY = "auto";

    modal.innerHTML = `
        <div style="display:flex; gap:12px; align-items:flex-start;">
            <img src="${prod.image}" style="width:160px; height:160px; object-fit:contain; border-radius:8px" alt="${escapeHtml(prod.title)}" />
            <div style="flex:1">
                <h4 style="margin:0 0 8px 0">${escapeHtml(prod.title)}</h4>
                <p style="margin:0 0 8px 0; font-weight:700; color: #198754">$${Number(prod.price).toFixed(2)}</p>
                <p style="font-size:0.95rem; color:inherit; margin-bottom:12px">${escapeHtml(prod.description || "")}</p>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-primary" id="modal-add">Agregar al carrito</button>
                    <button class="btn btn-outline-secondary" id="modal-close">Cerrar</button>
                </div>
            </div>
        </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    document.getElementById("modal-close").addEventListener("click", () => modalOverlay.remove());
    document.getElementById("modal-add").addEventListener("click", (e) => {
        agregarAlCarrito(prod);
        const imgElem = modal.querySelector("img");
        animarImagenAlCarrito(e, imgElem);
        modalOverlay.remove();
    });
}

// escapar texto para evitar problemas
function escapeHtml(txt) {
    return String(txt)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// ==============================
// Carrito (persistente)
// ==============================
let carrito = JSON.parse(localStorage.getItem("mercadito_carrito_v1")) || [];

function guardarCarrito() {
    localStorage.setItem("mercadito_carrito_v1", JSON.stringify(carrito));
}

// Abrir / cerrar panel lateral
carritoBtn.addEventListener("click", () => {
    carritoPanel.classList.toggle("abierto");
});

// Agregar producto (agrupa por id)
function agregarAlCarrito(prod) {
    const existente = carrito.find(p => p.id === prod.id);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ id: prod.id, titulo: prod.title, precio: Number(prod.price), cantidad: 1 });
    }
    guardarCarrito();
    actualizarCarrito();
}

// Quitar una unidad
function eliminarUnidad(index) {
    carrito[index].cantidad--;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    guardarCarrito();
    actualizarCarrito();
}

// Eliminar producto completamente
function eliminarProducto(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarCarrito();
}

// Vaciar carrito
document.getElementById("vaciar-carrito").addEventListener("click", () => {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
});

// Comprar (simulación)
document.getElementById("comprar").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    alert("¡Gracias por tu compra!");
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
});

// Cerrar carrito al hacer clic fuera del panel
document.addEventListener("click", (event) => {
    const esClickDentroDelCarrito = carritoPanel.contains(event.target);
    const esBotonCarrito = carritoBtn.contains(event.target);

    if (carritoPanel.classList.contains("abierto") &&
        !esClickDentroDelCarrito &&
        !esBotonCarrito) {
        carritoPanel.classList.remove("abierto");
    }
});

// Render del carrito
function actualizarCarrito() {
    carritoLista.innerHTML = "";
    if (carrito.length === 0) {
        carritoLista.innerHTML = "<p class='small muted'>Carrito vacío.</p>";
    } else {
        carrito.forEach((item, index) => {
            const div = document.createElement("div");
            div.style.background = "#f8f9fa";
            div.style.padding = "10px";
            div.style.borderRadius = "8px";
            div.style.marginBottom = "8px";

            div.innerHTML = `
                <strong style="display:block">${escapeHtml(item.titulo)}</strong>
                <div style="margin-top:6px; display:flex; gap:8px; align-items:center;">
                    <span>$${Number(item.precio).toFixed(2)} x ${item.cantidad}</span>
                    <div style="margin-left:auto; display:flex; gap:6px;">
                        <button class="btn btn-sm btn-outline-danger" data-action="minus" data-index="${index}">-</button>
                        <button class="btn btn-sm btn-outline-success" data-action="plus" data-index="${index}">+</button>
                        <button class="btn btn-sm btn-danger" data-action="del" data-index="${index}">Eliminar</button>
                    </div>
                </div>
            `;
            carritoLista.appendChild(div);
        });
    }

    // Delegación de eventos para botones del carrito
    carritoLista.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.getAttribute("data-action");
            const idx = Number(btn.getAttribute("data-index"));
            if (action === "minus") {
                eliminarUnidad(idx);
            } else if (action === "plus") {
                const item = carrito[idx];
                if (item) {
                    item.cantidad++;
                    guardarCarrito();
                    actualizarCarrito();
                }
            } else if (action === "del") {
                eliminarProducto(idx);
            }
        });
    });

    const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
    carritoTotal.textContent = "$" + total.toFixed(2);

    // Actualizo solo el número dentro del span sin tocar el SVG
    const carritoCantidad = document.getElementById("carrito-cantidad");
    carritoCantidad.textContent = carrito.reduce((a, b) => a + b.cantidad, 0);
}

// ==============================
// Animación: imagen vuela al carrito
// ==============================
function animarImagenAlCarrito(clickEvent, imgElement) {
    if (!imgElement) return;
    const imgRect = imgElement.getBoundingClientRect();
    const cartRect = carritoBtn.getBoundingClientRect();

    // clonar imagen
    const fly = imgElement.cloneNode(true);
    fly.classList.add("fly-image");
    fly.style.width = imgRect.width + "px";
    fly.style.height = imgRect.height + "px";
    fly.style.left = imgRect.left + "px";
    fly.style.top = imgRect.top + "px";
    fly.style.opacity = "1";
    document.body.appendChild(fly);

    // fuerza reflow para asegurar transform calculado
    fly.getBoundingClientRect();

    // calcular transform - ir al centro del carrito
    const targetX = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
    const targetY = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);

    fly.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.15) rotate(20deg)`;
    fly.style.opacity = "0.1";

    // limpiar después de la animación
    setTimeout(() => {
        fly.remove();
        carritoBtn.animate([
            { transform: "translateY(0)" },
            { transform: "translateY(-6px)" },
            { transform: "translateY(0)" }
        ], { duration: 300, easing: "ease-out" });
    }, 650);
}

// ==============================
// Inicialización
// ==============================
function inicializar() {
    crearControlesUI();
    fetchProductos();
    actualizarCarrito();
}

// Ejecutar
inicializar();

