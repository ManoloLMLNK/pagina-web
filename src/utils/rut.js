//validacion de rut y todas esas cuestiones

export function formatRut(value) {
  
    const raw = value.replace(/[^0-9kK]/g, "").toUpperCase();
  
    let clean = "";
  
    for (const char of raw) {

        if (clean.length >= 9 || clean.endsWith("K")) break;

        if (char === "K") {

            if (clean.length >= 7) clean += char;

        } else {

            clean += char;

        }

    }

    if (clean.length <= 1) return clean;

    const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${body}-${clean.slice(-1)}`;

}

export function isValidRut(rut) {

    const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();

    if (clean.length < 2) return false;

    const body = clean.slice(0, -1);

    const dv = clean.slice(-1);

    let sum = 0;

    let mult = 2;

    for (let i = body.length - 1; i >= 0; i--) {

        sum += Number(body[i]) * mult;
        mult = mult === 7 ? 2 : mult + 1;

    }

    const rest = 11 - (sum % 11);

    const expected = rest === 11 ? "0" : rest === 10 ? "K" : String(rest);

    return dv === expected;

}

export function isSuspiciousRut(rut) {

    const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();

    const body = clean.slice(0, -1);

    if (body.length < 7) return true; //muy corto para ser un RUT real de una persona

//y esta revisa q no sean iguales

    if (/^(\d)\1+$/.test(body)) return true;

//esta parte revisa q no sean rut tipo 123456789 o 987654321

    const digits = body.split("").map(Number);

    const isAscending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);

    const isDescending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);

    if (isAscending || isDescending) return true;

    return false;

}