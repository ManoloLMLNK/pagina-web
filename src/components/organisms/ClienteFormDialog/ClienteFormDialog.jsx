import { useEffect, useState } from "react";
import FormDialog from "../FormDialog/FormDialog";
import FormField from "../../molecules/FormField/FormField";
import { REGIONES, getComunas, getRegion } from "../../../data/chile";
import { formatRut, isSuspiciousRut, isValidRut } from "../../../utils/rut";
import { sanitizeName, sanitizePhone } from "../../../utils/text";
import {
    
    formatDateInput,
    isValidBirthDate,
    isValidEmail,
    isValidPhone,

} from "../../../utils/validators";

const EMPTY_VALUES = {

    nombre: "",
    rut: "",
    fechaNacimiento: "",
    telefono: "",
    correo: "",
    regionId: "",
    comuna: "",
    direccion: "",

};

const REGION_OPTIONS = REGIONES.map((r) => ({ value: r.id, label: r.nombre }));

const REQUIRED = "Campo obligatorio.";

//devuelve un objeto con un mensaje por cada campo q este mal

function validate(values) {

    const errors = {};

    if (!values.nombre.trim()) errors.nombre = REQUIRED;

    else if (values.nombre.trim().split(/\s+/).length < 2) errors.nombre = "Ingrese nombre y apellido.";

    if (!values.rut) errors.rut = REQUIRED;

    else if (!isValidRut(values.rut)) errors.rut = "Ingrese un RUT válido.";

    else if (isSuspiciousRut(values.rut)) errors.rut = "Ingrese un RUT real, no uno de ejemplo.";

    if (!values.fechaNacimiento) errors.fechaNacimiento = REQUIRED;

    else if (!isValidBirthDate(values.fechaNacimiento)) {

        errors.fechaNacimiento = "Ingrese una fecha válida (DD/MM/AAAA).";

    }

    if (!values.telefono) errors.telefono = REQUIRED;

    else if (!isValidPhone(values.telefono)) errors.telefono = "Ingrese un teléfono válido.";

    if (values.correo.trim() && !isValidEmail(values.correo)) {

        errors.correo = "Ingrese un correo válido.";

    }

    if (!values.regionId) errors.regionId = REQUIRED;

    if (!values.comuna) errors.comuna = REQUIRED;

    return errors;

}

//el formulario "Información General" de un cliente

export default function ClienteFormDialog({ open, onClose, onSave }) {

    const [values, setValues] = useState(EMPTY_VALUES);

    const [errors, setErrors] = useState({});

//cada vez q se abre, el formulario parte vacio

    useEffect(() => {

        if (open) {

            setValues(EMPTY_VALUES);

            setErrors({});

        }

    }, [open]);

    //devuelve una funcion distinta segun el campo, y limpia lo que no se puede escribir.

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "rut") value = formatRut(value);

        if (field === "nombre") value = sanitizeName(value);

        if (field === "telefono") value = sanitizePhone(value);

        if (field === "fechaNacimiento") value = formatDateInput(value);
        
        setValues((prev) => ({ ...prev, [field]: value }));

        setErrors((prev) => ({ ...prev, [field]: undefined }));

    };

    //al cambiar de region, la comuna elegida ya no sirve y se borra

    const handleRegionChange = (e) => {

        setValues((prev) => ({ ...prev, regionId: e.target.value, comuna: "" }));

        setErrors((prev) => ({ ...prev, regionId: undefined, comuna: undefined }));

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        const newErrors = validate(values);

        if (Object.keys(newErrors).length > 0) {

            console.log("Errores de validación (cliente):", newErrors);

            setErrors(newErrors);

            return;

        }

        const result = onSave({

            nombre: values.nombre.trim(),
            rut: values.rut,
            fechaNacimiento: values.fechaNacimiento,
            telefono: values.telefono,
            correo: values.correo.trim(),
            region: getRegion(values.regionId).nombre,
            comuna: values.comuna,
            direccion: values.direccion.trim(),

        });

        if (!result.ok) {

            setErrors({ rut: result.error });

            return;

        }

        onClose();

    };

    return (

        <FormDialog

            open={open}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel="Guardar Cliente"
            maxWidth="sm"

        >

            <div className="form-grid form-grid--2">

                <FormField

                    id="cliente-nombre"
                    label="Nombre"
                    required
                    placeholder="Ej: Juan Carlos"
                    value={values.nombre}
                    onChange={handleChange("nombre")}
                    error={errors.nombre}

                />

                <FormField

                    id="cliente-rut"
                    label="Rut"
                    required
                    placeholder="Ej: 15.553.459-7"
                    value={values.rut}
                    onChange={handleChange("rut")}
                    error={errors.rut}

                />

                <FormField

                    id="cliente-nacimiento"
                    label="Fecha de Nacimiento"
                    required
                    inputMode="numeric"
                    placeholder="Ej: 18/04/2005"
                    value={values.fechaNacimiento}
                    onChange={handleChange("fechaNacimiento")}
                    error={errors.fechaNacimiento}

                />

                <FormField

                    id="cliente-telefono"
                    label="Teléfono"
                    required
                    type="tel"
                    inputMode="tel"
                    placeholder="Ej: +569 94738390"
                    value={values.telefono}
                    onChange={handleChange("telefono")}
                    error={errors.telefono}

                />

                <FormField

                    id="cliente-correo"
                    label="Correo Electrónico"
                    type="email"
                    placeholder="Ej: Contacto@gmail.com"
                    value={values.correo}
                    onChange={handleChange("correo")}
                    error={errors.correo}

                />

                <FormField

                    id="cliente-region"
                    label="Región"
                    required
                    placeholder="Selecciona Región"
                    options={REGION_OPTIONS}
                    value={values.regionId}
                    onChange={handleRegionChange}
                    error={errors.regionId}

                />

                <FormField

                    id ="cliente-comuna"
                    label="Comuna"
                    required
                    placeholder="Selecciona comuna"
                    options={getComunas(values.regionId).map((c) => ({ value: c, label: c }))}
                    disabled={!values.regionId}
                    value={values.comuna}
                    onChange={handleChange("comuna")}
                    error={errors.comuna}

                />

                <FormField

                    id="cliente-direccion"
                    label="Dirección de Despacho"
                    placeholder="Ej: Av. Francia 12"
                    value={values.direccion}
                    onChange={handleChange("direccion")}

                />

            </div>

        </FormDialog>

    );

}