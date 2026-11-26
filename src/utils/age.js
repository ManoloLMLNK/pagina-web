const MIN_BIRTH_YEAR = 1940;

export const ADULT_AGE = 18;

//convierte 18/04/2005 en fecha devuelve null si no existe ese dia

export function parseBirthDate(value) {

    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value ?? ""));

    if (!match) return null;

    const [day, month, year] = match.slice(1).map(Number);

    const date = new Date(year, month - 1, day);

    const exists = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

    return exists ? date : null;

}

//edad cumplida hoy

export function getAge(value, today = new Date()) {

    const birth = parseBirthDate(value);

    if (!birth) return null;

    let age = today.getFullYear() - birth.getFullYear();

    const hadBirthday =

        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

    if (!hadBirthday) age -= 1;

    return age;

}

export const isAdult = (value) => (getAge(value) ?? -1) >= ADULT_AGE;

//devuelve el mensaje de error

export function birthDateError(value) {

    if (!value) return "Campo obligatorio.";

    const birth = parseBirthDate(value);

    if (!birth) return "Ingrese una fecha válida (DD/MM/AAAA).";

    if (birth.getFullYear() < MIN_BIRTH_YEAR) return `La fecha no puede ser anterior a ${MIN_BIRTH_YEAR}.`;

    if (birth > new Date()) return "La fecha no puede ser futura.";

    if (!isAdult(value)) return "Debes ser mayor de 18 años para usar CompraYa.";

    return "";

}