//preguntas publicas y mensajes privados pendientes de respuesta

import { getAllItems } from "../data/catalog";
import { getComments } from "./comments";

export const LIMIT_HOURS = 48;

const MESSAGES_KEY = "compraya_mensajes";

export const hoursSince = (iso, now = new Date()) => Math.floor((now - new Date(iso)) / 3600000);

export const isOverdue = (iso, now) => hoursSince(iso, now) >= LIMIT_HOURS;

//preguntas comentarios de clientes en publicaciones con vendedor

export function getQuestions() {
    
    return getAllItems()
    
        .filter((item) => item.sellerRut)
        
        .flatMap((item) =>
        
            getComments(item.id)
        
                .filter((c) => c.rut && c.rut !== item.sellerRut)
            
                .map((c) => ({ ...c, itemId: item.id, itemName: item.name, sellerRut: item.sellerRut }))
        
        );

}

//respuesta publica del vendedor

export function answerComment(itemId, commentId, text) {

    const list = getComments(itemId).map((c) =>

        c.id === commentId ? { ...c, reply: { text: text.trim(), date: new Date().toISOString() } } : c

    );

    try {

        localStorage.setItem(`compraya_comentarios_${itemId}`, JSON.stringify(list));

    } catch {}

    return list;

}

export function getMessages() {

    try {

        const parsed = JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? "[]");

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

export function removeMessage(message) {

    const next = getMessages().filter(

        (m) => !(m.from === message.from && m.to === message.to && m.date === message.date)

    );

    try {

        localStorage.setItem(MESSAGES_KEY, JSON.stringify(next));

    } catch {}

}

//conversaciones donde el ultimo mensaje va hacia un vendedor y no tiene replica
//devuelve el primer mensaje sin responder de cada una

export function getPendingChats(users = []) {

    const isSeller = (rut) => {

        const user = users.find((u) => u.rut === rut);

        return Boolean(user) && (user.roles ?? [user.role]).includes("vendedor");

    };

    const chats = new Map();

    getMessages().forEach((m) => {

        const key = [m.from, m.to].sort().join("|");

        const pending = chats.get(key);

        //si responde la otra persona lo anterior queda contestado

        if (!pending || pending.from !== m.from) chats.set(key, m);
    
    });

    return [...chats.values()].filter((m) => isSeller(m.to));

}