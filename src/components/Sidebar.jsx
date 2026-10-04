import { Link } from "react-router-dom"
import"./Sidebar.css"

const BASE_LINKS = [

    {to: "/home", label: "inicio"},
    {to: "/productos", label: "productos"},
    {to: "/servicios", label: "servicios"}

];

const ROLE_LINKS = {

    vendedor: [{to: "/mis-publicaciones", label: "mis publicaciones"}],

    administrador: [

        {to: "/usuarios", label: "usuarios"},
        {to: "/administradores", label: "administradores"}

    ],

};

export default function Sidebar ({open, onClose, currentUser, onLogout}) {

    const firstName = currentUser?.fullName?.split(" ")[0] || "";

    const extraLinks = ROLE_LINKS[currentUser?.role] || [];

    return (

        <>

            <div

                className = {`sidebar-overlay ${open ? "visible" : ""}`}

                onClick = {onClose}

                aria-hidden = "true"

            />

            <aside className = {`sidebar ${open ? "open" : ""}`}>
            
                <button className = "sidebar-close" onClick = {onClose} aria-label = "cerrar menu">
                
                    x

                </button>

                <h2 className = "sidebar-greeting">
                
                    Hola{firstName ? `, ${firstName}` : ""}

                </h2>

                <nav className = "sidebar-nav">
                
                    {BASE_LINKS.map((link) => (

                        <Link key = {link.to} to = {link.to} className = "sidebar-link" onClick = {onClose}>

                            {link.label}

                        </Link>

                    ))}

                    {extraLinks.length > 0 && <hr className = "sidebar-divider" />}

                    {extraLinks.map((link) => (

                        <Link key = {link.to} to = {link.to} className = "sidebar-link" onClick = {onClose}>

                            {link.label}

                        </Link>

                    ))}

                </nav>

                <button className = "sidebar-logout" onClick = {onLogout}>
                
                    Cerrar sesión

                </button>

            </aside>

        </>

    );

}