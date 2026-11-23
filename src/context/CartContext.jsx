import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const CART_KEY = "compraya_cart";

const IVA_RATE = 0.19;

const ENVIO = 0;

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

  //agrega un producto al carrito. Si ya estaba, le suma la cantidad.
  //sin segundo parametro suma 1 (la tarjeta); en el detalle se pasa la cantidad elegida.
  
  const addItem = (product, quantity = 1) => {
  
    console.log("Agregando al carrito:", product, "cantidad:", quantity);

    setItems((prev) => {

      const found = prev.find((it) => it.id === product.id);

      if (found) {

        return prev.map((it) =>

          it.id === product.id ? { ...it, quantity: it.quantity + quantity } : it

        );

      }

      //solo se guarda lo necesario (sin las fotos) para no llenar el almacenamiento del navegador

      return [...prev, { id: product.id, name: product.name, price: product.price, tipo: product.tipo, quantity }];

    });

  };

  const removeItem = (id) => {

    setItems((prev) => prev.filter((it) => it.id !== id));

  };

  //cambia la cantidad de un item a un numero exacto (no lo suma, lo reemplaza).
  //si queda en menos de 1, directamente se elimina del carrito.

  const updateQuantity = (id, quantity) => {

    if (quantity < 1) {

      removeItem(id);

      return;

    }

    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity } : it)));

  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const iva = Math.round(subtotal * IVA_RATE);

  const envio = items.length > 0 ? ENVIO : 0;

  const total = subtotal + iva + envio;

  return (

    <CartContext.Provider

      value={{

        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        iva,
        envio,
        total,

      }}

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