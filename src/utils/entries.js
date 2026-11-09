//utilidades para listas de campos repetibles varios teléfonos, correos

let nextId = 1;

//crea una entrada nueva con un id único

export function createEntry(value = "") {

    return { id: nextId++, value };

}

//crea una lista inicial con una entrada vacia

export function createEntries(values = [""]) {

    return values.map((value) => createEntry(value));

}

//agrega una entrada al final

export function addEntry(entries, value = "") {

    return [...entries, createEntry(value)];

}

//cambia el valor de una entrada segun su id

export function updateEntry(entries, id, value) {

    return entries.map((entry) => (entry.id === id ? { ...entry, value } : entry));

}

//elimina una entrada pero deja siempre al menos una

export function removeEntry(entries, id) {

    const filtered = entries.filter((entry) => entry.id !== id);

    return filtered.length > 0 ? filtered : [createEntry()];

}

//devuelve solo los valores con contenido

export function filledValues(entries) {

    return entries.map((entry) => entry.value.trim()).filter((value) => value !== "");

}