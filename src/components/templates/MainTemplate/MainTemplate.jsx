import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../Sidebar";
import AccountMenu from "../../organisms/AccountMenu/AccountMenu";
import CartDrawer from "../../organisms/CartDrawer/CartDrawer";
import CheckoutPanel from "../../organisms/CheckoutPanel/CheckoutPanel";
import logo from "../../../assets/logo.png";
import lupaIcon from "../../../assets/icons/lupa.png";
import carritoIcon from "../../../assets/icons/carrito.png";
import campanaIcon from "../../../assets/icons/campana.png";
import "../../Home.css";
import "../../../styles/Catalog.css";

export default function MainTemplate({

    children,
    searchPlaceholder = "Buscar Servicio o Producto",
    searchValue,
    onSearchChange,
    initialSearch = "",
    toolbar,

}) {

    const { currentUser, logout } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);

    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const handleCloseAll = () => {

        setAnchorEl(null);

        setCheckoutOpen(false);

    };

    const navigate = useNavigate();

    const [searchText, setSearchText] = useState(initialSearch);

    const searchProps = onSearchChange

        ? { value: searchValue ?? "", onChange: (e) => onSearchChange(e.target.value) }

        : { value: searchText, onChange: (e) => setSearchText(e.target.value) };

    const handleSearch = () => {

        const text = ((onSearchChange ? searchValue : searchText) ?? "").trim();

        if (text) navigate(`/buscar?q=${encodeURIComponent(text)}`);

};

    return (

        <div className="home-page">

            <Sidebar

                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                currentUser={currentUser}
                onLogout={logout}

            />


            <header className="home-header">

                <button type="button" className="menu-toggle" onClick={() => setMenuOpen(true)}>

                    <span className="menu-icon" aria-hidden="true">

                        <span />
                        <span />
                        <span />

                    </span>

                    Menú

                </button>

                <div className="brand">

                    <img

                        src={logo}

                        alt="CompraYa"

                        className="brand-logo"

                        style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}

                    />

                    <span className="brand-name">CompraYa</span>

                </div>

                <div className="account">

                    <button type="button" className="icon-button" aria-label="Notificaciones">

                        <img src={campanaIcon} alt="" style={{ width: 26, height: 26 }} />

                    </button>

                    <AccountMenu currentUser={currentUser} onLogout={logout} />

                </div>

            </header>


            {toolbar ?? (

                <div className="search-bar">

                    <input

                        type="text"
                        placeholder={searchPlaceholder}
                        {...searchProps}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}

                    />

                    <button type="button" aria-label="Buscar" onClick={handleSearch}>

                        <img src={lupaIcon} alt="" style={{ width: 20, height: 20 }} />

                    </button>

                </div>

            )}

            <main className="home-content">{children}</main>

            <button

                type="button"
                className="cart-button"
                aria-label="Carrito"

                onClick={(e) => {

                    setAnchorEl(e.currentTarget);
                    setCheckoutOpen(false);

                }}

            >

                <img src={carritoIcon} alt="" style={{ width: 28, height: 28 }} />

            </button>

            <CartDrawer

                anchorEl={checkoutOpen ? null : anchorEl}
                onClose={handleCloseAll}
                onCheckout={() => setCheckoutOpen(true)}

            />

            <CheckoutPanel anchorEl={checkoutOpen ? anchorEl : null} onClose={handleCloseAll} />

            <footer className="home-footer">

                <span>Universidad de Los Lagos</span>
                <span>CompraYa</span>
                <span>2026</span>

            </footer>

        </div>

    );

}