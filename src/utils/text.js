export function sanitizeName(value) {

    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

}

const MAX_PHONE_DIGITS = 11;

//un + solo puede ir de primer caracter el resto son solo numeros

export function sanitizePhone(value) {

    const text = String(value ?? "").trim();

    const digits = text.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);

    return text.startsWith("+") ? `+${digits}` : digits;

}