import { useEffect, useState } from "react";
import FormDialog from "../FormDialog/FormDialog";
import FormField from "../../molecules/FormField/FormField";
import { REGIONES, getComunas, getRegion } from "../../../data/chile";
import { formatRut, isSuspiciousRut, isValidRut } from "../../../utils/rut";
import { sanitizeName, sanitizePhone } from "../../../utils/text";
import { isValidEmail, isValidPhone, isValidWebsite } from "../../../utils/validators";

const EMPTY_VALUES = {

    nombre: "",
    rut: "",
    paginaWeb: "",
    telefono: "",
    correo: "",
    direccion: "",
    regionId: "",
    comuna: "",
    emprendedorNombre: "",
    emprendedorDireccion: "",
    emprendedorCargo: "",
    emprendedorTelefono: "",
    emprendedorCorreo: "",

};

const REGION_OPTIONS = REGIONES.map((r) => ({ value: r.id, label: r.nombre }));

const REQUIRED = "Campo obligatorio.";

// Devuelve un mensaje por cada campo q este mal

function validate(values) {

    const errors = {};

    if (!values.nombre.trim()) errors.nombre = REQUIRED;

    if (!values.rut) errors.rut = REQUIRED;

    else if (!isValidRut(values.rut)) errors.rut = "Ingrese un RUT válido.";

    else if (isSuspiciousRut(values.rut)) errors.rut = "Ingrese un RUT real, no uno de ejemplo.";

    if (values.paginaWeb.trim() && !isValidWebsite(values.paginaWeb)) {

        errors.paginaWeb = "Ingrese una página válida, por ejemplo www.empresa.cl.";

    }

    if (values.telefono && !isValidPhone(values.telefono)) {

        errors.telefono = "Ingrese un teléfono válido.";

    }

    if (!values.correo.trim()) errors.correo = REQUIRED;

    else if (!isValidEmail(values.correo)) errors.correo = "Ingrese un correo válido.";

    if (!values.regionId) errors.regionId = REQUIRED;

    if (!values.comuna) errors.comuna = REQUIRED;

    if (!values.emprendedorNombre.trim()) {

        errors.emprendedorNombre = REQUIRED;

    } else if (values.emprendedorNombre.trim().split(/\s+/).length < 2) {

        errors.emprendedorNombre = "Ingrese nombre y apellido.";

    }

    if (values.emprendedorTelefono && !isValidPhone(values.emprendedorTelefono)) {

        errors.emprendedorTelefono = "Ingrese un teléfono válido.";

    }

    if (values.emprendedorCorreo.trim() && !isValidEmail(values.emprendedorCorreo)) {

        errors.emprendedorCorreo = "Ingrese un correo válido.";

    }

    return errors;

}

export default function EmpresaFormDialog({ open, onClose, onSave }) {

    const [values, setValues] = useState(EMPTY_VALUES);

    const [errors, setErrors] = useState({});

    //cada vez que se abre, el formulario aparece vacio

    useEffect(() => {

        if (open) {

            setValues(EMPTY_VALUES);

            setErrors({});

        }

    }, [open]);

    //devuelve una funcion distinta segun el campo, y limpia lo que no se puede escribir

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "rut") value = formatRut(value);

        if (field === "telefono" || field === "emprendedorTelefono") value = sanitizePhone(value);

        if (field === "emprendedorNombre") value = sanitizeName(value);

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

            console.log("Errores de validación (empresa):", newErrors);

            setErrors(newErrors);

            return;

        }

        const result = onSave({

            nombre: values.nombre.trim(),
            rut: values.rut,
            paginaWeb: values.paginaWeb.trim(),
            telefono: values.telefono,
            correo: values.correo.trim(),
            direccion: values.direccion.trim(),
            region: getRegion(values.regionId).nombre,
            comuna: values.comuna,
            emprendedor: {

                nombre: values.emprendedorNombre.trim(),
                direccion: values.emprendedorDireccion.trim(),
                cargo: values.emprendedorCargo.trim(),
                telefono: values.emprendedorTelefono,
                correo: values.emprendedorCorreo.trim(),

            },

        });

        if (!result.ok) {

            setErrors({ rut: result.error });

            return;

        }

        onClose();

    };

    return (

        <FormDialog open={open} onClose={onClose} onSubmit={handleSubmit} submitLabel="Guardar Empresa">

            <div className="form-grid">

                <FormField

                    id="empresa-nombre"
                    label="Nombre de la Empresa"
                    required
                    placeholder="Ej: Los Lagos Spa"
                    value={values.nombre}
                    onChange={handleChange("nombre")}
                    error={errors.nombre}

                />

                <FormField

                    id="empresa-rut"
                    label="Rut"
                    required
                    placeholder="Ej: 70.553.459-7"
                    value={values.rut}
                    onChange={handleChange("rut")}
                    error={errors.rut}

                />

                <FormField

                    id="empresa-web"
                    label="Página Web"
                    placeholder="Ej: www.empresa.cl"
                    value={values.paginaWeb}
                    onChange={handleChange("paginaWeb")}
                    error={errors.paginaWeb}

                />

                <FormField

                    id="empresa-telefono"
                    label="Teléfono"
                    type="tel"
                    inputMode="tel"
                    placeholder="Ej: +569 94738390"
                    value={values.telefono}
                    onChange={handleChange("telefono")}
                    error={errors.telefono}

                />

                <FormField

                    id="empresa-correo"
                    label="Correo Electrónico"
                    required
                    type="email"
                    placeholder="Ej: Contacto@empresa.cl"
                    value={values.correo}
                    onChange={handleChange("correo")}
                    error={errors.correo}

                />

                <FormField

                    id="empresa-direccion"
                    label="Dirección Local"
                    placeholder="Ej: Av. Francia 12, Bodega3"
                    value={values.direccion}
                    onChange={handleChange("direccion")}

                />

                <FormField

                    id="empresa-region"
                    label="Región"
                    required
                    placeholder="Selecciona Región"
                    options={REGION_OPTIONS}
                    value={values.regionId}
                    onChange={handleRegionChange}
                    error={errors.regionId}

                />

                <FormField

                    id="empresa-comuna"
                    label="Comuna"
                    required
                    placeholder="Selecciona comuna"
                    options={getComunas(values.regionId).map((c) => ({ value: c, label: c }))}
                    disabled={!values.regionId}
                    value={values.comuna}
                    onChange={handleChange("comuna")}
                    error={errors.comuna}

                />

            </div>

            <div className="form-dialog__section">Información Emprendedor</div>

            <div className="form-grid">

                <FormField

                    id="empresa-emprendedor-nombre"
                    label="Nombre"
                    required
                    placeholder="Ej: Juan Carlos"
                    value={values.emprendedorNombre}
                    onChange={handleChange("emprendedorNombre")}
                    error={errors.emprendedorNombre}

                />

                <FormField

                    id="empresa-emprendedor-direccion"
                    label="Dirección"
                    placeholder="Ej: Av. Laureles 567"
                    value={values.emprendedorDireccion}
                    onChange={handleChange("emprendedorDireccion")}

                />

                <FormField

                    id="empresa-emprendedor-cargo"
                    label="Cargo"
                    placeholder="Ej: Gerente Comercial"
                    value={values.emprendedorCargo}
                    onChange={handleChange("emprendedorCargo")}

                />

                <FormField

                    id="empresa-emprendedor-telefono"
                    label="Teléfono"
                    type="tel"
                    inputMode="tel"
                    placeholder="Ej: +569 98709876"
                    value={values.emprendedorTelefono}
                    onChange={handleChange("emprendedorTelefono")}
                    error={errors.emprendedorTelefono}

                />

                <FormField

                    id="empresa-emprendedor-correo"
                    label="Correo Electrónico"
                    type="email"
                    placeholder="Ej: Juan.gallardo@gmail.com"
                    value={values.emprendedorCorreo}
                    onChange={handleChange("emprendedorCorreo")}
                    error={errors.emprendedorCorreo}

                />

            </div>

        </FormDialog>

    );

}