const key = (rut) => `compraya_pedidos_${rut}`;

export function getOrders(rut) {

    try {

        const raw = localStorage.getItem(key(rut));

        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

//el pedido mas nuevo queda primero

export function saveOrder(rut, order) {

    try {

        localStorage.setItem(key(rut), JSON.stringify([order, ...getOrders(rut)]));

    } catch {}

}