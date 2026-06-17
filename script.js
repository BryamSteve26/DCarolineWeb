const WHATSAPP_NUMBER = "51947980409";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxv1od2F4zTDzdIPFH68wM9CjQSSdlWYNNoqyBmJjp8sML5MgTRNAgoHGwV6q-zeDDFvQ/exec";

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
const checkoutModalidad = document.getElementById("checkoutModalidad");
const direccionGroup = document.getElementById("direccionGroup");

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

    renderizarResumenCheckout();

    checkoutModal.classList.add("active");
    checkoutOverlay.classList.add("active");
}

function cerrarCheckout() {
    checkoutModal.classList.remove("active");
    checkoutOverlay.classList.remove("active");
}

function renderizarResumenCheckout() {
    const summaryItems = document.getElementById("checkoutSummaryItems");
    const summaryTotal = document.getElementById("checkoutSummaryTotal");

    if (!summaryItems || !summaryTotal) {
        return;
    }

    summaryItems.innerHTML = "";

    let total = 0;

    carrito.forEach((item) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const div = document.createElement("div");
        div.classList.add("checkout-summary-item");

        div.innerHTML = `
            <span>${item.producto} x ${item.cantidad}</span>
            <strong>S/${subtotal}</strong>
        `;

        summaryItems.appendChild(div);
    });

    summaryTotal.textContent = total;
}

function generarNroPedido() {
    const ahora = new Date();

    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, "0");
    const dd = String(ahora.getDate()).padStart(2, "0");
    const hh = String(ahora.getHours()).padStart(2, "0");
    const mi = String(ahora.getMinutes()).padStart(2, "0");
    const ss = String(ahora.getSeconds()).padStart(2, "0");

    return `DC-${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

async function registrarPedidoGoogleSheets(payload) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PEGA_AQUI")) {
        console.warn("No se configuró la URL de Google Apps Script.");
        return;
    }

    await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    });
}

cartToggle.addEventListener("click", abrirCarrito);
closeCart.addEventListener("click", cerrarCarrito);
cartOverlay.addEventListener("click", cerrarCarrito);

checkoutBtn.addEventListener("click", abrirCheckout);
closeCheckout.addEventListener("click", cerrarCheckout);
checkoutOverlay.addEventListener("click", cerrarCheckout);

if (checkoutModalidad && direccionGroup) {
    direccionGroup.classList.add("hidden");

    checkoutModalidad.addEventListener("change", () => {
        const direccionInput = document.getElementById("checkoutDireccion");

        if (checkoutModalidad.value === "Delivery") {
            direccionGroup.classList.remove("hidden");
        } else {
            direccionGroup.classList.add("hidden");

            if (direccionInput) {
                direccionInput.value = "";
            }
        }
    });
}

checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("checkoutNombre").value.trim();
    const celular = document.getElementById("checkoutCelular").value.trim();
    const modalidad = document.getElementById("checkoutModalidad").value;
    const direccion = document.getElementById("checkoutDireccion").value.trim();
    const fecha = document.getElementById("checkoutFecha").value;
    const observaciones = document.getElementById("checkoutObservaciones").value.trim();
    const medioPago = document.getElementById("checkoutPago").value;
 
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

    const nroPedido = generarNroPedido();

    const payload = {
        nroPedido: nroPedido,
        cliente: nombre,
        celular: celular,
        modalidad: modalidad,
        direccion: direccion || "No indicado",
        fechaSolicitada: fecha || "No indicada",
        medioPago: medioPago || "No indicado",
        observaciones: observaciones || "Sin observaciones",
        total: total,
        items: carrito.map((item) => {
            return {
                producto: item.producto,
                precio: item.precio,
                cantidad: item.cantidad
            };
        })
    };

    const detallePedido = carrito.map((item) => {
        return `- ${item.producto} x ${item.cantidad} = S/${item.precio * item.cantidad}`;
    }).join("\n");

    const mensaje = `
Hola D´Caroline, quiero realizar un pedido:

Nro Pedido: ${nroPedido}

Cliente: ${nombre}
Celular: ${celular}
Modalidad: ${modalidad}
Dirección/Referencia: ${direccion || "No indicado"}
Fecha solicitada: ${fecha || "No indicada"}
Medio de pago preferido: ${medioPago || "No indicado"}

Pedido:
${detallePedido}

Total: S/${total}

Observaciones:
${observaciones || "Sin observaciones"}

Nota: Entiendo que el costo de delivery se confirma según distrito.
`;

    const botonSubmit = checkoutForm.querySelector("button[type='submit']");
    botonSubmit.disabled = true;
    botonSubmit.textContent = "Registrando pedido...";

    try {
        await registrarPedidoGoogleSheets(payload);

        botonSubmit.textContent = "Abriendo WhatsApp...";

        const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

        window.open(urlWhatsApp, "_blank");

        carrito = [];
        renderizarCarrito();
        checkoutForm.reset();
        cerrarCheckout();
        cerrarCarrito();

    } catch (error) {
        console.error(error);

        alert("No se pudo registrar el pedido. Inténtalo nuevamente o escríbenos por WhatsApp.");

    } finally {
        botonSubmit.disabled = false;
        botonSubmit.textContent = "Confirmar pedido por WhatsApp";
    }
});