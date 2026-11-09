//quita tildes, mayusculas, puntos, guiones y espacios para comparar textos, asi es mas facil busaclo

function squash(text) {

    return String(text ?? "")

        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.\-\s]/g, "");

}

export function matchesSearch(fields, term) {

    const wanted = squash(term);
    if (!wanted) return true;
    return fields.some((field) => squash(field).includes(wanted));

}