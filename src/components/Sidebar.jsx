import { NavLink } from "react-router-dom";
import "./Sidebar.css";

//los enlaces del menu lateral segun el rol del usuario
//"to" es la ruta a la que lleva y "label" el texto q se ve

const MENUS = {

    administrador: [

        { to: "/home", label: "Inicio" },
        { to: "/empresas", label: "Empresas" },
        { to: "/clientes", label: "Clientes" },
        { to: "/productos", label: "Productos" },
        { to: "/servicios", label: "Servicios" },

    ],

    vendedor: [

        { to: "/home", label: "Inicio" },
        { to: "/productos", label: "Productos" },
        { to: "/servicios", label: "Servicios" },
        { to: "/mis-publicaciones", label: "Mis Publicaciones" },

    ],

    comprador: [

        { to: "/home", label: "Inicio" },
        { to: "/productos", label: "Productos" },
        { to: "/servicios", label: "Servicios" },

    ],

};

export default function Sidebar({ open, onClose, currentUser, onLogout }) {

    const firstName = currentUser?.fullName?.split(" ")[0] || "";

    const links = MENUS[currentUser?.role] || MENUS.comprador;

    return (

        <>

            <div

                className={`sidebar-overlay ${open ? "visible" : ""}`}
                onClick={onClose}
                aria-hidden="true"

            />


            <aside className={`sidebar ${open ? "open" : ""}`}>

                <button type="button" className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">

                    x

                </button>

                <h2 className="sidebar-greeting">¡Hola{firstName ? `, ${firstName}` : ""}!</h2>

                <nav className="sidebar-nav">

                    {links.map((link) => (

                        <NavLink

                            key={link.to}
                            to={link.to}
                            end={link.to === "/home"}
                            onClick={onClose}
                            className={({ isActive }) => `sidebar-link${isActive ? " sidebar-link--active" : ""}`}

                        >

                            {link.label}

                        </NavLink>

                    ))}

                </nav>

                <button type="button" className="sidebar-logout" onClick={onLogout}>

                    Cerrar sesión

                </button>

            </aside>

        </>

    );

}