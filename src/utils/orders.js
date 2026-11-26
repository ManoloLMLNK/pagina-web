import { increaseStock } from "../data/catalog";

const PREFIX = "compraya_pedidos_";

const key = (rut) => `${PREFIX}${rut}`;

//los estados por los q pasa un pedido en orden

export const ORDER_STATES = ["Recibido", "En preparación", "Enviado", "Entregado"];

export const CANCELLED = "Cancelado";

//estado de la transaccion pendiente completada o cancelada

export const TRANSACTION_STATES = ["Pendiente", "Completada", "Cancelada"];

export function transactionStatus(order) {

    if (order.estado === CANCELLED) return "Cancelada";

    return order.estado === "Entregado" ? "Completada" : "Pendiente";

}

//solo se puede cancelar antes de que se envie

export const canCancel = (order) => ["Recibido", "En preparación"].includes(order.estado ?? "Recibido");

//solo se puede pedir devolucion de un pedido entregado y una sola vez

export const canRequestReturn = (order) => order.estado === "Entregado" && !order.devolucion;

//plata devuelta al cliente

export const refundedAmount = (order) => order.reembolso?.monto ?? 0;

export function getOrders(rut) {

    try {

        const raw = localStorage.getItem(key(rut));

        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

function saveOrders(rut, list) {

    try {

        localStorage.setItem(key(rut), JSON.stringify(list));

        return true;

    } catch {

        return false;

    }

}

//el pedido mas nuevo queda primero y parte cn su historial de estados

export function saveOrder(rut, order) {

    const estado = order.estado ?? ORDER_STATES[0];

    const full = {

        ...order,

        estado,

        historial: order.historial ?? [{ estado, fecha: new Date().toISOString() }],

    };

    saveOrders(rut, [full, ...getOrders(rut)]);

}

//una compra cancelada no cuenta como compra

export function hasPurchased(rut, itemId) {

    if (!rut || !itemId) return false;

    return getOrders(rut).some(

        (order) => order.estado !== CANCELLED && (order.items ?? []).some((item) => String(item.id) === String(itemId))

    );

}

//los pedidos de todas las cuentas para las analiticas y para el historial de ventas

export function getAllOrders() {

    const all = [];

    try {

        for (let i = 0; i < localStorage.length; i++) {

            const storageKey = localStorage.key(i);

            if (storageKey && storageKey.startsWith(PREFIX)) {

                const buyerRut = storageKey.slice(PREFIX.length);

                getOrders(buyerRut).forEach((order) => all.push({ ...order, buyerRut }));

            }

        }

    } catch {}

    return all;

}

//el vendedor de un pedido

export function orderSellerRut(order) {

    return order.sellerRut ?? order.items?.[0]?.sellerRut ?? "";

}

//las ventas de un vendedor la mas nueva primero

export function getSalesBySeller(sellerRut) {

    return getAllOrders()

        .filter((order) => orderSellerRut(order) === sellerRut)

        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));

}

//busca el pedido revisa si se puede cambiar y lo guarda

function changeOrder(buyerRut, orderId, change) {

    const list = getOrders(buyerRut);

    const order = list.find((o) => String(o.id) === String(orderId));

    if (!order) return { ok: false, error: "No se encontró el pedido." };

    const result = change(order);

    if (result.error) return { ok: false, error: result.error };

    const next = list.map((o) => (o === order ? result.order : o));

    return saveOrders(buyerRut, next) ? { ok: true } : { ok: false, error: "No se pudo guardar el cambio." };

}

const withHistory = (order, estado) => [

    ...(order.historial ?? [{ estado: order.estado, fecha: order.createdAt }]),

    { estado, fecha: new Date().toISOString() },

];

//cambia el estado de un pedido del comprador y deja el cambio en su historial

export function updateOrderStatus(buyerRut, orderId, estado) {

    if (!ORDER_STATES.includes(estado)) return { ok: false, error: "Estado no válido." };

    return changeOrder(buyerRut, orderId, (order) => {

        if (order.estado === CANCELLED) return { error: "El pedido está cancelado." };

        if (estado === order.estado) return { order };

        if (ORDER_STATES.indexOf(estado) < ORDER_STATES.indexOf(order.estado)) {

            return { error: "Un pedido no puede volver a un estado anterior." };

        }

        return { order: { ...order, estado, historial: withHistory(order, estado) } };

    });

}

//cancelar devuelve todo lo pagado y repone el stock

export function cancelOrder(buyerRut, orderId, motivo) {

    let items = [];

    const result = changeOrder(buyerRut, orderId, (order) => {

        if (!canCancel(order)) return { error: "Este pedido ya no se puede cancelar." };

        if (!motivo.trim()) return { error: "Escribe el motivo." };

        items = order.items ?? [];

        const fecha = new Date().toISOString();

        return {

            order: {

                ...order,

                estado: CANCELLED,

                historial: withHistory(order, CANCELLED),

                cancelacion: { motivo: motivo.trim(), fecha },

                reembolso: { monto: order.total ?? 0, fecha },

            },

        };

    });

    if (result.ok) increaseStock(items);

    return result;

}

//la devolucion es del pedido completo

export function requestReturn(buyerRut, orderId, motivo) {

    return changeOrder(buyerRut, orderId, (order) => {

        if (!canRequestReturn(order)) return { error: "No se puede pedir devolución de este pedido." };

        if (!motivo.trim()) return { error: "Escribe el motivo." };

        return {

            order: { ...order, devolucion: { estado: "Solicitada", motivo: motivo.trim(), fecha: new Date().toISOString() } },

        };

    });

}

//el vendedor aprueba o rechaza al aprobar se reembolsa y se repone el stock

export function resolveReturn(buyerRut, orderId, approve, respuesta = "") {

    let items = [];

    const result = changeOrder(buyerRut, orderId, (order) => {

        if (order.devolucion?.estado !== "Solicitada") return { error: "Esta devolución ya fue resuelta." };

        if (!approve && !respuesta.trim()) return { error: "Explica por qué la rechazas." };

        const fecha = new Date().toISOString();

        if (approve) items = order.items ?? [];

        return {

            order: {

                ...order,

                devolucion: {

                    ...order.devolucion,

                    estado: approve ? "Aprobada" : "Rechazada",

                    respuesta: respuesta.trim(),

                    fechaRespuesta: fecha,

                },

                ...(approve ? { reembolso: { monto: (order.total ?? 0) - (order.envio ?? 0), fecha } } : {}),

            },

        };

    });

    if (result.ok && approve) increaseStock(items);

    return result;

}