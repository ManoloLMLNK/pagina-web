export function isValidEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

}

export function isValidPhone(value) {

    return /^\+?\d{8,15}$/.test(value);

}

export function isValidWebsite(value) {

    const host = value

        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "");

    return /^([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(host);

}

export function formatDateInput(value) {

    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;

}

export function isValidBirthDate(value) {

    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

    if (!match) return false;

    const [day, month, year] = match.slice(1).map(Number);

    const date = new Date(year, month - 1, day);

    const exists =

        date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

    return exists && year >= 1900 && date <= new Date();

}