import monitorIcon from "../assets/icons/monitor.png";
import casaIcon from "../assets/icons/casa.png";

export const TIPOS = {

    productos: {label: "Productos", itemLabel: "Producto"},

    servicios: {label: "Servicios", itemLabel: "Servicio"},

};

//atajo para escribir el arbo

const cat = (id, label, subcategories = [], icon) => ({ id, label, icon: icon ?? makeIcon(label), subcategories });

//arbol de categorias del enunciado
//los id antiguos se mantienen para no perder las publicaciones ya guardadas

export const CATEGORIES = {

    productos: [
    
        cat("tecnologia", "Tecnología", [
    
            cat("computacion", "Computación"),
    
            cat("audio-musica", "Audio y Música"),
    
            cat("juegos", "Juegos y consolas"),
    
            cat("electronica-tv", "Electrónica y Televisión"),
    
            cat("tecnologia-otros", "Otros"),
    
        ], monitorIcon),
    
        cat("celulares", "Celulares"),
    
        cat("hogar", "Hogar y Cocina", [], casaIcon),
    
        cat("alimentacion", "Alimentación"),
    
        cat("accesorios-vehiculos", "Accesorios para vehículos"),
    
        cat("libros-instrumentos", "Libros e instrumentos musicales"),
    
        cat("ropa-calzado", "Ropa, moda y calzado"),
    
        cat("juguetes-ninos", "Juguetes y Niños"),
    
        cat("utiles-libreria", "Útiles y librería"),
    
        cat("otros", "Otros"),
    
    ],

    servicios: [
    
        cat("tecnologia", "Computación y Tecnología", [], monitorIcon),
    
        cat("hogar", "Servicios domésticos", [
    
            cat("limpieza", "Aseo"),
    
            cat("jardin", "Trabajo de jardín"),
    
            cat("combustion-reparaciones", "Limpieza de combustión y reparaciones menores"),
    
            cat("cuidado-adultos", "Cuidado de adultos"),
    
            cat("cuidado-ninos", "Cuidado de niños"),
    
            cat("cerrajeria", "Cerrajería"),
    
            cat("domesticos-otros", "Otros servicios domésticos"),
    
        ], casaIcon),
    
        cat("profesionales", "Servicios profesionales", [
    
            cat("computacion", "Computación (páginas web, diseño, publicidad)"),
    
            cat("abogados", "Abogados"),
    
            cat("contadores", "Contadores y Auditores"),
    
            cat("arquitecto", "Arquitecto"),
    
            cat("psicologos", "Psicólogos"),
    
            cat("salud", "Servicio de salud", [
    
                cat("medico", "Médico"),
    
                cat("dentista", "Dentista"),
    
                cat("enfermeria", "Enfermería"),
    
                cat("kinesiologia", "Kinesiología"),
    
                cat("salud-otros", "Otros"),
    
            ]),
    
            cat("educativos", "Servicios educativos", [
    
                cat("clases-particulares", "Clases particulares"),
    
                cat("fonoaudiologia", "Fonoaudiología"),
    
                cat("terapeuta-ocupacional", "Terapeuta Ocupacional"),
    
                cat("educativos-otros", "Otros"),
    
            ]),
    
            cat("veterinarios", "Veterinarios"),
    
            cat("profesionales-otros", "Otros"),
    
        ]),
    
        cat("vehiculos", "Vehículos", [
    
            cat("vehiculos-reparacion", "Reparación"),
    
            cat("vehiculos-pintura", "Pintura"),
    
            cat("vehiculos-compraventa", "Compra y venta"),
    
            cat("vehiculos-mecanica", "Mecánica general"),
    
            cat("vehiculos-otros", "Otros"),
    
        ]),
    
        cat("confeccion", "Confección de ropa y vestuario"),
    
        cat("banqueteria", "Banquetería, repostería y alimentación"),
    
        cat("otros", "Otros"),
    
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

//las categorias predeterminadas mas las q agrega el administrador

export const MAX_DEPTH = 4;

export function getCategories(tipo) {

    const custom = getCustomCategories().filter((c) => c.tipo === tipo);

    //si una creada antes tiene el mismo id q una predeterminada queda solo la predeterminada
    
    const baseIds = new Set();
    
    const collect = (list) => list.forEach((n) => { baseIds.add(n.id); collect(n.subcategories); });
    
    collect(CATEGORIES[tipo] ?? []);

    const childrenOf = (parentId) =>
        
        custom

            .filter((c) => (c.parentId ?? null) === parentId && !baseIds.has(c.id))

            .map((c) => ({ id: c.id, label: c.label, icon: makeIcon(c.label), custom: true, subcategories: childrenOf(c.id) }));

    const merge = (node) => ({

        ...node,

        subcategories: [...node.subcategories.map(merge), ...childrenOf(node.id)],

    });

    return [...(CATEGORIES[tipo] ?? []).map(merge), ...childrenOf(null)];

}

//busca una categoria en cualquier nivel y devuelve el camino completo hasta ella

export function findCategoryTrail(tipo, id, list = getCategories(tipo)) {

    for (const node of list) {

        if (node.id === id) return [node];

        const rest = findCategoryTrail(tipo, id, node.subcategories);

        if (rest) return [node, ...rest];

    }

    return null;

}

//convierte una lista de ids en categorias

export function findPath(tipo, ids) {

    let list = getCategories(tipo);
    
    const trail = [];

    for (const id of ids) {

        const node = list.find((c) => c.id === id);

        if (!node) return null;

        trail.push(node);
    
        list = node.subcategories;

    }

    return trail;

}

export function findCategory(tipo, categoriaId) {

    return getCategories(tipo).find((c) => c.id === categoriaId);

}

export function findSubcategory(tipo, categoriaId, subcategoriaId) {

    const category = findCategory(tipo, categoriaId);

    return category?.subcategories.find((s) => s.id === subcategoriaId);

}

export function getItemPath(item) {

    return item.categoryPath?.length ? item.categoryPath : [item.categoria, item.subcategoria].filter(Boolean);

}

export function categoryLabel(item) {

    const ids = getItemPath(item);
    
    const trail = findPath(item.tipo, ids);

    return trail ? trail.map((n) => n.label).join(" > ") : ids.join(" > ");

}

//path es la lista de ids de la categoria muestra tambien lo q esta en sus subcategorias

export function getItems({ tipo, categoria, subcategoria, path, search = "" }) {

    const term = normalize(search.trim());

    const wanted = path ?? [categoria, subcategoria].filter(Boolean);

    return getAllItems().filter((item) => {

        const own = getItemPath(item);

        return (

            item.tipo === tipo &&

            wanted.every((id, i) => own[i] === id) &&

            (!term || normalize(item.name).includes(term))

        );

    });

}

//edad en años a partir de dd/mm/aaaa

export function ageFrom(birthDate, today = new Date()) {

    const parts = String(birthDate ?? "").split(/[/-]/).map(Number);

    if (parts.length !== 3 || parts.some((n) => !n)) return null;

    const [y, m, d] = parts[0] > 31 ? parts : [parts[2], parts[1], parts[0]];

    const age = today.getFullYear() - y;

    const hadBirthday = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);

    return hadBirthday ? age : age - 1;

}

//true si el servicio exige mas edad de la q tiene la persona

export function isAgeRestricted(item, user) {

    const min = Number(item.ageRestriction) || 0;

    if (min <= 18) return false;

    const age = ageFrom(user?.birthDate);

    return age === null || age < min;

}

export function getItemById(id) {

    return getAllItems().find((item) => item.id === id);

}

export function findItem(id) {

    return getItemById(id);

}

//publicaciones de los vendedores
//los items de ejemplo de items siguen existiendo y se juntan con los publicados

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

//devuelve false si el navegador no tiene espacio

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

//estas tres devuelven la lista de publicaciones actualizada o null si no se pudo guardar

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

//cuando alguien compra baja el stock sin bajar de 0

export function decreaseStock(cartItems) {

    const next = getPublications().map((p) => {

        const lines = cartItems.filter((item) => item.id === p.id);

        if (lines.length === 0) return p;

        if (p.variants?.length) {

            const variants = p.variants.map((v) => {

                const sold = lines.filter((l) => l.variantId === v.id).reduce((sum, l) => sum + l.quantity, 0);

                return { ...v, stock: Math.max(0, v.stock - sold) };

            });

            return { ...p, variants, stock: variants.reduce((sum, v) => sum + v.stock, 0) };

        }

        const sold = lines.reduce((sum, l) => sum + l.quantity, 0);

        return typeof p.stock === "number" ? { ...p, stock: Math.max(0, p.stock - sold) } : p;

    });

    savePublications(next);

}

//al cancelar o devolver un pedido el stock vuelve

export function increaseStock(items) {

    const next = getPublications().map((p) => {

        const lines = items.filter((item) => item.id === p.id);

        if (lines.length === 0) return p;

        if (p.variants?.length) {

            const variants = p.variants.map((v) => ({
                ...v,
                stock: v.stock + lines.filter((l) => l.variantId === v.id).reduce((sum, l) => sum + l.quantity, 0),
            }));

            return { ...p, variants, stock: variants.reduce((sum, v) => sum + v.stock, 0) };

        }

        const back = lines.reduce((sum, l) => sum + l.quantity, 0);

        return typeof p.stock === "number" ? { ...p, stock: p.stock + back } : p;

    });

    savePublications(next);

}

//ofertas por tiempo limitado vale todo el ultimo dia

export function activeOffer(item, now = new Date()) {

    const { percent, until } = item?.offer ?? {};

    if (!(percent > 0) || !until) return null;

    return now <= new Date(`${until}T23:59:59`) ? item.offer : null;

}

export function getVariant(item, variantId) {

    return item?.variants?.find((v) => v.id === variantId);

}

//precio sin oferta

export function basePrice(item, variantId) {

    return getVariant(item, variantId)?.price ?? item.price;

}

//precio final q paga el cliente

export function priceOf(item, variantId, now = new Date()) {

    const offer = activeOffer(item, now);
    
    const price = basePrice(item, variantId);

    return offer ? Math.round(price * (1 - offer.percent / 100)) : price;

}

//publicaciones parecidas del mismo tipo y categoria primero las mas cercanas

export function getRelated(item, limit = 5) {

    const path = getItemPath(item);

    const score = (other) => {

        const own = getItemPath(other);
        let i = 0;

        while (i < path.length && own[i] === path[i]) i += 1;

        return i;

    };

    return getAllItems()
        
        .filter((other) => other.id !== item.id && other.tipo === item.tipo && score(other) > 0)
        .sort((a, b) => score(b) - score(a))
        .slice(0, limit);

}

//categorias y subcategorias creadas por el administrador

const CATEGORIES_KEY = "compraya_categorias";

function getCustomCategories() {

    try {

        const raw = localStorage.getItem(CATEGORIES_KEY);

        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

function saveCustomCategories(list) {

    try {

        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));

        return true;

    } catch {

        return false;

    }

}

//icono de texto para las categorias nuevas sus primeras letras

function makeIcon(label) {

    const letters = label.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");

    return (letters || label.replace(/\s/g, "")).slice(0, 4).toUpperCase();

}

//todos los ids de una categoria y de lo q cuelga de ella

const idsOf = (node) => [node.id, ...node.subcategories.flatMap(idsOf)];

//agrega una categoria o una subcategoria

export function addCategory({ tipo, label, parentId = null }) {

    const clean = label.trim().replace(/\s+/g, " ");

    const trail = parentId ? findCategoryTrail(tipo, parentId) : [];

    if (!trail) return { ok: false, error: "La categoría seleccionada ya no existe." };

    if (trail.length >= MAX_DEPTH) return { ok: false, error: `Solo se permiten ${MAX_DEPTH} niveles.` };

    const siblings = parentId ? trail[trail.length - 1].subcategories : getCategories(tipo);

    if (siblings.some((s) => normalize(s.label) === normalize(clean))) {

        return { ok: false, error: "Ya existe una con ese nombre." };

    }

    //el id sale del nombre y no puede repetirse dentro del mismo tipo

    const usedIds = new Set(getCategories(tipo).flatMap(idsOf));

    const baseId = normalize(clean).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "categoria";

    let id = baseId;

    let n = 2;

    while (usedIds.has(id)) {

        id = `${baseId}-${n}`;

        n += 1;

    }

    const next = [...getCustomCategories(), { id, tipo, label: clean, parentId }];

    return saveCustomCategories(next) ? { ok: true, id } : { ok: false, error: "No hay espacio para guardar." };

}

//solo se pueden eliminar las creadas por el administrador y si no tienen publicaciones

export function removeCategory(tipo, id) {

    const custom = getCustomCategories();

    const trail = findCategoryTrail(tipo, id);

    if (!trail || !trail[trail.length - 1].custom) {

        return { ok: false, error: "Las categorías predeterminadas no se pueden eliminar." };

    }

    //la categoria y todo lo q cuelga de ella

    const ids = new Set(idsOf(trail[trail.length - 1]));

    const inUse = getAllItems().filter(
        (item) => item.tipo === tipo && getItemPath(item).some((x) => ids.has(x))
    ).length;

    if (inUse > 0) {

        return {
            ok: false,
            error: `Hay ${inUse} publicación(es) en esta categoría. Elimínalas o cámbialas de categoría primero.`,
        };

    }

    const next = custom.filter((c) => !(c.tipo === tipo && ids.has(c.id)));

    return saveCustomCategories(next) ? { ok: true } : { ok: false, error: "No se pudo guardar el cambio." };

}

//renombra una categoria o subcategoria creada por el administrador

export function updateCategory({ tipo, id, label }) {

    const custom = getCustomCategories();

    const trail = findCategoryTrail(tipo, id);

    if (!trail || !trail[trail.length - 1].custom) {

        return { ok: false, error: "Las categorías predeterminadas no se pueden editar." };

    }

    const clean = label.trim().replace(/\s+/g, " ");

    const siblings = trail.length > 1 ? trail[trail.length - 2].subcategories : getCategories(tipo);

    if (siblings.some((s) => s.id !== id && normalize(s.label) === normalize(clean))) {

        return { ok: false, error: "Ya existe una con ese nombre." };

    }

    const next = custom.map((c) => (c.tipo === tipo && c.id === id ? { ...c, label: clean } : c));

    return saveCustomCategories(next) ? { ok: true } : { ok: false, error: "No se pudo guardar el cambio." };

}