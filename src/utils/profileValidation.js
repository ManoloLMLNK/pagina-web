import { isValidEmail, isValidPhone } from "./validators";

const REQUIRED = "Campo obligatorio.";

//la primera casilla no puede quedar vacia
//las casillas extra vacias se ignoran y el mismo valor no se puede repetir

function validateEntries(entries, { required, isValid, invalidMessage, duplicateMessage }) {

    const errors = {};

    const seen = new Set();

    entries.forEach((entry, index) => {

        const value = entry.value.trim();

        if (!value) {

            if (required && index === 0) errors[entry.id] = REQUIRED;

            return;

        }

        if (!isValid(value)) {

            errors[entry.id] = invalidMessage;

            return;

        }

        const key = value.toLowerCase().replace(/\s+/g, " ");

        if (seen.has(key)) errors[entry.id] = duplicateMessage;

        seen.add(key);

    });

    return errors;

}

export function validateProfile(values, phones, addresses) {

    const errors = {};

    if (!values.fullName.trim()) errors.fullName = REQUIRED;

    else if (values.fullName.trim().split(/\s+/).length < 2) errors.fullName = "Ingrese su nombre y apellido.";

    if (!values.email.trim()) errors.email = REQUIRED;

    else if (!isValidEmail(values.email)) errors.email = "Ingrese un correo válido.";

    const phoneErrors = validateEntries(phones, {

        required: true,
        isValid: isValidPhone,
        invalidMessage: "Ingrese un teléfono válido.",
        duplicateMessage: "Este teléfono ya está agregado.",

    });

    if (Object.keys(phoneErrors).length > 0) errors.phones = phoneErrors;

    const addressErrors = validateEntries(addresses, {

        required: false,
        isValid: (value) => value.length >= 5,
        invalidMessage: "Ingrese una dirección completa.",
        duplicateMessage: "Esta dirección ya está agregada.",

    });

    if (Object.keys(addressErrors).length > 0) errors.addresses = addressErrors;

    return errors;

}