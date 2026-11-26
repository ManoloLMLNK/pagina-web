//cotizaciones se guardan en el navegador igual q lo demas

import { getAllItems } from "../data/catalog";

const KEY = "compraya_cotizaciones";

export const QUOTE_DAYS = 15;

const IVA_RATE = 0.19;

const DELETE_DAYS = 45;

const DAY = 24 * 60 * 60 * 1000;

const ageInDays = (quote) => (Date.now() - new Date(quote.createdAt).getTime()) / DAY;

function read() {

    try {

        const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

function load() {

    const stored = read();

    const prices = new Map(getAllItems().map((it) => [it.id, it.price]));

    const list = stored

        .filter((q) => q.estado === "Aceptada por el cliente" || ageInDays(q) < DELETE_DAYS)

        .map((q) => {

            const expiresAt = new Date(new Date(q.createdAt).getTime() + QUOTE_DAYS * DAY).toISOString();

            if (q.estado === "Aceptada por el cliente") return { ...q, expiresAt };

            const week = Math.floor((ageInDays(q) - QUOTE_DAYS) / 7);

            if (week <= (q.adjustedWeek ?? 0)) return { ...q, expiresAt };

            const items = q.items.map((it) => ({ ...it, price: prices.get(it.id) ?? it.price }));

            return { ...q, expiresAt, items, adjustedWeek: week };

        });

    if (JSON.stringify(list) !== JSON.stringify(stored)) save(list);

    return list;

}

function save(list) {

    try {

        localStorage.setItem(KEY, JSON.stringify(list));

        return true;

    } catch {

        return false;

    }

}

//si no se acepta dentro de 15 dias sufre un patapummmm

export function getStatus(quote) {

    if (quote.estado !== "Aceptada por el cliente" && ageInDays(quote) > QUOTE_DAYS) return "Expirada";

    return quote.estado;

}

export function getTotals(items) {

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const iva = Math.round(subtotal * IVA_RATE);

    return { subtotal, iva, total: subtotal + iva };

}

//las mas nuevas primero

export const getClientQuotes = (rut) => load().filter((q) => q.clientRut === rut).reverse();

export const getSellerQuotes = (rut) => load().filter((q) => q.sellerRut === rut).reverse();

//crea una cotizacion por cada vendedor de los productos elegidos

export function requestQuotes(clientRut, selected, message) {

    const sellers = [...new Set(selected.map((it) => it.sellerRut))];

    const now = new Date();

    const created = sellers.map((sellerRut, i) => ({

        id: `${now.getTime()}${i}`,
        clientRut,
        sellerRut,
        message,
        estado: "Solicitada",
        createdAt: now.toISOString(),
        items: selected

            .filter((it) => it.sellerRut === sellerRut)

            .map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),

    }));

    return save([...load(), ...created]) ? created.length : 0;

}

function change(id, canChange, changes) {

    const list = load();

    const quote = list.find((q) => q.id === id);

    if (!quote || !canChange(quote)) return false;

    return save(list.map((q) => (q.id === id ? { ...q, ...changes(q) } : q)));

}

//el vendedor responde cn sus precios

export function answerQuote(id, sellerRut, prices, answer) {

    return change(

        id,
        (q) => q.sellerRut === sellerRut && getStatus(q) === "Solicitada",
        (q) => {

            return {

                estado: "Respondida",
                answer,
                answeredAt: new Date().toISOString(),
                items: q.items.map((it) => ({ ...it, price: Number(prices[it.id] ?? it.price) })),

            };

        }

    );

}

//el cliente acepta solo si no ha vencido

export function acceptQuote(id, clientRut) {

    return change(

        id,
        (q) => q.clientRut === clientRut && getStatus(q) === "Respondida",
        () => ({ estado: "Aceptada por el cliente", acceptedAt: new Date().toISOString() })

    );

}