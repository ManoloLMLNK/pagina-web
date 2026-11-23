//compara dos ruts sin importar los puntos, el guion ni las mayusculas

const clean = (rut) => String(rut ?? "").replace(/[^0-9kK]/g, "").toUpperCase();

export function sameRut(a, b) {

    return clean(a) !== "" && clean(a) === clean(b);

}

//basicamente para vincular un usuario con una empresa