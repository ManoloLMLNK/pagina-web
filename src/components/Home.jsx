import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {useCart} from "../context/CartContext";
import {formatCLP} from "../utils/currency";
import Sidebar from "./Sidebar";
import AccountMenu from "./organisms/AccountMenu/AccountMenu";
import CartDrawer from "./organisms/CartDrawer/CartDrawer";
import "./Home.css";

//esto es para reemplazar el backend ya q el profe dijo q aun no
//conectemos la base de datos, a futuro habra q eliminar o editar estas constantes
//sera para añadir productos por ahora esta forma

const CATEGORIES = [

    {id: "tecnologia", label: "tecnologia", icon: "PCPC"},

    {id: "hogar", label: "hogar", icon: "CASA"},

];

const EMPTY_CATEGORY_SLOTS = 9;

const FEATURED_PRODUCTS = [

    {id: "p1", name: "audifonos bluetooth", price: 24990, rating: 4.8, reviews: 120},

];

const EMPTY_PRODUCT_SLOTS = 6;

const FEATURED_SERVICES = [

    {id: "s1", name: "limpieza de casa", price: 56990, rating: 4.5, reviews: 34},

];

const EMPTY_SERVICE_SLOTS = 6;

function ItemCard ({item}) {

    const {addItem} = useCart();

    return (

        <div className = "card">

            <div className = "card-image" />
            <p className = "card-name">{item.name}</p>
            <p className = "card-rating">

                estrella {item.rating} ({item.reviews})

            </p>

            <div className = "card-footer">

                <span className = "card-price">{formatCLP(item.price)}</span>

                <button

                    className = "add-to-cart"
                    aria-label = "Agregar al carrito"
                    onClick = {() => addItem(item)}
                
                >

                    carrito

                </button>

            </div>

        </div>

    );

}

export default function Home() {

    const {currentUser, logout} = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);

    const [activeTab, setActivateTab] = useState("productos");
    
    const [cartAnchor, setCartAnchor] = useState(null);

    const navigate = useNavigate();

    return (

        <div className = "home-page">

            <Sidebar

                open = {menuOpen}
                onClose = {() => setMenuOpen(false)}
                currentUser = {currentUser}
                onLogout = {logout}

            />

            <header className = "home-header">

                <button className = "menu-toggle" onClick = {() => setMenuOpen(true)}>

                    <span className = "menu-icon" aria-hidden = "true">

                        <span />
                        <span />
                        <span />

                    </span>

                    Menú

                </button>

                <div className = "brand">

                    <div className = "brand-logo" aria-hidden = "true">

                        carrito

                    </div>

                    <span className = "brand-name">CompraYa</span>

                </div>

                <div className = "account">

                    <button className = "icon-button" aria-label = "Notificaciones">

                        campanita

                    </button>

                    <AccountMenu currentUser = {currentUser} onLogout = {logout}/>

                </div>

            </header>

            <div className = "search-bar">

                <input type = "text" placeholder = "Buscar Servicio o Producto" />

                <button aria-label = "Buscar">Buscar</button>

            </div>

            <main className = "home-content">

                <h2 className = "section-title">Categorías</h2>

                <div className = "category-tabs">

                    <button

                        type = "button"
                        className = {`tab${activeTab === "productos" ? " active" : ""}`}
                        onClick = {() => setActivateTab("productos")}

                    >

                        Productos

                    </button>

                    <button

                        type = "button"
                        className = {`tab${activeTab === "servicios" ? " active" : ""}`}
                        onClick = {() => setActivateTab("servicios")}

                    >

                        Servicios

                    </button>

                </div>

                <div className = "category-row">

                    {CATEGORIES.map((cat) => (

                        <div className = "category-item" key = {cat.id}>

                            <div className = "category-icon">{cat.icon}</div>

                            <span>{cat.label}</span>

                        </div>

                    ))}

                    {Array.from({length: EMPTY_CATEGORY_SLOTS}).map((_, i) => (

                        <div className = "category-item placeholder" key = {`cat-empty-${i}`} />

                    ))}

                </div>

                <div className = "section-header">

                    <h2 className = "section-title">Productos Destacados</h2>
                    <span className = "see-noe">Ver más Productos</span>

                </div>

                <div className = "card-row">

                    {FEATURED_PRODUCTS.map((p) => (

                        <ItemCard key = {p.id} item = {p} />

                    ))}

                    {Array.from({length: EMPTY_CATEGORY_SLOTS}).map((_, i) => (

                        <div className="card placeholder" key={`prod-empty-${i}`} />

                    ))}

                </div>

                <div className = "section-header">

                    <h2 className = "section-title">Servicios Destacados</h2>
                    <span className = "see-more">Ver más Servicios</span>

                </div>

                <div className = "card-row">

                    {FEATURED_SERVICES.map((s) => (

                        <ItemCard key = {s.id} item = {s} />

                    ))}

                    {Array.from({length: EMPTY_CATEGORY_SLOTS}).map ((_, i) => (

                        <div className="card placeholder" key={`serv-empty-${i}`} />

                    ))}

                </div>

            </main>

            <button

                className = "cart-button"
                aria-label = "Carrito"
                onClick = {(e) => setCartAnchor(e.currentTarget)}

            >

                carrito

            </button>

            <CartDrawer

                anchorEl = {cartAnchor}
                onClose = {() => setCartAnchor(null)}
                onCheckout = {() => {

                    setCartAnchor(null);
                    navigate("/pago");

                }}

            />

            <footer className = "home-footer">

                <span>Universidad de Los Lagos</span>
                <span>CompraYa</span>
                <span>2026</span>

            </footer>

        </div>

    );

}