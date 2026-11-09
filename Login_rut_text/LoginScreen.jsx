import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRut, isValidRut } from "../../utils/rut";
import { useAuth } from "../../context/AuthContext";
import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import LoginBrand from "../../components/organisms/LoginBrand/LoginBrand";
import LoginForm from "../../components/organisms/LoginForm/LoginForm";
import "../../styles/Login.css";
import { useEffect } from "react";

export default function LoginScreen () {

    const navigate = useNavigate();
    
    const { login } = useAuth();

    const [values, setValues] = useState({rut: "", password: "", remember: false});

    const [error, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "remember") value = e.target.checked;
        if (field === "rut") value = formatRut(value);

        setValues ((prev) => ({ ...prev, [field]: value }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        console.log ("Intentando iniciar sesión con RUT:", values.rut);

        const newErrors = {};

        if (!isValidRut(values.rut)) newErrors.rut = "Ingrese un RUT valido";
        if (!values.password) newErrors.password = "Ingrese su contraseña";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {

            console.log("Errores de validación: ", newErrors);

            return;

        }

        setLoading(true);

        try {

            const result = login(values.rut, values.password);

            if (!result.ok) {

                console.log("Login fallido: ", result.error);

                setErrors({password: result.error});

                return;

            }

            console.log("Login exitoso, usuario: ", result.user);

            navigate("/home");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        document.tittle = "CompraYa - Iniciar Sesión";

    }, []);

    return (

        <LoginTemplate

            brand = {<LoginBrand />}
            form = {

                <LoginForm

                    values = {values}
                    errors = {error}
                    loading = {loading}
                    onChange = {handleChange}
                    onSubmit = {handleSubmit}

                />

            }

        />

    );

}