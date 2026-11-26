//textos y opciones de las caracteristicas de las publicaciones y del tipo de oferta de un emprendedor
//restriccion de edad de un servicio

export const AGE_OPTIONS = [

    { value: "0", label: "Sin restricción" },
    { value: "18", label: "Mayores de 18 años" },
    { value: "21", label: "Mayores de 21 años" },

];

export const DURATION_UNITS = [

    { value: "minutos", label: "Minutos", one: "minuto", many: "minutos" },
    { value: "horas", label: "Horas", one: "hora", many: "horas" },
    { value: "dias", label: "Días", one: "día", many: "días" },

];

//lo q el emprendedor declara q ofrece

export const OFFER_OPTIONS = [

    { value: "productos", label: "Productos" },
    { value: "servicios", label: "Servicios" },
    { value: "ambos", label: "Productos y servicios" },

];

export const offerLabel = (value) => OFFER_OPTIONS.find((o) => o.value === value)?.label ?? "Sin definir";

export const formatMinAge = (minAge) => (Number(minAge) > 0 ? `Mayores de ${minAge} años` : "Sin restricción");

export function formatDuration(duration) {

    if (!duration) return "—";

    const unit = DURATION_UNITS.find((u) => u.value === duration.unit);

    return `${duration.value} ${unit ? (duration.value === 1 ? unit.one : unit.many) : duration.unit}`;

}

export const formatWeight = (weight) => (typeof weight === "number" ? `${String(weight).replace(".", ",")} kg` : "—");

export const formatSize = (size) => (size ? `${size.width} × ${size.height} × ${size.depth} cm` : "—");