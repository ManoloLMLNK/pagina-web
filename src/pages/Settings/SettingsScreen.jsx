import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import LoginField from "../../components/molecules/LoginField/LoginField";
import MultiTextField from "../../components/molecules/MultiTextField/MultiTextField";
import AddressListField from "../../components/molecules/AddressListField/AddressListField";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { useAuth } from "../../context/AuthContext";
import { addressToString, createAddress, filledAddresses, stringToAddress, validateAddresses } from "../../utils/addresses";
import { birthDateError, getAge } from "../../utils/age";
import { createEntries, filledValues } from "../../utils/entries";
import { homePathFor } from "../../utils/homePath";
import { sanitizeName, sanitizePhone } from "../../utils/text";
import { validateProfile } from "../../utils/profileValidation";
import { formatDateInput } from "../../utils/validators";
import "../../styles/Login.css";
import "../../styles/Register.css";

//siempre debe haber al menos una casilla para escribir

const withOne = (list) => (list.length > 0 ? list : [""]);

//aqui el usuario modifica sus propios datos

export default function SettingsScreen() {

    const { currentUser, updateProfile } = useAuth();

    const location = useLocation();

    const navigate = useNavigate();

    //ProtectedRoute manda aqui a las cuentas q todavia no tienen fecha de nacimiento

    const mustCompleteBirthDate = Boolean(location.state?.missingBirthDate);

    const [values, setValues] = useState({

        fullName: currentUser?.fullName ?? "",
        email: currentUser?.email ?? "",
        birthDate: "",

    });

    //las cuentas antiguas guardaban un solo celu

    const [phones, setPhones] = useState(() =>

        createEntries(withOne(currentUser?.phones ?? (currentUser?.phone ? [currentUser.phone] : [])))

    );

    //las direcciones guardadas se separan otra vez en calle region comuna
    //las antiguas de texto libre quedan solo con la calle y piden completar region y comuna

    const [addresses, setAddresses] = useState(() => {

        const saved = (currentUser?.addresses ?? []).map(stringToAddress);

        return saved.length > 0 ? saved : [createAddress()];

    });

    const [errors, setErrors] = useState({});

    const [saved, setSaved] = useState(false);

    useEffect(() => {

        document.title = "CompraYa - Configuración";

    }, []);

    if (!currentUser) return null;

    //la fecha de nacimiento solo se puede escribir si la cuenta todavia no la tiene

    const hasBirthDate = Boolean(currentUser.birthDate);

    //los compradores deben tener al menos una direccion de despacho

    const addressRequired = (currentUser.roles ?? [currentUser.role]).includes("comprador");

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "fullName") value = sanitizeName(value);

        if (field === "birthDate") value = formatDateInput(value);

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

    //AuthContext avisa cual campo choca el correo o un telefono q ya es de otra cuenta

    const showSaveError = (result) => {

        if (result.field === "phones") {

            const entry = phones.find((p) => p.value.trim() === String(result.value).trim());

            setErrors({ phones: { [(entry ?? phones[0]).id]: result.error } });

            return;

        }

        setErrors({ [result.field ?? "email"]: result.error });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        //las direcciones ya no son casillas de texto se validan aparte

        const newErrors = validateProfile(values, phones, []);

        const addressErrors = validateAddresses(addresses, { required: addressRequired });

        if (Object.keys(addressErrors).length > 0) newErrors.addresses = addressErrors;

        if (!hasBirthDate) {

            const birthError = birthDateError(values.birthDate);

            if (birthError) newErrors.birthDate = birthError;

        }

        if (Object.keys(newErrors).length > 0) {

            setErrors(newErrors);

            return;

        }

        const result = updateProfile(currentUser.rut, {

            fullName: values.fullName.trim(),
            email: values.email.trim(),
            phones: filledValues(phones),
            addresses: filledAddresses(addresses).map(addressToString),
            ...(hasBirthDate ? {} : { birthDate: values.birthDate }),

        });

        if (!result.ok) {

            showSaveError(result);

            return;

        }

        //si venia obligado a completar la fecha sigue a su pantalla de inicio

        if (mustCompleteBirthDate) {

            navigate(homePathFor(currentUser), { replace: true });

            return;

        }

        setSaved(true);

    };

    return (

        <MainTemplate>

            <h2 className="section-title">Configuración</h2>

            {mustCompleteBirthDate && (

                <p role="alert" style={{ maxWidth: 480, color: "#ed6c02" }}>

                    Para seguir usando CompraYa debes completar tu fecha de nacimiento (solo pueden usar la
                    plataforma personas mayores de 18 años).

                </p>

            )}

            <form

                className="login-screen__form register-form"
                onSubmit={handleSubmit}
                noValidate
                style={{ maxWidth: 480 }}

            >

                <p><strong>RUT:</strong> {currentUser.rut}</p>

                {hasBirthDate ? (

                    <p>

                        <strong>Fecha de nacimiento:</strong> {currentUser.birthDate} ({getAge(currentUser.birthDate)} años)

                    </p>

                ) : (

                    <LoginField

                        id="birthDate"
                        label="Fecha de nacimiento"
                        placeholder="Ej: 18/04/2005"
                        autoComplete="off"
                        value={values.birthDate}
                        onChange={handleChange("birthDate")}
                        error={errors.birthDate}

                    />

                )}

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
                    placeholder="Ej: +56994738390"
                    sanitize={sanitizePhone}
                    entries={phones}
                    onChange={handlePhonesChange}
                    errors={errors.phones}

                />

                <AddressListField

                    idPrefix="settings-address"
                    addresses={addresses}
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