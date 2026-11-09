export function sanitizeName(value) {

    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

}

export function sanitizePhone(value) {

    const hasPlus = value.startsWith("+");

    const digits = value.replace(/\D/g, "");

    return hasPlus ? `+${digits}` : digits

}