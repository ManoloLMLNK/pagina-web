const key = (itemId) => `compraya_comentarios_${itemId}`;

//comentarios de ejemplo para q cada publicacion parta con 5
//para los productos nuevos q no esten aqui la lista parte vacia

const SEED_COMMENTS = {

    p1: [

        { id: "seed-p1-1", author: "Tonoto 1", rut: null, date: "2026-10-28T15:20:00.000Z", text: "Llegaron rápido y el estuche de carga es muy bonito. La pantalla LED se ve genial." },
        { id: "seed-p1-2", author: "Tonoto 2", rut: null, date: "2026-10-22T18:05:00.000Z", text: "El sonido es bueno para el precio y la batería me dura toda la tarde." },
        { id: "seed-p1-3", author: "Tonoto 3", rut: null, date: "2026-10-15T12:40:00.000Z", text: "Se conectan al celular en segundos y son cómodos para usarlos un buen rato." },
        { id: "seed-p1-4", author: "Tonoto 4", rut: null, date: "2026-10-09T21:10:00.000Z", text: "Los compré de regalo y quedaron felices. Lo único, el estuche se ensucia fácil." },
        { id: "seed-p1-5", author: "Tonoto 5", rut: null, date: "2026-10-02T10:30:00.000Z", text: "Buena relación precio calidad, los recomiendo." },

    ],

    s1: [

        { id: "seed-s1-1", author: "Tonoto 1", rut: null, date: "2026-10-30T14:00:00.000Z", text: "Muy puntuales y ordenados, dejaron la casa impecable." },
        { id: "seed-s1-2", author: "Tonoto 2", rut: null, date: "2026-10-24T16:45:00.000Z", text: "Excelente servicio, limpiaron hasta los lugares difíciles de alcanzar." },
        { id: "seed-s1-3", author: "Tonoto 3", rut: null, date: "2026-10-17T11:15:00.000Z", text: "Fueron amables y rápidos. Volvería a contratarlos sin dudar." },
        { id: "seed-s1-4", author: "Tonoto 4", rut: null, date: "2026-10-11T19:30:00.000Z", text: "Buen trabajo, aunque tardaron un poco más de lo esperado." },
        { id: "seed-s1-5", author: "Tonoto 5", rut: null, date: "2026-10-04T09:50:00.000Z", text: "Muy recomendable, dejaron todo limpio y con buen olor." },

    ],

};

function sortNewestFirst(list) {

    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

}

//si todavia no hay nada guardado para la publicacion se usan los de ejemplo

export function getComments(itemId) {

    try {

        const raw = localStorage.getItem(key(itemId));

        if (raw) {

            const parsed = JSON.parse(raw);

            if (Array.isArray(parsed)) return sortNewestFirst(parsed);

        }

    } catch {}

    return sortNewestFirst(SEED_COMMENTS[itemId] ?? []);

}

function save(itemId, list) {

    try {

        localStorage.setItem(key(itemId), JSON.stringify(list));

    } catch {}

    return sortNewestFirst(list);

}

//devuelven la lista actualizada

export function addComment(itemId, { author, rut, text }) {

    const newComment = {

        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author,
        rut,
        text,
        date: new Date().toISOString(),

    };

    return save(itemId, [...getComments(itemId), newComment]);

}

export function removeComment(itemId, commentId) {

    return save(itemId, getComments(itemId).filter((c) => c.id !== commentId));

}

export function updateComment(itemId, commentId, rut, text) {

    const list = getComments(itemId).map((c) =>

        c.id === commentId && c.rut && c.rut === rut

            ? { ...c, text, edited: true, editedAt: new Date().toISOString() }

            : c

    );

    return save(itemId, list);

}