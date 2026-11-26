import { REGIONES, getRegion } from "../data/chile";

const REQUIRED = "Campo obligatorio.";

const MIN_STREET = 5;

let counter = 0;

//una direccion en el formulario calle region comuna

export function createAddress(values = {}) {

    counter += 1;

    return { id: `addr-${Date.now()}-${counter}`, calle: "", regionId: "", comuna: "", ...values };

}

//lo q se guarda en la cuenta sigue siendo un texto

export function addressToString({ calle, regionId, comuna }) {

    return [calle.trim().replace(/\s+/g, " "), comuna, getRegion(regionId)?.nombre].filter(Boolean).join(", ");

}

//el camino inverso, para editar una direccion guardada
//las cuentas antiguas quedan solo cn la calle y se pide completar region y comuna

export function stringToAddress(text) {

    const raw = String(text ?? "");

    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);

    const region = REGIONES.find((r) => r.nombre === parts[parts.length - 1]);

    const comuna = region && region.comunas.includes(parts[parts.length - 2]) ? parts[parts.length - 2] : "";

    if (region && comuna) {

        return createAddress({ calle: parts.slice(0, -2).join(", "), regionId: region.id, comuna });

    }

    return createAddress({ calle: raw });

}

//las casillas completamente vacias se ignoran

export function filledAddresses(list) {

    return list.filter((a) => a.calle.trim() || a.regionId || a.comuna);

}

//la primera direccion es obligatoria

export function validateAddresses(list, { required = true } = {}) {

    const errors = {};

    const seen = new Set();

    list.forEach((address, index) => {

        const empty = !address.calle.trim() && !address.regionId && !address.comuna;

        if (empty) {

            if (required && index === 0) {

                errors[address.id] = { calle: REQUIRED, regionId: REQUIRED, comuna: REQUIRED };

            }

            return;

        }

        const fieldErrors = {};

        if (!address.calle.trim()) fieldErrors.calle = REQUIRED;

        else if (address.calle.trim().length < MIN_STREET) fieldErrors.calle = "Ingrese calle y número.";

        if (!address.regionId) fieldErrors.regionId = REQUIRED;

        if (!address.comuna) fieldErrors.comuna = REQUIRED;

        if (Object.keys(fieldErrors).length === 0) {

            const key = addressToString(address).toLowerCase();

            if (seen.has(key)) fieldErrors.calle = "Esta dirección ya está agregada.";

            seen.add(key);

        }

        if (Object.keys(fieldErrors).length > 0) errors[address.id] = fieldErrors;

    });

    return errors;

}