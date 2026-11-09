import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import LoginBrand from "../../components/organisms/LoginBrand/LoginBrand";
import RegisterForm from '../../components/molecules/RegisterForm/RegisterForm';
import { createEntry, filledValues } from "../../utils/entries";
import { formatRut, isSuspiciousRut, isValidRut } from "../../utils/rut";
import { sanitizeName } from "../../utils/text";
import { isValidEmail, isValidPhone } from "../../utils/validators";
import "../../styles/Login.css";
import "../../styles/Register.css";

const REQUIRED = "Campo obligatorio.";

//la primera casilla no puede quedar vacia
//las casillas extra q quedan vacias se ignoran no son error
//el mismo valor no se puede repetir

function validateEntries(entries, { required, isValid, invalidMessage, duplicateMessage }) {

    const errors = {};

    const seen = new Set();

    entries.forEach((entry, index) => {

        const value = entry.value.trim();

        if (!value) {

            if (required && index === 0) errors[entry.id] = REQUIRED;

            return;

        }

        if (!isValid(value)) {

            errors[entry.id] = invalidMessage;

            return;

        }

        const key = value.toLowerCase().replace(/\s+/g, " ");

        if (seen.has(key)) errors[entry.id] = duplicateMessage;

        seen.add(key);

    });

    return errors;

}

function validate(values, phones, addresses) {

    const errors = {};

    if (!values.rut) errors.rut = REQUIRED;

    else if (!isValidRut(values.rut)) errors.rut = "Ingrese un RUT válido.";

    else if (isSuspiciousRut(values.rut)) errors.rut = "Ingrese un RUT real, no uno de ejemplo.";

    if (!values.fullName.trim()) errors.fullName = REQUIRED;

    else if (values.fullName.trim().split(/\s+/).length < 2) errors.fullName = "Ingrese su nombre y apellido.";

    if (!values.email.trim()) errors.email = REQUIRED;

    else if (!isValidEmail(values.email)) errors.email = "Ingrese un correo válido.";

    const phoneErrors = validateEntries(phones, {

        required: true,
        isValid: isValidPhone,
        invalidMessage: "Ingrese un teléfono válido.",
        duplicateMessage: "Este teléfono ya está agregado.",

    });

    if (Object.keys(phoneErrors).length > 0) errors.phones = phoneErrors;

    //la direccion es opcional si se escribe, tiene q ser una direccion completa

    const addressErrors = validateEntries(addresses, {

        required: false,
        isValid: (value) => value.length >= 5,
        invalidMessage: "Ingrese una dirección completa.",
        duplicateMessage: "Esta dirección ya está agregada.",

    });

    if (Object.keys(addressErrors).length > 0) errors.addresses = addressErrors;

    if (!values.password) errors.password = REQUIRED;

    else if (values.password.length < 8) errors.password = "La contraseña debe tener al menos 8 caracteres.";

    if (!values.confirmPassword) errors.confirmPassword = REQUIRED;

    else if (values.confirmPassword !== values.password) errors.confirmPassword = "Las contraseñas no coinciden.";

    return errors;

}

//aqui esta la logica del registro estado, validacion, crear la cuenta

export default function RegisterScreen() {

    const navigate = useNavigate();

    const { register } = useAuth();

    const [values, setValues] = useState({

        rut: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",

    });

    //los telefonos y las direcciones son listas de casillas parten con una sola

    const [phones, setPhones] = useState(() => [createEntry()]);

    const [addresses, setAddresses] = useState(() => [createEntry()]);

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        document.title = "CompraYa - Crear Cuenta";

    }, []);

    // Devuelve una funcion distinta segun el campo, y limpia lo que no se puede escribir.

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "rut") value = formatRut(value);

        if (field === "fullName") value = sanitizeName(value);

        setValues((prev) => ({ ...prev, [field]: value }));

        setErrors((prev) => ({ ...prev, [field]: undefined }));

    };

    const handlePhonesChange = (next) => {

        setPhones(next);

        setErrors((prev) => ({ ...prev, phones: undefined }));

    };

    const handleAddressesChange = (next) => {

        setAddresses(next);

        setErrors((prev) => ({ ...prev, addresses: undefined }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        //la contrasena nunca se muestra en consola

        console.log("Datos del formulario de registro:", {

            ...values,
            password: "********",
            confirmPassword: "********",
            phones: filledValues(phones),
            addresses: filledValues(addresses),

        });

        const newErrors = validate(values, phones, addresses);

        if (Object.keys(newErrors).length > 0) {

            console.log("Errores de validación en registro:", newErrors);

            setErrors(newErrors);

            return;

        }

        setLoading(true);

        try {

            const result = await register({

                rut: values.rut,
                fullName: values.fullName.trim(),
                email: values.email.trim(),
                phones: filledValues(phones),
                addresses: filledValues(addresses),
                password: values.password,

            });

            if (!result.ok) {

                console.log("Registro fallido:", result.error);

                setErrors({ rut: result.error });

                return;

            }

            console.log("Registro exitoso:", result.user);

            navigate("/");

        } finally {

            setLoading(false);

        }

    };

    return (

        <LoginTemplate

            brand={<LoginBrand title="Crear Cuenta" />}
            form={

                <RegisterForm

                    values={values}
                    phones={phones}
                    addresses={addresses}
                    errors={errors}
                    loading={loading}
                    onChange={handleChange}
                    onPhonesChange={handlePhonesChange}
                    onAddressesChange={handleAddressesChange}
                    onSubmit={handleSubmit}

                />

            }

        />

    );
}