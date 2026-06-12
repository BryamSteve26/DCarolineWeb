const WHATSAPP_NUMBER = "51947980409";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsMP37xtj15I6HuOVZPy2xFk4YEccR78uS-axWH5tlwJsJKWaPQZjnxl93Sh4vk5Sh6g/exec";

let carrito = [];

const botonesAgregar = document.querySelectorAll(".add-cart");

const cartToggle = document.getElementById("cartToggle");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartFloatTotal = document.getElementById("cartFloatTotal");
const cartTotal = document.getElementById("cartTotal");

const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutOverlay = document.getElementById("checkoutOverlay");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
const checkoutForm = document.getElementById("checkoutForm");

botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", () => {
        const producto = boton.dataset.producto;
        const precio = Number(boton.dataset.precio);

        agregarProducto(producto, precio);

        boton.classList.add("added");
        boton.textContent = "Agregado ✓";

        setTimeout(() => {
            boton.classList.remove("added");
            boton.textContent = "Agregar al pedido";
        }, 1200);

        abrirCarrito();
    });
});

function agregarProducto(producto, precio) {
    const itemExistente = carrito.find((item) => item.producto === producto);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            producto,
            precio,
            cantidad: 1
        });
    }

    renderizarCarrito();
}

function renderizarCarrito() {
    cartItems.innerHTML = "";

    if (carrito.length === 0) {
        cartItems.innerHTML = `
            <p class="empty-cart">
                Aún no agregaste productos.
            </p>
        `;
    }

    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;

        total += subtotal;
        cantidadTotal += item.cantidad;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <div class="cart-item-top">
                <div>
                    <h4>${item.producto}</h4>
                    <p>S/${subtotal}</p>
                </div>

                <button class="remove-item" onclick="eliminarProducto(${index})">
                    ×
                </button>
            </div>

            <div class="qty-controls">
                <button onclick="disminuirCantidad(${index})">-</button>
                <span>${item.cantidad}</span>
                <button onclick="aumentarCantidad(${index})">+</button>
            </div>
        `;

        cartItems.appendChild(div);
    });

    cartCount.textContent = cantidadTotal;
    cartFloatTotal.textContent = total;
    cartTotal.textContent = total;
}

function aumentarCantidad(index) {
    carrito[index].cantidad += 1;
    renderizarCarrito();
}

function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
    } else {
        carrito.splice(index, 1);
    }

    renderizarCarrito();
}

function eliminarProducto(index) {
    carrito.splice(index, 1);
    renderizarCarrito();
}

function abrirCarrito() {
    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
}

function cerrarCarrito() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
}

function abrirCheckout() {
    if (carrito.length === 0) {
        alert("Agrega al menos un producto para continuar.");
        return;
    }

    checkoutModal.classList.add("active");
    checkoutOverlay.classList.add("active");
}

function cerrarCheckout() {
    checkoutModal.classList.remove("active");
    checkoutOverlay.classList.remove("active");
}

cartToggle.addEventListener("click", abrirCarrito);
closeCart.addEventListener("click", cerrarCarrito);
cartOverlay.addEventListener("click", cerrarCarrito);

checkoutBtn.addEventListener("click", abrirCheckout);
closeCheckout.addEventListener("click", cerrarCheckout);
checkoutOverlay.addEventListener("click", cerrarCheckout);

checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombre = document.getElementById("checkoutNombre").value.trim();
    const celular = document.getElementById("checkoutCelular").value.trim();
    const modalidad = document.getElementById("checkoutModalidad").value;
    const direccion = document.getElementById("checkoutDireccion").value.trim();
    const fecha = document.getElementById("checkoutFecha").value;
    const observaciones = document.getElementById("checkoutObservaciones").value.trim();

    if (!nombre || !celular || !modalidad) {
        alert("Completa nombre, celular y modalidad.");
        return;
    }

    if (modalidad === "Delivery" && !direccion) {
        alert("Por favor indica dirección o referencia para delivery.");
        return;
    }

    const total = carrito.reduce((sum, item) => {
        return sum + item.precio * item.cantidad;
    }, 0);

    const detallePedido = carrito.map((item) => {
        return `- ${item.producto} x ${item.cantidad} = S/${item.precio * item.cantidad}`;
    }).join("\n");

    const mensaje = `
Hola D´Caroline, quiero realizar un pedido:

Cliente: ${nombre}
Celular: ${celular}
Modalidad: ${modalidad}
Dirección/Referencia: ${direccion || "No indicado"}
Fecha solicitada: ${fecha || "No indicada"}

Pedido:
${detallePedido}

Total: S/${total}

Observaciones:
${observaciones || "Sin observaciones"}

Nota: Entiendo que el costo de delivery se confirma según distrito.
`;

    const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsApp, "_blank");
});