import monitorIcon from "../assets/icons/monitor.png";
import casaIcon from "../assets/icons/casa.png";

export const TIPOS = {

    productos: {label: "Productos", itemLabel: "Producto"},

    servicios: {label: "Servicios", itemLabel: "Servicio"},

};

export const CATEGORIES = {

    productos: [

        {

            id: "tecnologia",

            label: "Tecnología",

            icon: monitorIcon,

            subcategories: [

                {id: "audio-musica", label: "Audio y Música", icon: "AUDIO"},
                {id: "juegos", label: "Juegos", icon: "GAME"},

            ],

        },

        {id: "hogar", label: "Hogar", icon: casaIcon, subcategories: []},

    ],

    servicios: [

        {id: "tecnologia", label: "Tecnología", icon: monitorIcon, subcategories: []},

        {

            id: "hogar",

            label: "Hogar",

            icon: casaIcon,

            subcategories: [

                {id: "limpieza", label: "Limpieza", icon: "ASEO"},
                {id: "cerrajeria", label: "Cerrajería", icon: "LLAVE"},

            ],

        },

    ],

};

export const ITEMS = [

    {

        id: "p1",

        displayId: 1,

        tipo: "productos",

        categoria: "tecnologia",

        subcategoria: "audio-musica",

        name: "Audífonos Bluetooth ",

        title: "AUDÍFONOS HOT WHEEL IN EAR LED DISPLAY BLUETOOTH",

        price: 24990,

        rating: 4.8,
        
        reviews: 120,

        images: [],

        description: "Audífonos in ear Bluetooth con estuche de carga y pantalla LED.",

    },

    {

        id: "s1",

        displayId: 1,

        tipo: "servicios",

        categoria: "hogar",

        subcategoria: "limpieza",

        name: "Limpieza de Casa",

        title: "LIMPIEZA DE CASA",

        price: 56990,

        rating: 4.5,

        reviews: 34,

        images: [],

        description: "Servicio de limpieza para casas y departamentos",

    },

];

function normalize(text) {

    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

}

export function getCategories(tipo) {

    return CATEGORIES[tipo] ?? [];

}

export function findCategory(tipo, categoriaId) {

    return getCategories(tipo).find((c) => c.id === categoriaId);

}

export function findSubcategory(tipo, categoriaId, subcategoriaId) {

    const category = findCategory(tipo, categoriaId);

    return category?.subcategories.find((s) => s.id === subcategoriaId);

}

export function getItems({tipo, categoria, subcategoria, search = ""}) {

    const term = normalize(search.trim());

    return getAllItems().filter (

        (item) =>

            item.tipo === tipo &&

            (!categoria || item.categoria === categoria) &&

            (!subcategoria || item.subcategoria === subcategoria) &&

            (!term || normalize(item.name).includes(term))
        
    );

}

//ARREGLARRRRRRRRRRRRRRRRRRRRRRR

export function getItemById(id) {

    return getAllItems().find((item) => item.id === id);

}

export function findItem(id) {

    return getItemById(id);

}

//publicaciones de los vendedores (se guardan en el navegador igual q lo demas)
//los items de ejemplo de ITEMS siguen existiendo y se juntan con los publicados

const PUBLICATIONS_KEY = "compraya_publicaciones";

export function getPublications() {

    try {

        const raw = localStorage.getItem(PUBLICATIONS_KEY);

        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

//devuelve false si el navegador no tiene espacio (por ejemplo, fotos muy pesadas)

function savePublications(list) {

    try {

        localStorage.setItem(PUBLICATIONS_KEY, JSON.stringify(list));

        return true;

    } catch {

        return false;

    }

}

export function getAllItems() {

    return [...ITEMS, ...getPublications()];

}

//estas tres devuelven la lista de publicaciones actualizada, o null si no se pudo guardar

export function addPublication(data) {

    const sameType = getAllItems().filter((item) => item.tipo === data.tipo);

    const displayId = Math.max(0, ...sameType.map((item) => item.displayId ?? 0)) + 1;

    const publication = {

        rating: 0,
        reviews: 0,
        images: [],
        ...data,
        id: `pub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        displayId,
        createdAt: new Date().toISOString(),

    };

    const next = [...getPublications(), publication];

    return savePublications(next) ? next : null;

}

export function updatePublication(id, changes) {

    const next = getPublications().map((p) => (p.id === id ? { ...p, ...changes } : p));

    return savePublications(next) ? next : null;

}

export function removePublication(id) {

    const next = getPublications().filter((p) => p.id !== id);

    return savePublications(next) ? next : null;

}

//cuando alguien compra, baja el stock de los productos publicados (nunca menos de 0)

export function decreaseStock(cartItems) {

    const next = getPublications().map((p) => {

        const bought = cartItems.find((item) => item.id === p.id);

        return bought && typeof p.stock === "number" ? { ...p, stock: Math.max(0, p.stock - bought.quantity) } : p;

    });

    savePublications(next);

}