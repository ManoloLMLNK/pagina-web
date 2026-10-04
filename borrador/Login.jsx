import {useState} from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import { formatRut, isValidRut } from "../utils/rut";
import { useNavigate } from "react-router-dom";
import {useAuth } from "../context/AuthContext"

//segun lo q lei de opiniones de otros programadores, es mejor
//hacer los nombres de algunas cosas si esq no todas
//en ingles, porq? porq si alguien mas q no sepa español
//vea el codigo lo pueda entender (aunq sea un trabajo pa la U pipipipipipipi)

//esto hace un filtro para q no se hagan ruts falsos
//osea solo numeros y la letra k, tambien hace que se añada
//un punto cada 3 numros ingresados, y un gion antes de digito
//verificador sisi

//function formatRut(value)

//esta parte es para verificar si el rut
//es valido, osea mas q nd veridica el digito
//verificador para ver si no hay un error en esa parte
//pero ademas revisa todo el rut por si acaso

//function isValidRut(rut)

export default function Login() {

    const [rut, setRut] = useState("");

    const [password, setPassword] = useState("");

    const [remember, setRemember] = useState(false);

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        const newErrors = {};

        if(!isValidRut(rut)) newErrors.rut = "Ingrese un RUT valido";

        if (!password) newErrors.password = "Ingrese su contraseña";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);

        try {

            const result = login(rut, password);

            if (!result.ok) {

                setErrors({ password: result.error })

                return;

            }

            navigate("/home")

        } finally {

            setLoading(false);

        }

    };

    return (

        <main className = "login-page">

            <section className = "login-card">

                <h1 className = "login-title">Iniciar Sesion</h1>

                <form className = "login-form" onSubmit = {handleSubmit} noValidate>
                    
                    <div className = "field">

                        <label htmlFor = "rut">Rut</label>

                        <input
                            
                            id = "rut"
                            type = "text"
                            inputMode = "text"
                            autoComplete = "username"
                            placeholder = "Ej: 12.345.678-9"
                            value = {rut}
                            onChange = {(e) => setRut(formatRut(e.target.value))}
                            aria-invalid = {Boolean(errors.rut)}
                            aria-describedby = {errors.rut ? "rut-error" : undefined}

                        />

                        {errors.rut && (

                            <p className = "field-error" id = "rut-error" role = "alert">

                                {errors.rut}

                            </p>

                        )}

                    </div>

                    <div className = "field">

                        <label htmlFor = "password">Contraseña</label>

                        <div className = "password-wrapper">

                        <input

                            id = "password"
                            type = {showPassword ? "text" : "password"}
                            autoComplete = "current-password"
                            placeholder = "Ingrese su contraseña"
                            value = {password}
                            onChange = {(e) => setPassword(e.target.value)}
                            aria-invalid = {Boolean(errors.password)}
                            aria-describedby = {errors.password ? "password-error" : undefined}
                        />

                        <button

                            type = "button"
                            className = "toggle-password"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label = {showPassword ? "ocultar contraseña" : "mostrar contraseña"}
                        
                        >

                            {showPassword ? "oculto" : "ver"}

                        </button>

                    </div>

                    {errors.password && (

                        <p className = "field-error" id = "password-error" role="alert">

                            {errors.password}

                        </p>

                    )}

                    </div>

                <div className = "login-options">

                        <label className = "remember">

                            <input

                                type = "checkbox"

                                checked = {remember}

                                onChange = {(e) => setRemember(e.target.checked)}

                            />

                            <span>Recordarme</span>

                            </label>

                            <a className = "forgot" href = "/recuperar-contraseña">
                            
                            ¿Olvido su contraseña?

                            </a>
                        
                        </div>

                        <button className = "login-button" type = "submit" disabled = {loading}>

                            <svg

                                width = "26"
                                height = "26"
                                viewBox = "0 0 24 24"
                                fill = "none"
                                stroke = "currentColor"
                                strokeWidth = "1.6"
                                strokeLinecap = "round"
                                strokeLinejoin = "round"
                                aria-hidden = "true"
                            
                            >

                                <circle cx = "12" cy = "12" r = "10" />
                                <path d = "M7 12h10" />
                                <path d = "M13 8l4 4-4 4" />
                            
                            </svg>

                            <span>{loading ? "Iniciando sesion" : "Iniciar Sesion"}</span>

                        </button>

                    </form>

                    <p className = "register">

                        ¿no tienes cuenta? <Link to = "/registro">Registrate</Link>

                    </p>
                
            </section>
        </main>

    )

};