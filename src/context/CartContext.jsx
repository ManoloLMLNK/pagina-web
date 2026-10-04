import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const CART_KEY = "compraya_cart";

function loadCart() {
  
    try {

        const raw = localStorage.getItem(CART_KEY);

        return raw ? JSON.parse(raw) : [];

    } catch {

        return [];

    }

}

export function CartProvider({ children }) {

    const [items, setItems] = useState(loadCart);


    useEffect(() => {

        localStorage.setItem(CART_KEY, JSON.stringify(items));

    }, [items]);

  const addItem = (product, quantity = 1) => {

    setItems((prev) => {

        const exists = prev.find((i) => i.id === product.id);

        if (exists) {

            return prev.map((i) =>

            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i

        );

    }

    return [...prev, { ...product, quantity }];

});

};

const removeItem = (id) => {

    setItems((prev) => prev.filter((i) => i.id !== id));

};

const updateQuantity = (id, quantity) => {

    if (quantity <= 0) return removeItem(id);

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));

};

const clearCart = () => setItems([]);

const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (

        <CartContext.Provider

        value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}

        >

            {children}

        </CartContext.Provider>
    
    );

}

export function useCart() {

    const ctx = useContext(CartContext);

    if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");

    return ctx;

}