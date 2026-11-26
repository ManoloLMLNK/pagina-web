import { createContext, useContext, useEffect, useState } from "react";
import { getItemById, getVariant, isAgeRestricted, priceOf } from "../data/catalog";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const CART_KEY = "compraya_cart";

const IVA_RATE = 0.19;

const ENVIO = 0;

//cada linea del carrito es una publicacion

export const lineKey = (item) => (item.variantId ? `${item.id}::${item.variantId}` : item.id);

//stock disponible solo los productos cn stock numerico tienen limite

function stockOf(item) {

  const live = getItemById(item.id);

  if (live?.variants?.length) return getVariant(live, item.variantId)?.stock ?? 0;

  if (typeof live?.stock === "number") return live.stock;

  return typeof item.stock === "number" ? item.stock : undefined;

}

//el precio se calcula al momento por si la oferta vencio o el vendedor lo cambio

function withCurrentPrice(line) {

  const live = getItemById(line.id);

  return live ? { ...line, price: priceOf(live, line.variantId) } : line;

}

function clampToStock(item) {

  const stock = stockOf(item);

  if (stock === undefined) return item;

  return { ...item, stock, quantity: Math.min(item.quantity, stock) };

}

function loadCart() {

  try {

    const raw = localStorage.getItem(CART_KEY);

    const stored = raw ? JSON.parse(raw) : [];

    //corrige cantidades q se pasen del stock y saca lo q ya no tiene

    return stored.map(clampToStock).filter((it) => it.quantity >= 1);

  } catch {

    return [];

  }

}

export function CartProvider({ children }) {

  const [stored, setItems] = useState(loadCart);

  const items = stored.map(withCurrentPrice);

  const { currentUser } = useAuth();

  useEffect(() => {

    localStorage.setItem(CART_KEY, JSON.stringify(stored));

  }, [stored]);

  //maximo q se puede llevar de un item sirve para deshabilitar el boton

  const getMaxQuantity = (item) => stockOf(item) ?? Infinity;

  //agrega un producto al carrito sin pasarse del stock
  //devuelve si message existe se puede mostrar al usuario

  const addItem = (product, quantity = 1, variantId) => {

    if (product.variants?.length && !getVariant(product, variantId)) {

      return { ok: false, message: "Elige una opción en la página del producto" };

    }

    const variant = getVariant(product, variantId);

    const key = lineKey({ id: product.id, variantId: variant?.id });

    //algunos servicios exigen una edad minima

    if (isAgeRestricted(product, currentUser)) {

      return { ok: false, message: `Este servicio es solo para mayores de ${product.ageRestriction} años` };

    }

    const limit = stockOf({ ...product, variantId: variant?.id });

    if (limit !== undefined && limit < 1) {

      return { ok: false, message: "Este producto no tiene stock disponible" };

    }

    //solo un vendedor por compra si el carrito ya tiene productos de otro vendedor no se mezcla

    if (items.length > 0 && (items[0].sellerRut ?? "") !== (product.sellerRut ?? "")) {

      return { ok: false, message: "Tu carrito tiene productos de otro vendedor. Cada compra es a un solo vendedor: finaliza o vacía el carrito primero." };

    }

    const current = items.find((it) => lineKey(it) === key)?.quantity ?? 0;

    const wanted = current + quantity;

    const finalQty = limit === undefined ? wanted : Math.min(wanted, limit);

    if (finalQty === current) {

      return { ok: false, message: `Ya tienes las ${limit} unidades disponibles en tu carrito` };

    }

    setItems((prev) => {

      const found = prev.find((it) => lineKey(it) === key);

      if (found) {

        return prev.map((it) => (lineKey(it) === key ? { ...it, quantity: finalQty, stock: limit } : it));

      }

      //solo se guarda lo necesario para no llenar el almacenamiento del navegador

      return [...prev, {
        id: product.id,
        variantId: variant?.id,
        name: variant ? `${product.name} (${variant.name})` : product.name,
        price: priceOf(product, variant?.id),
        tipo: product.tipo,
        quantity: finalQty,
        stock: limit,
        sellerRut: product.sellerRut,
      }];

    });

    return { ok: true, message: finalQty < wanted ? `Solo hay ${limit} unidades disponibles` : undefined };

  };

  //estas dos reciben la llave de la linea

  const removeItem = (key) => {

    setItems((prev) => prev.filter((it) => lineKey(it) !== key));

  };

  //cambia la cantidad a un numero exacto sin pasarse del stock
  //si queda en menos de 1 se elimina del carrito

  const updateQuantity = (id, quantity) => {

    if (quantity < 1) {

      removeItem(id);

      return { ok: true };

    }

    const item = items.find((it) => lineKey(it) === id);

    if (!item) return { ok: false };

    const limit = stockOf(item);

    const finalQty = limit === undefined ? quantity : Math.min(quantity, limit);

    setItems((prev) => prev.map((it) => (lineKey(it) === id ? { ...it, quantity: finalQty } : it)));

    return { ok: true, message: finalQty < quantity ? `Solo hay ${limit} unidades disponibles` : undefined };

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
        getMaxQuantity,
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