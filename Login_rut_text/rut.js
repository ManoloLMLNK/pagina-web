export function formatRut(value) {

    const raw = value.replace(/[^0-9kK]/g, "").toUpperCase();

    let body = "";

    let dv = "";

    for (const char of raw) {

        if (body.length < 8) {

            if (/[0-9]/.test(char)) {

                body += char;

            }

        } else if (dv.length < 1) {

            dv = char;

        }

    }

    const clean = body + dv;

    if (clean.length <= 1) return clean;

    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return dv ? `${formattedBody}-${dv}` : formattedBody;

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