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

    return ITEMS.filter (

        (item) =>

            item.tipo === tipo &&

            (!categoria || item.categoria === categoria) &&

            (!subcategoria || item.subcategoria === subcategoria) &&

            (!term || normalize(item.name).includes(term))
        
    );

}

export function getItemById(id) {

    return ITEMS.find((item) => item.id === id);

}