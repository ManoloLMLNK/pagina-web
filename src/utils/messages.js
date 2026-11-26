//mensajeria interna se guarda en el navegador igual q lo demas
//hay una sola conversacion entre dos personas sirve antes y despues de la venta

const KEY = "compraya_mensajes";

function load() {

    try {

        const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

const isBetween = (m, a, b) => (m.from === a && m.to === b) || (m.from === b && m.to === a);

//los mensajes entre dos personas del mas antiguo al mas nuevo

export const getConversation = (rut, other) => load().filter((m) => isBetween(m, rut, other));

//las personas cn las q ya hay mensajes la mas reciente primero

export function getContacts(rut) {

    const others = load()

        .filter((m) => m.from === rut || m.to === rut)

        .map((m) => (m.from === rut ? m.to : m.from))

        .reverse();

    return [...new Set(others)];

}

export function sendMessage(from, to, text) {

    const clean = text.trim();

    if (!from || !to || from === to || !clean) return false;

    try {

        localStorage.setItem(KEY, JSON.stringify([...load(), { from, to, text: clean, date: new Date().toISOString() }]));

        return true;

    } catch {

        return false;

    }

}