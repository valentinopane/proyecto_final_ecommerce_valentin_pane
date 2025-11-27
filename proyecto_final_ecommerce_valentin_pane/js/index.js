// Lista de productos 
const productos = [
  {
    id: "prod-1",
    nombre: "Chateau La Coste Rose",
    descripcion: "Rosado fresco, frutos rojos supermaduros y acidez viva.",
    precio: 43900,
    descuento: 13,
    imagen: "./img/producto1.png",
  },
  {
    id: "prod-2",
    nombre: "Pepe Yllera 2022",
    descripcion: "Vino joven, frutal, suave y equilibrado para cualquier momento.",
    precio: 35500,
    descuento: 10,
    imagen: "./img/producto2.png",
  },
  {
    id: "prod-3",
    nombre: "Rutini Cabernet Malbec",
    descripcion: "Blend elegante, taninos firmes y notas de ciruela y cassis.",
    precio: 56800,
    descuento: 15,
    imagen: "./img/producto3.png",
  },
  {
    id: "prod-4",
    nombre: "Luigi Bosca De Sangre",
    descripcion: "Vino intenso, especiado, ideal para carnes y pastas.",
    precio: 41200,
    descuento: 12,
    imagen: "./img/producto4.png",
  },
  {
    id: "prod-5",
    nombre: "DV Catena Malbec",
    descripcion: "Malbec clásico, fruta negra y final prolongado.",
    precio: 48900,
    descuento: 8,
    imagen: "./img/producto5.png",
  },
  {
    id: "prod-6",
    nombre: "Nicasia Vineyards Blend",
    descripcion: "Blend sofisticado, con barrica francesa y aromas complejos.",
    precio: 62300,
    descuento: 10,
    imagen: "./img/producto6.png",
  },
];

// Función para formatear número a $xx.xxx
function formatoPrecio(numero) {
  return numero.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

// Generar productos en el DOM
function mostrarProductos() {
  const contenedor = document.getElementById("section-products");
  contenedor.innerHTML = ""; // limpiar

  productos.forEach((p) => {
    const articulo = document.createElement("article");
    articulo.classList.add("producto");
    articulo.id = p.id;

    articulo.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h2>${p.nombre}</h2>
      <p class="descripcion">${p.descripcion}</p>
      <div class="precio">
        <span class="valor">${formatoPrecio(p.precio)}</span>
        <span class="descuento">-${p.descuento}%</span>
      </div>
      <a href="#" class="btn-add">Añadir</a>
    `;

    contenedor.appendChild(articulo);
  });

  activarBotonesCarrito();
}

// Función para activar botones Añadir y agregar productos al carrito
function activarBotonesCarrito() {
  const botones = document.querySelectorAll(".btn-add");

  botones.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      e.preventDefault();

      const card = boton.closest(".producto");
      const producto = productos.find((p) => p.id === card.id);

      if (producto) {
        agregarAlCarrito(producto);
        alert(`${producto.nombre} agregado al carrito`);
      }
    });
  });
}

// Agregar producto al carrito en localStorage
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Si producto ya existe, aumentar cantidad
  const index = carrito.findIndex((p) => p.id === producto.id);
  if (index !== -1) {
    carrito[index].cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Inicializar todo al cargar
document.addEventListener("DOMContentLoaded", () => {
  mostrarProductos();
});


