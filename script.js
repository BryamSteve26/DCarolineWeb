const carrito = [];

const botones = document.querySelectorAll(".add-cart");
const listaCarrito = document.getElementById("carrito-lista");
const totalCarrito = document.getElementById("carrito-total");
const enviarPedido = document.getElementById("enviar-pedido");

botones.forEach((boton) => {
    boton.addEventListener("click", () => {
        const producto = boton.dataset.producto;
        const precio = Number(boton.dataset.precio);

        const itemExistente = carrito.find((item) => item.producto === producto);

        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            carrito.push({
                producto,
                precio,
                cantidad: 1
            });
        }

        renderCarrito();
    });
});

function renderCarrito() {
    listaCarrito.innerHTML = "";

    let total = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const div = document.createElement("div");
        div.classList.add("item-carrito");

        div.innerHTML = `
            <span>
                ${item.producto} x ${item.cantidad}
                <br>
                <strong>S/${subtotal}</strong>
            </span>

            <button onclick="eliminarItem(${index})">×</button>
        `;

        listaCarrito.appendChild(div);
    });

    totalCarrito.textContent = total;
}

function eliminarItem(index) {
    carrito.splice(index, 1);
    renderCarrito();
}

enviarPedido.addEventListener("click", () => {
    const cliente = document.getElementById("cliente").value.trim();
    const celular = document.getElementById("celular").value.trim();
    const modalidad = document.getElementById("modalidad").value;
    const direccion = document.getElementById("direccion").value.trim();
    const observaciones = document.getElementById("observaciones").value.trim();

    if (carrito.length === 0) {
        alert("Agrega al menos un producto al pedido.");
        return;
    }

    if (!cliente || !celular || !modalidad) {
        alert("Completa nombre, celular y modalidad de entrega.");
        return;
    }

    const total = carrito.reduce((sum, item) => {
        return sum + item.precio * item.cantidad;
    }, 0);

    const detalle = carrito.map((item) => {
        return `- ${item.producto} x ${item.cantidad} = S/${item.precio * item.cantidad}`;
    }).join("\n");

    const mensaje = `
Hola D´Caroline, quiero realizar un pedido:

Cliente: ${cliente}
Celular: ${celular}
Modalidad: ${modalidad}
Dirección/Referencia: ${direccion || "No indicado"}

Pedido:
${detalle}

Total: S/${total}

Observaciones:
${observaciones || "Sin observaciones"}
`;

    const urlWhatsApp = `https://wa.me/51947980409?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsApp, "_blank");
});