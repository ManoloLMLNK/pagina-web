import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRut, isValidRut } from "../../utils/rut";
import { homePathFor } from "../../utils/homePath";
import { useAuth } from "../../context/AuthContext";
import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import LoginBrand from "../../components/organisms/LoginBrand/LoginBrand";
import LoginForm from "../../components/organisms/LoginForm/LoginForm";
import "../../styles/Login.css";

//la logica estado validacion inicio de sesion

export default function LoginScreen() {

    const navigate = useNavigate();

    const { login, currentUser } = useAuth();

    const [values, setValues] = useState({ rut: "", password: "", remember: false });

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        document.title = "CompraYa - Iniciar Sesión";

    }, []);

    //si ya hay una sesion iniciada no se muestra el login va directo a su pantalla de inicio

    useEffect(() => {

        if (currentUser) navigate(homePathFor(currentUser), { replace: true });

    }, [currentUser, navigate]);

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "remember") value = e.target.checked;

        if (field === "rut") value = formatRut(value);

        setValues((prev) => ({ ...prev, [field]: value }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        console.log("Intentando iniciar sesión con RUT:", values.rut);

        const newErrors = {};

        if (!isValidRut(values.rut)) newErrors.rut = "Ingrese un RUT válido.";

        if (!values.password) newErrors.password = "Ingrese su contraseña.";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {

            console.log("Errores de validación:", newErrors);

            return;

        }

        setLoading(true);

        try {

            const result = await login(values.rut, values.password);

            if (!result.ok) {

                console.log("Login fallido:", result.error);

                setErrors({ password: result.error });

                return;

            }

            //solo se muestra el RUT y el rol nunca los demas datos de la persona

            console.log("Login exitoso:", { rut: result.user.rut, role: result.user.role });

            navigate(homePathFor(result.user));

        } finally {

            setLoading(false);

        }

    };

    return (

        <LoginTemplate

            brand={<LoginBrand />}
            form={

                <LoginForm

                    values={values}
                    errors={errors}
                    loading={loading}
                    onChange={handleChange}
                    onSubmit={handleSubmit}

                />

            }

        />

    );

}