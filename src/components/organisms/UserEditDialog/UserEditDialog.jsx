import { useEffect, useState } from "react";
import FormDialog from "../FormDialog/FormDialog";
import FormField from "../../molecules/FormField/FormField";
import MultiTextField from "../../molecules/MultiTextField/MultiTextField";
import AddressListField from "../../molecules/AddressListField/AddressListField";
import { addressToString, createAddress, filledAddresses, stringToAddress, validateAddresses } from "../../../utils/addresses";
import { createEntries, filledValues } from "../../../utils/entries";
import { sanitizeName, sanitizePhone } from "../../../utils/text";
import { validateProfile } from "../../../utils/profileValidation";
import "../../../styles/Login.css";
import "../../../styles/Register.css";

//siempre debe haber al menos una casilla para escribir

const withOne = (list) => (list.length > 0 ? list : [""]);

const FIELD_STYLE = { marginBottom: 16 };

//valor especial del selector para sin empresa

const NO_COMPANY = "none";

//el administrador edita los datos de un cliente vendedor o usuario
//tambien puede asignar a la persona a una empresa con su cargo

export default function UserEditDialog({ open, user, empresas = [], onClose, onSave }) {

    const [values, setValues] = useState({ nombre: "", correo: "", empresaId: NO_COMPANY, cargo: "" });

    const [phones, setPhones] = useState([]);

    const [addresses, setAddresses] = useState([]);

    const [errors, setErrors] = useState({});

    const companyOptions = [

        { value: NO_COMPANY, label: "Sin empresa" },

        ...empresas.map((e) => ({ value: e.id, label: e.nombre })),

    ];

    //cada vez q se abre el formulario aparece cn los datos actuales de la persona

    useEffect(() => {

        if (open && user) {

            //si la empresa asignada ya no existe queda sin empresa

            const exists = empresas.some((e) => String(e.id) === String(user.empresaId));

            setValues({

                nombre: user.nombre ?? "",
                correo: user.correo ?? "",
                empresaId: exists ? empresas.find((e) => String(e.id) === String(user.empresaId)).id : NO_COMPANY,
                cargo: exists ? user.cargo ?? "" : "",

            });

            setPhones(createEntries(withOne(user.phones ?? [])));

            const saved = (user.addresses ?? []).map(stringToAddress);

            setAddresses(saved.length > 0 ? saved : [createAddress()]);

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

    //al quedar sin empresa el cargo se borra

    const handleCompanyChange = (e) => {

        const empresaId = e.target.value;

        setValues((prev) => ({ ...prev, empresaId, cargo: empresaId === NO_COMPANY ? "" : prev.cargo }));

    };

    const handleCargoChange = (e) => {

        setValues((prev) => ({ ...prev, cargo: e.target.value }));

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

        const newErrors = validateProfile({ fullName: values.nombre, email: values.correo }, phones, []);

        const addressErrors = validateAddresses(addresses, { required: false });

        if (Object.keys(addressErrors).length > 0) newErrors.addresses = addressErrors;

        if (Object.keys(newErrors).length > 0) {

            setErrors(newErrors);

            return;

        }

        const hasCompany = values.empresaId !== NO_COMPANY;

        onSave({

            nombre: values.nombre.trim(),
            correo: values.correo.trim(),
            phones: filledValues(phones),
            addresses: filledAddresses(addresses).map(addressToString),
            empresaId: hasCompany ? values.empresaId : "",
            cargo: hasCompany ? values.cargo.trim() : "",

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

            <p style={FIELD_STYLE}><strong>RUT:</strong> {user?.rut}</p>

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
                    placeholder="Ej: +56994738390"
                    sanitize={sanitizePhone}
                    entries={phones}
                    onChange={handlePhonesChange}
                    errors={errors.phones}

                />

            </div>

            <div style={FIELD_STYLE}>

                <AddressListField

                    idPrefix="user-address"
                    addresses={addresses}
                    onChange={handleAddressesChange}
                    errors={errors.addresses}

                />

            </div>

            <div className="form-dialog__section">Empresa</div>

            <p style={{ fontSize: "0.85rem", margin: "0 0 12px" }}>

                Al asignar una empresa, la persona también recibe el rol de vendedor para ver &quot;Mi Empresa&quot;.

            </p>

            <div style={FIELD_STYLE}>

                <FormField

                    id="user-empresa"
                    label="Empresa donde trabaja"
                    placeholder="Selecciona empresa"
                    options={companyOptions}
                    value={values.empresaId}
                    onChange={handleCompanyChange}

                />

            </div>

            {values.empresaId !== NO_COMPANY && (

                <FormField

                    id="user-cargo"
                    label="Cargo"
                    placeholder="Ej: Vendedor de tienda"
                    value={values.cargo}
                    onChange={handleCargoChange}

                />

            )}

        </FormDialog>

    );

}