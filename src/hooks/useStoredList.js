import { useEffect, useState } from "react";

function load(storageKey) {

    try {

        const raw = localStorage.getItem(storageKey);

        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed : [];

    } catch {

        return [];

    }

}

//una lista que se guarda sola en localStorage (simula la base de datos
//mientras el profe no deja conectarla)

export function useStoredList(storageKey) {

    const [items, setItems] = useState(() => load(storageKey));

    useEffect(() => {

        try {

            localStorage.setItem(storageKey, JSON.stringify(items));

        } catch {

    }

}, [storageKey, items]);

    const addItem = (data) => {

        const newItem = {

            ...data,

            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

        };

        setItems((prev) => [...prev, newItem]);

        return newItem;

    };

    const removeItem = (id) => {

        setItems((prev) => prev.filter((item) => item.id !== id));

    };

    return { items, addItem, removeItem };

}