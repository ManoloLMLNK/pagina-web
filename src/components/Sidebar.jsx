import { NavLink } from "react-router-dom";
import "./Sidebar.css";

//los enlaces del menu lateral segun el rol del usuario

const MENUS = {

    administrador: [

        { to: "/panel", label: "Panel" },
        { to: "/home", label: "Inicio" },
        { to: "/empresas", label: "Empresas" },
        { to: "/clientes", label: "Clientes" },
        { to: "/categorias", label: "Categorías" },
        { to: "/productos", label: "Productos" },
        { to: "/servicios", label: "Servicios" },
        { to: "/ventas", label: "Historial de ventas" },
        { to: "/reportes", label: "Reportes" },
        { to: "/moderacion", label: "Moderación" },

    ],

    vendedor: [

        { to: "/panel", label: "Panel" },
        { to: "/home", label: "Inicio" },
        { to: "/productos", label: "Productos" },
        { to: "/servicios", label: "Servicios" },
        { to: "/administrar/productos", label: "Mis Productos" },
        { to: "/administrar/servicios", label: "Mis Servicios" },
        { to: "/ventas", label: "Mis Ventas" },
        { to: "/cotizaciones", label: "Cotizaciones" },
        { to: "/mensajes", label: "Mensajes" },
        { to: "/moderacion", label: "Preguntas pendientes" },
        { to: "/reportes", label: "Reportes" },
        { to: "/mi-empresa", label: "Mi Empresa" },

    ],

    comprador: [

        { to: "/home", label: "Inicio" },
        { to: "/productos", label: "Productos" },
        { to: "/servicios", label: "Servicios" },
        { to: "/cotizaciones", label: "Cotizaciones" },
        { to: "/mensajes", label: "Mensajes" },

    ],

};

const ROLE_ORDER = ["administrador", "vendedor", "comprador"];

//junta los menus de todos los roles de la persona sin repetir enlaces

function linksFor(user) {

    const roles = user?.roles ?? (user?.role ? [user.role] : ["comprador"]);

    const seen = new Set();

    const links = [];

    ROLE_ORDER.filter((r) => roles.includes(r)).forEach((r) => {

        (MENUS[r] ?? []).forEach((link) => {

            if (!seen.has(link.to)) {

                seen.add(link.to);

                links.push(link);

            }

        });

    });

    return links.length > 0 ? links : MENUS.comprador;

}

export default function Sidebar({ open, onClose, currentUser, onLogout }) {

    const firstName = currentUser?.fullName?.split(" ")[0] || "";

    const links = linksFor(currentUser);

    return (

        <>
        
            <div className={`sidebar-overlay ${open ? "visible" : ""}`} onClick={onClose} aria-hidden="true" />

            <aside className={`sidebar ${open ? "open" : ""}`} style={{ overflowY: "auto" }}>
        
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