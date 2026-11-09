const key = (rut) => `compraya_deseados_${rut}`;

export function getWishlist(rut) {

    try {

        const raw = localStorage.getItem(key(rut));

        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

function saveWishlist(rut, ids) {

    try {

        localStorage.setItem(key(rut), JSON.stringify(ids));

    } catch {}

    return ids;

}

export function isInWishlist(rut, id) {

    return getWishlist(rut).includes(id);

}

//agrega el producto si no estaba y lo quita si ya estaba

export function toggleWishlist(rut, id) {

    const current = getWishlist(rut);

    return saveWishlist(rut, current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

}

export function removeFromWishlist(rut, id) {

    return saveWishlist(rut, getWishlist(rut).filter((x) => x !== id));

}