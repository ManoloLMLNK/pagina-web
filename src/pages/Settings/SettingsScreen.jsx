import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import LoginField from "../../components/molecules/LoginField/LoginField";
import MultiTextField from "../../components/molecules/MultiTextField/MultiTextField";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { useAuth } from "../../context/AuthContext";
import { createEntries, filledValues } from "../../utils/entries";
import { sanitizeName, sanitizePhone } from "../../utils/text";
import { validateProfile } from "../../utils/profileValidation";
import "../../styles/Login.css";
import "../../styles/Register.css";

//siempre debe haber al menos una casilla para escribir

const withOne = (list) => (list.length > 0 ? list : [""]);

//aqui el usuario modifica sus propios datos

export default function SettingsScreen() {

    const { currentUser, updateProfile } = useAuth();

    const [values, setValues] = useState({

        fullName: currentUser?.fullName ?? "",
        email: currentUser?.email ?? "",

    });

    //las cuentas antiguas guardaban un solo celu

    const [phones, setPhones] = useState(() =>

        createEntries(withOne(currentUser?.phones ?? (currentUser?.phone ? [currentUser.phone] : [])))

    );

    const [addresses, setAddresses] = useState(() => createEntries(withOne(currentUser?.addresses ?? [])));

    const [errors, setErrors] = useState({});

    const [saved, setSaved] = useState(false);

    useEffect(() => {

        document.title = "CompraYa - Configuración";

    }, []);

    if (!currentUser) return null;

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "fullName") value = sanitizeName(value);

        setValues((prev) => ({ ...prev, [field]: value }));

        setErrors((prev) => ({ ...prev, [field]: undefined }));

        setSaved(false);

    };

    const handlePhonesChange = (next) => {

        setPhones(next);

        setErrors((prev) => ({ ...prev, phones: undefined }));

        setSaved(false);

    };

    const handleAddressesChange = (next) => {

        setAddresses(next);

        setErrors((prev) => ({ ...prev, addresses: undefined }));

        setSaved(false);

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        const newErrors = validateProfile(values, phones, addresses);

        if (Object.keys(newErrors).length > 0) {

            setErrors(newErrors);

            return;

        }

        updateProfile(currentUser.rut, {

            fullName: values.fullName.trim(),
            email: values.email.trim(),
            phones: filledValues(phones),
            addresses: filledValues(addresses),

        });

        setSaved(true);

    };

    return (

        <MainTemplate>

            <h2 className="section-title">Configuración</h2>

            <form

                className="login-screen__form register-form"
                onSubmit={handleSubmit}
                noValidate
                style={{ maxWidth: 480 }}

            >

                <p><strong>RUT:</strong> {currentUser.rut} (no se puede modificar)</p>

                <LoginField

                    id="fullName"
                    label="Nombre completo"
                    placeholder="Ej: Aylin Alexandra Henriquez Castillo"
                    autoComplete="name"
                    value={values.fullName}
                    onChange={handleChange("fullName")}
                    error={errors.fullName}

                />

                <LoginField

                    id="email"
                    label="Correo electrónico"
                    type="email"
                    placeholder="Ej: tralalero.tralala@gmail.com"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange("email")}
                    error={errors.email}

                />

                <MultiTextField

                    id="phone"
                    label="Número de teléfono"
                    entryName="teléfono"
                    type="tel"
                    inputMode="tel"
                    placeholder="Ej: +569 94738390"
                    sanitize={sanitizePhone}
                    entries={phones}
                    onChange={handlePhonesChange}
                    errors={errors.phones}

                />

                <MultiTextField

                    id="address"
                    label="Dirección"
                    entryName="dirección"
                    placeholder="Ej: Av. Francia 12"
                    maxLength={120}
                    entries={addresses}
                    onChange={handleAddressesChange}
                    errors={errors.addresses}

                />

                <CustomButton type="submit">Guardar cambios</CustomButton>

                {saved && <p>Tus datos se actualizaron correctamente.</p>}

                <Link to="/perfil">Volver a mi perfil</Link>

            </form>

        </MainTemplate>

    );

}