import { useState } from "react";
import { Link } from "react-router-dom";
import { formatRut, isValidRut } from "../utils/rut";
import "./Login.css"; //usa estos ajustes para no volver a hacerlo
import "./Register.css"; //usa estos ajustes para no volver a hacerlo
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

const FIELDS = [

    {id: "rut", label: "RUT", type: "text", placeholder: "Ej: 12.345.678-9", autoComplete: "username"},

    {id: "fullName", label: "Nombre completo", type: "text", placeholder: "Ej: Aylin Alexandra Henriquez Castillo", autoComplete: "name"},

    {id: "email", label: "Correo electrónico", type: "email", placeholder: "Ej: tralalero.tralala@gmail.com", autoComplete: "email"},

    {id: "phone", label: "Número de teléfono", type: "tel", placeholder: "Ej: +569 6767 6767", autoComplete: "tel"},

    {id: "password", label: "Contraseña", type: "password", placeholder: "Ingrese su contraseña", autoComplete: "new-password"},

    {id: "confirmPassword", label: "Confirmar contraseña", type: "password", placeholder: "Ingrese su contraseña de nuevo", autoComplete: "new-password"},

];

function validate(form) {

    const errors = {};

    if (!isValidRut(form.rut)) {

        errors.rut = "Ingrese un RUT valido";

    }

    if (form.fullName.trim().split(/\s+/).length < 2) {

        errors.fullName = "Ingrese su nombre y apellido";

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {

        errors.email = "Ingrese un correo valido";

    }

    if (!/^\+?\d{7,15}$/.test(form.phone)) {

        errors.phone = "Ingrese su número de teléfono";

    }

    if (form.password.length < 8) {

        errors.password= "La contraseña debe tener 8 caracteres";

    }

    if (form.confirmPassword !== form.password) {

        errors.confirmPassword = "Las contraseñas deben coincidir";

    }

    return errors;

}

export default function Register() {

        const [form, setForm] = useState({

          rut: "",
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
            
        });

        const [errors, setErrors] = useState({});

        const [loading, setLoading] = useState(false);

        const navigate = useNavigate();

        const { register } = useAuth();

        const handleChange = (e) => {

            const { id, value } = e.target;

            setForm((prev) => ({

                ...prev,

                [id]: id === "rut" ? formatRut(value) : value,

            }));

        };


        const handleSubmit = async (e) => {

            e.preventDefault();

            const newErrors = validate(form);

            setErrors(newErrors);

            if (Object.keys(newErrors).length > 0) return;

            setLoading(true);

            try {

                const result = register(form);

                if (!result.ok) {

                    setErrors({ rut: result.error });

                    return;

                }

                navigate("/");

            } finally {

                setLoading(false);

            }

        };

        return (

            <main className = "login-page">

                <section className = "login-card register-card">

                    <h1 className = "login-title">Crear Cuenta</h1>

                    <form className = "login-form" onSubmit = {handleSubmit} noValidate>

                        {FIELDS.map(({ id, label, type, placeholder, autoComplete}) => (
                        
                            <div className = "field" key ={id}>

                                <label htmlFor = {id} >{label}</label>

                                <input

                                    id = {id}
                                    type = {type}
                                    autoComplete = {autoComplete}
                                    placeholder = {placeholder}
                                    value = {form[id]}
                                    onChange = {handleChange}
                                    aria-invalid = {Boolean(errors[id])}
                                    aria-describedby = {errors[id] ? `${id}-error` : undefined}

                                />

                                {errors[id] && (

                                    <p className = "field-error" id = {`${id}-error`} role = "alert">

                                        {errors[id]}

                                    </p>

                                )}

                            </div>
                        
                        ))}

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

                                <circle cx = "12" cy = "12" r = "10"/>

                                <path d = "M7 12h10" />

                                <path d = "M13 8l4 4-4 4" />

                            </svg>

                            <span>{loading ? "registrando" : "Registrarse"}</span>

                        </button>

                    </form>

                    <p className = "register">

                        ¿Ya tiene cuenta? <Link to = "/">Iniciar sesión</Link>

                    </p>

                </section>

            </main>

        );

}