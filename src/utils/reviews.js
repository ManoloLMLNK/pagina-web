const key = (itemId) => `compraya_resenas_${itemId}`;

function sortNewestFirst(list) {

    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

}

export function getReviews(itemId) {

    try {

        const raw = localStorage.getItem(key(itemId));

        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? sortNewestFirst(parsed) : [];

    } catch {

        return [];

    }

}

function save(itemId, list) {

    try {

        localStorage.setItem(key(itemId), JSON.stringify(list));

    } catch {}

    return sortNewestFirst(list);

}

//promedio y cantidad reales calculados cn las reseñas guardadas

export function getReviewStats(itemId) {

    const list = getReviews(itemId);

    if (list.length === 0) return { average: 0, count: 0 };

    const sum = list.reduce((total, r) => total + r.stars, 0);

    return { average: Math.round((sum / list.length) * 10) / 10, count: list.length };

}

//una reseña por persona en cada publicacion si ya tenia una se reemplaza
//devuelve la lista actualizada

export function saveReview(itemId, { rut, author, stars, text }) {

    const list = getReviews(itemId);

    const existing = list.find((r) => r.rut === rut);

    if (existing) {

        return save(

            itemId,

            list.map((r) =>

                r.id === existing.id ? { ...r, stars, text, edited: true, editedAt: new Date().toISOString() } : r

            )

        );

    }

    const review = {

        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        rut,
        author,
        stars,
        text,
        date: new Date().toISOString(),

    };

    return save(itemId, [...list, review]);

}

export function removeReview(itemId, reviewId) {

    return save(itemId, getReviews(itemId).filter((r) => r.id !== reviewId));

}