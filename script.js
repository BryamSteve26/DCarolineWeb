const WHATSAPP_NUMBER = "51947980409";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7APNOAWHJuUxZJMhE5kuAavykBQu0cq9R97Q38si34d8aspB_5eh6hlFstuPtA8XWlA/exec";

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

const cartPromoMessage = document.getElementById("cartPromoMessage");
const cartProgressText = document.getElementById("cartProgressText");
const cartProgressBar = document.getElementById("cartProgressBar");
const cartSavingRow = document.getElementById("cartSavingRow");
const cartSavingAmount = document.getElementById("cartSavingAmount");
const continueShoppingBtn = document.getElementById("continueShoppingBtn");

const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutOverlay = document.getElementById("checkoutOverlay");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
const checkoutForm = document.getElementById("checkoutForm");

const checkoutModalidad = document.getElementById("checkoutModalidad");
const direccionGroup = document.getElementById("direccionGroup");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

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

function calcularResumenPedido() {
    const cantidadTotal = carrito.reduce((sum, item) => {
        return sum + item.cantidad;
    }, 0);

    const subtotalRegular = carrito.reduce((sum, item) => {
        return sum + item.precio * item.cantidad;
    }, 0);

    const todosPrecio15 = carrito.every((item) => item.precio === 15);

    if (!todosPrecio15 || cantidadTotal === 0) {
        return {
            cantidadTotal,
            subtotalRegular,
            totalFinal: subtotalRegular,
            ahorro: 0
        };
    }

    const preciosCombo = [
        { cantidad: 1, precio: 15 },
        { cantidad: 3, precio: 42 },
        { cantidad: 4, precio: 55 }
    ];

    const dp = Array(cantidadTotal + 1).fill(Infinity);
    dp[0] = 0;

    for (let i = 1; i <= cantidadTotal; i++) {
        preciosCombo.forEach((combo) => {
            if (i >= combo.cantidad) {
                dp[i] = Math.min(dp[i], dp[i - combo.cantidad] + combo.precio);
            }
        });
    }

    const totalFinal = dp[cantidadTotal];
    const ahorro = subtotalRegular - totalFinal;

    return {
        cantidadTotal,
        subtotalRegular,
        totalFinal,
        ahorro
    };
}

function renderizarCarrito() {
    cartItems.innerHTML = "";

    const resumen = calcularResumenPedido();

    if (carrito.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart premium-empty-cart">
                <div class="empty-icon">🍰</div>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega tus postres favoritos para empezar tu pedido.</p>
                <a href="#carta" class="empty-cart-btn" onclick="cerrarCarrito()">
                    Ver carta
                </a>
            </div>
        `;
    }

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <div class="cart-item-top">
                <div>
                    <h4>${item.producto}</h4>
                    <div class="cart-item-price">
                        S/${item.precio} x ${item.cantidad}
                    </div>
                    <div class="cart-item-subtotal">
                        Subtotal S/${subtotal}
                    </div>
                </div>

                <button class="remove-item" onclick="eliminarProducto(${index})">
                    ×
                </button>
            </div>

            <div class="cart-item-bottom">
                <div class="qty-controls">
                    <button onclick="disminuirCantidad(${index})">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="aumentarCantidad(${index})">+</button>
                </div>
            </div>
        `;

        cartItems.appendChild(div);
    });

    cartCount.textContent = resumen.cantidadTotal;
    cartFloatTotal.textContent = resumen.totalFinal;
    cartTotal.textContent = resumen.totalFinal;

    if (resumen.ahorro > 0) {
        cartSavingRow.classList.remove("hidden");
        cartSavingAmount.textContent = resumen.ahorro;
    } else {
        cartSavingRow.classList.add("hidden");
        cartSavingAmount.textContent = "0";
    }

    actualizarMensajePromo(resumen);
    actualizarBarraProgreso(resumen);
}

function actualizarMensajePromo(resumen) {
    if (!cartPromoMessage) {
        return;
    }

    cartPromoMessage.classList.remove("success", "highlight");

    if (resumen.cantidadTotal === 0) {
        cartPromoMessage.textContent = "Agrega productos y aprovecha nuestras promociones.";
        return;
    }

    if (resumen.cantidadTotal === 1) {
        cartPromoMessage.textContent = "Agrega 2 postres más y activa la promo de 3 por S/42 🎉";
        cartPromoMessage.classList.add("highlight");
        return;
    }

    if (resumen.cantidadTotal === 2) {
        cartPromoMessage.textContent = "Agrega 1 postre más y activa la promo de 3 por S/42 💕";
        cartPromoMessage.classList.add("highlight");
        return;
    }

    if (resumen.cantidadTotal === 3) {
        cartPromoMessage.textContent = "¡Promo aplicada! 3 postres por S/42 🎉";
        cartPromoMessage.classList.add("success");
        return;
    }

    if (resumen.cantidadTotal === 4) {
        cartPromoMessage.textContent = "¡Promo familiar aplicada! 4 postres por S/55 🎁";
        cartPromoMessage.classList.add("success");
        return;
    }

    cartPromoMessage.textContent = `Promo aplicada. Estás ahorrando S/${resumen.ahorro} en tu pedido 💕`;
    cartPromoMessage.classList.add("success");
}

function actualizarBarraProgreso(resumen) {
    if (!cartProgressText || !cartProgressBar) {
        return;
    }

    const cantidad = resumen.cantidadTotal;

    if (cantidad === 0) {
        cartProgressText.textContent = "Agrega tus postres favoritos.";
        cartProgressBar.style.width = "0%";
        return;
    }

    if (cantidad === 1) {
        cartProgressText.textContent = "Vas bien. Agrega 2 más para activar la promo.";
        cartProgressBar.style.width = "33%";
        return;
    }

    if (cantidad === 2) {
        cartProgressText.textContent = "Te falta 1 postre para la promo de 3 por S/42.";
        cartProgressBar.style.width = "66%";
        return;
    }

    if (cantidad === 3) {
        cartProgressText.textContent = "Promo de 3 por S/42 activada.";
        cartProgressBar.style.width = "80%";
        return;
    }

    cartProgressText.textContent = "Promo familiar activada. Tu pedido está listo para confirmar.";
    cartProgressBar.style.width = "100%";
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
    document.body.classList.add("no-scroll");
}

function cerrarCarrito() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");

    if (!checkoutModal.classList.contains("active")) {
        document.body.classList.remove("no-scroll");
    }
}

function abrirCheckout() {
    if (carrito.length === 0) {
        alert("Agrega al menos un producto para continuar.");
        return;
    }

    renderizarResumenCheckout();

    checkoutModal.classList.add("active");
    checkoutOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
}

function cerrarCheckout() {
    checkoutModal.classList.remove("active");
    checkoutOverlay.classList.remove("active");

    if (!cartPanel.classList.contains("active")) {
        document.body.classList.remove("no-scroll");
    }
}

function renderizarResumenCheckout() {
    const summaryItems = document.getElementById("checkoutSummaryItems");
    const summaryTotal = document.getElementById("checkoutSummaryTotal");

    if (!summaryItems || !summaryTotal) {
        return;
    }

    const resumen = calcularResumenPedido();

    summaryItems.innerHTML = "";

    carrito.forEach((item) => {
        const subtotal = item.precio * item.cantidad;

        const div = document.createElement("div");
        div.classList.add("checkout-summary-item");

        div.innerHTML = `
            <span>${item.producto} x ${item.cantidad}</span>
            <strong>S/${subtotal}</strong>
        `;

        summaryItems.appendChild(div);
    });

    if (resumen.ahorro > 0) {
        const descuento = document.createElement("div");
        descuento.classList.add("checkout-summary-item", "checkout-discount-row");

        descuento.innerHTML = `
            <span>Descuento por promoción</span>
            <strong>-S/${resumen.ahorro}</strong>
        `;

        summaryItems.appendChild(descuento);
    }

    summaryTotal.textContent = resumen.totalFinal;
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

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });
}

if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener("click", () => {
        cerrarCarrito();

        const carta = document.getElementById("carta");

        if (carta) {
            carta.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}

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
    const medioPago = document.getElementById("checkoutPago").value;
    const observaciones = document.getElementById("checkoutObservaciones").value.trim();

    if (!nombre || !celular || !modalidad) {
        alert("Completa nombre, celular y modalidad.");
        return;
    }

    if (modalidad === "Delivery" && !direccion) {
        alert("Por favor indica dirección o referencia para delivery.");
        return;
    }

    const resumen = calcularResumenPedido();
    const total = resumen.totalFinal;
    const nroPedido = generarNroPedido();

    const payload = {
        nroPedido: nroPedido,
        cliente: nombre,
        celular: celular,
        modalidad: modalidad,
        direccion: direccion || "No indicado",
        fechaSolicitada: fecha || "No indicada",
        medioPago: medioPago || "No indicado",
        subtotalRegular: resumen.subtotalRegular,
        ahorroPromo: resumen.ahorro,
        total: total,
        observaciones: observaciones || "Sin observaciones",
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

    const lineaPromo = resumen.ahorro > 0
        ? `\nDescuento por promoción: -S/${resumen.ahorro}`
        : "";

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
${lineaPromo}

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

renderizarCarrito();