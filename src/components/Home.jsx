import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import AccountMenu from "./organisms/AccountMenu/AccountMenu";
import CartDrawer from "./organisms/CartDrawer/CartDrawer";
import ItemCard from "./molecules/ItemCard/ItemCard";
import "./Home.css";
import logo from "../assets/logo.png";
import lupaIcon from "../assets/icons/lupa.png";
import carritoIcon from "../assets/icons/carrito.png";
import campanaIcon from "../assets/icons/campana.png";
import CheckoutPanel from "./organisms/CheckoutPanel/CheckoutPanel";
import { getCategories, getItems } from "../data/catalog";

//esto es para reemplazar el backend ya q el profe dijo q aun no (ahora si tenemos permiso)
//conectemos la base de datos a futuro habra q eliminar o editar estas cosas
//sera para añadir productos por ahora esta forma

const EMPTY_CATEGORY_SLOTS = 9;

const FEATURED_LIMIT = 10;

export default function Home() {

    const {currentUser, logout} = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);

    const [activeTab, setActivateTab] = useState("productos");
    
    const [anchorEl, setAnchorEl] = useState(null);

    const [CheckoutOpen, setCheckoutOpen] = useState(false);

    const [searchText, setSearchText] = useState("");

    const navigate = useNavigate();

    const handleSearch = () => {

        const text = searchText.trim();

        if (text) navigate(`/buscar?q=${encodeURIComponent(text)}`);

    };

    const handleCategory = (categoryId) => {

        navigate(`/${activeTab}/${categoryId}`);

    };

    useEffect(() => {

        document.title = "CompraYa - Inicio";

    }, []);

    const handleCloseAll = () => {

        setAnchorEl(null);

        setCheckoutOpen(false);

    };

    const featuredProducts = getItems({tipo: "productos"}).reverse().slice(0, FEATURED_LIMIT);

    const featuredServices = getItems({tipo: "servicios"}).reverse().slice(0, FEATURED_LIMIT);

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

                    <img 
                    
                        src = {logo}
                        alt = "CompraYa"
                        className = "brand-logo"
                        style = {{width: 64, height: 64, borderRadius: "50%", objectFit: "cover"}}
                        
                    />

                    <span className = "brand-name">CompraYa</span>

                </div>

                <div className = "account">

                    <button className = "icon-button" aria-label = "Notificaciones">

                        <img src = {campanaIcon} alt = "" style = {{width: 26, height: 26}} />

                    </button>

                    <AccountMenu currentUser = {currentUser} onLogout = {logout}/>

                </div>

            </header>

            <div className = "search-bar">

                <input

                    type = "text"
                    placeholder = "Buscar Servicio o Producto"
                    value = {searchText}
                    onChange = {(e) => setSearchText(e.target.value)}
                    onKeyDown = {(e) => e.key === "Enter" && handleSearch()}

                />

                <button aria-label = "Buscar" onClick = {handleSearch}>

                    <img src = {lupaIcon} alt = "" style = {{width: 20, height: 20}} />

                </button>

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

                <div className = "category-row" style = {{flexWrap: "wrap"}}>

                    {getCategories(activeTab).map((cat) => (

                        <div

                            className = "category-item"
                            key = {cat.id}
                            onClick = {() => handleCategory(cat.id)}
                            style = {{cursor: "pointer"}}

                        >

                            <div className = "category-icon">

                                {typeof cat.icon === "string" && cat.icon.includes("/") ? (

                                    <img src = {cat.icon} alt = "" style = {{width: 40, height: 40, objectFit: "contain"}} />

                                ) : (

                                    cat.icon

                                )}

                            </div>

                            <span>{cat.label}</span>

                        </div>

                    ))}

                    {Array.from({length: Math.max(0, EMPTY_CATEGORY_SLOTS - getCategories(activeTab).length)}).map((_, i) => (

                        <div className = "category-item placeholder" key = {`cat-empty-${i}`} />

                    ))}

                </div>

                <div className = "section-header">

                    <h2 className = "section-title">Productos Destacados</h2>
                    
                    <span className = "see-more">Ver más Productos</span>

                </div>

                <div className = "card-row">

                    {featuredProducts.map((p) => (

                        <ItemCard key = {p.id} item = {p} />

                    ))}

                    {Array.from({length: Math.max(0, FEATURED_LIMIT - featuredProducts.length)}).map((_, i) => (

                        <div className="card placeholder" key={`prod-empty-${i}`} />

                    ))}

                </div>

                <div className = "section-header">

                    <h2 className = "section-title">Servicios Destacados</h2>
                    <span className = "see-more">Ver más Servicios</span>

                </div>

                <div className = "card-row">

                    {featuredServices.map((s) => (

                        <ItemCard key = {s.id} item = {s} />

                    ))}

                    {Array.from({length: Math.max(0, FEATURED_LIMIT - featuredServices.length)}).map ((_, i) => (

                        <div className="card placeholder" key={`serv-empty-${i}`} />

                    ))}

                </div>

            </main>

            <button

                className = "cart-button"
                aria-label = "Carrito"
                onClick = {(e) => {
        
                    setAnchorEl(e.currentTarget);

                    setCheckoutOpen(false);
    
                }}

            >

                <img src = {carritoIcon} alt = "" style = {{width: 28, height: 28}} />

            </button>

            <CartDrawer

                anchorEl = {CheckoutOpen ? null : anchorEl}
                onClose = {handleCloseAll}
                onCheckout = {() => setCheckoutOpen(true)}

            />
            
            <CheckoutPanel

                anchorEl = {CheckoutOpen ? anchorEl : null}

                onClose = {handleCloseAll}

            />

            <footer className = "home-footer">

                <span>Universidad de Los Lagos</span>
                <span>CompraYa</span>
                <span>2026</span>

            </footer>

        </div>

    );

}