import logo from "../../../assets/logo.png";

export default function LoginBrand ({ title = "Iniciar Sesión" }) {

    return (
    
        <>
        
            <img src = {logo} alt = "CompraYa" className = "login-brand__logo" />

            <h1 className = "login-brand__title">{title}</h1>

        </>
    
    );

}