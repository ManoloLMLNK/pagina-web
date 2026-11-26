//despacho tarifas por region de cada vendedor y datos de seguimiento

import { getRegion } from "../data/chile";

const RATES_KEY = "compraya_tarifas_envio";

const ORDERS_PREFIX = "compraya_pedidos_";

//valores de ejemplo mientras el vendedor no defina los suyos

const defaultCost = (regionId) => (regionId === "los-lagos" ? 3000 : regionId === "metropolitana" ? 5000 : 7000);

function read(key, fallback) {

    try {

        return JSON.parse(localStorage.getItem(key)) ?? fallback;

    } catch {

        return fallback;

    }

}

function write(key, value) {

    try {

        localStorage.setItem(key, JSON.stringify(value));

        return true;

    } catch {

        return false;

    }

}

export function shippingCost(sellerRut, regionId) {

    const own = read(RATES_KEY, {})[sellerRut]?.[regionId];

    return typeof own === "number" ? own : defaultCost(regionId);

}

export function saveRates(sellerRut, rates) {

    const clean = Object.fromEntries(Object.entries(rates).map(([id, v]) => [id, Math.max(0, Math.round(Number(v) || 0))]));

    return write(RATES_KEY, { ...read(RATES_KEY, {}), [sellerRut]: clean });

}

//los servicios no se despachan

export const requiresShipping = (items) => items.some((it) => it.tipo === "productos");

export const addressLabel = (a) =>

    typeof a === "string" ? a : [a.calle, a.comuna, getRegion(a.regionId)?.nombre].filter(Boolean).join(", ");

//empresa de transporte y numero de seguimiento de un pedido

export function saveTracking(buyerRut, orderId, transportista, seguimiento) {

    const key = ORDERS_PREFIX + buyerRut;

    return write(key, read(key, []).map((o) => (String(o.id) === String(orderId) ? { ...o, transportista, seguimiento } : o)));

}