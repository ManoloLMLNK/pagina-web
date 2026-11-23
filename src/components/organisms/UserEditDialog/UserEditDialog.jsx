import { useEffect, useState } from "react";
import FormDialog from "../FormDialog/FormDialog";
import FormField from "../../molecules/FormField/FormField";
import MultiTextField from "../../molecules/MultiTextField/MultiTextField";
import { createEntries, filledValues } from "../../../utils/entries";
import { sanitizeName, sanitizePhone } from "../../../utils/text";
import { validateProfile } from "../../../utils/profileValidation";
import "../../../styles/Login.css";
import "../../../styles/Register.css";

//siempre debe haber al menos una casilla para escribir

const withOne = (list) => (list.length > 0 ? list : [""]);

const FIELD_STYLE = { marginBottom: 16 };

//el administrador edita los datos de un cliente, vendedor o usuario
//(el rut y la contraseña no se pueden cambiar desde aqui)

export default function UserEditDialog({ open, user, onClose, onSave }) {

    const [values, setValues] = useState({ nombre: "", correo: "" });

    const [phones, setPhones] = useState([]);

    const [addresses, setAddresses] = useState([]);

    const [errors, setErrors] = useState({});

    //cada vez q se abre, el formulario aparece con los datos actuales de la persona

    useEffect(() => {

        if (open && user) {

            setValues({ nombre: user.nombre ?? "", correo: user.correo ?? "" });

            setPhones(createEntries(withOne(user.phones ?? [])));

            setAddresses(createEntries(withOne(user.addresses ?? [])));

            setErrors({});

        }

    }, [open, user]);

    const handleNameChange = (e) => {

        setValues((prev) => ({ ...prev, nombre: sanitizeName(e.target.value) }));

        setErrors((prev) => ({ ...prev, fullName: undefined }));

    };

    const handleEmailChange = (e) => {

        setValues((prev) => ({ ...prev, correo: e.target.value }));

        setErrors((prev) => ({ ...prev, email: undefined }));

    };

    const handlePhonesChange = (next) => {

        setPhones(next);

        setErrors((prev) => ({ ...prev, phones: undefined }));

    };

    const handleAddressesChange = (next) => {

        setAddresses(next);

        setErrors((prev) => ({ ...prev, addresses: undefined }));

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        //son las mismas validaciones del registro

        const newErrors = validateProfile({ fullName: values.nombre, email: values.correo }, phones, addresses);

        if (Object.keys(newErrors).length > 0) {

            setErrors(newErrors);

            return;

        }

        onSave({

            nombre: values.nombre.trim(),
            correo: values.correo.trim(),
            phones: filledValues(phones),
            addresses: filledValues(addresses),

        });

    };

    return (

        <FormDialog

            open={open}
            onClose={onClose}
            onSubmit={handleSubmit}
            title="Editar datos"
            submitLabel="Guardar Cambios"
            maxWidth="sm"

        >

            <p style={FIELD_STYLE}><strong>RUT:</strong> {user?.rut} (no se puede modificar)</p>

            <div style={FIELD_STYLE}>

                <FormField

                    id="user-nombre"
                    label="Nombre completo"
                    required
                    placeholder="Ej: Juan Pérez"
                    value={values.nombre}
                    onChange={handleNameChange}
                    error={errors.fullName}

                />

            </div>

            <div style={FIELD_STYLE}>

                <FormField

                    id="user-correo"
                    label="Correo Electrónico"
                    required
                    type="email"
                    placeholder="Ej: contacto@correo.cl"
                    value={values.correo}
                    onChange={handleEmailChange}
                    error={errors.email}

                />

            </div>

            <div style={FIELD_STYLE}>

                <MultiTextField

                    id="user-phone"
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

            </div>

            <MultiTextField

                id="user-address"
                label="Dirección"
                entryName="dirección"
                placeholder="Ej: Av. Francia 12"
                maxLength={120}
                entries={addresses}
                onChange={handleAddressesChange}
                errors={errors.addresses}

            />

        </FormDialog>

    );

}