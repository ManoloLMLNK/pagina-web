import { useEffect, useState } from "react";
import FormDialog from "../FormDialog/FormDialog";
import FormField from "../../molecules/FormField/FormField";
import { TIPOS, findCategory, getCategories } from "../../../data/catalog";
import { fileToDataUrl } from "../../../utils/images";

const MAX_IMAGES = 3;

const REQUIRED = "Campo obligatorio.";

const EMPTY_VALUES = {

    name: "",
    categoria: "",
    subcategoria: "",
    price: "",
    stock: "",
    description: "",

};

//convierte una publicacion guardada en los valores del formulario (para editarla)

function toFormValues(publication) {

    if (!publication) return EMPTY_VALUES;

    return {

        name: publication.name ?? "",
        categoria: publication.categoria ?? "",
        subcategoria: publication.subcategoria ?? "",
        price: String(publication.price ?? ""),
        stock: publication.stock === undefined ? "" : String(publication.stock),
        description: publication.description ?? "",

    };

}

const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 9);

function validate(values, { isProduct, hasSubcategories }) {

    const errors = {};

    if (values.name.trim().length < 3) errors.name = "Ingrese un nombre de al menos 3 caracteres.";

    if (!values.categoria) errors.categoria = REQUIRED;

    if (hasSubcategories && !values.subcategoria) errors.subcategoria = REQUIRED;

    if (!values.price || Number(values.price) <= 0) errors.price = "Ingrese un precio mayor a 0.";

    if (isProduct && values.stock === "") errors.stock = REQUIRED;

    if (!values.description.trim()) errors.description = REQUIRED;

    return errors;

}

//formulario para publicar o editar un producto o servicio

export default function PublicationFormDialog({ open, tipo, publication, onClose, onSave }) {

    const [values, setValues] = useState(EMPTY_VALUES);

    const [images, setImages] = useState([]);

    const [errors, setErrors] = useState({});

    const [loadingImages, setLoadingImages] = useState(false);

    const itemLabel = TIPOS[tipo]?.itemLabel ?? "Publicación";

    const isProduct = tipo === "productos";

    //cada vez que se abre, el formulario aparece vacio (o con los datos de lo q se edita)

    useEffect(() => {

        if (open) {

            setValues(toFormValues(publication));

            setImages(publication?.images ?? []);

            setErrors({});

        }

    }, [open, publication]);

    const categoryOptions = getCategories(tipo).map((c) => ({ value: c.id, label: c.label }));

    const subcategoryOptions = (findCategory(tipo, values.categoria)?.subcategories ?? []).map((s) => ({

        value: s.id,
        label: s.label,

    }));

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "price" || field === "stock") value = onlyDigits(value);

        setValues((prev) => ({ ...prev, [field]: value }));

        setErrors((prev) => ({ ...prev, [field]: undefined }));

    };

    //al cambiar de categoria, la subcategoria elegida ya no sirve y se borra

    const handleCategoryChange = (e) => {

        setValues((prev) => ({ ...prev, categoria: e.target.value, subcategoria: "" }));

        setErrors((prev) => ({ ...prev, categoria: undefined, subcategoria: undefined }));

    };

    const handleFiles = async (e) => {

        const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - images.length);

        e.target.value = "";

        if (files.length === 0) return;

        setLoadingImages(true);

        try {

            const urls = await Promise.all(files.map((file) => fileToDataUrl(file)));

            setImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));

            setErrors((prev) => ({ ...prev, images: undefined }));

        } catch (error) {

            setErrors((prev) => ({ ...prev, images: error.message }));

        } finally {

            setLoadingImages(false);

        }

    };

    const handleRemoveImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = (e) => {

        e.preventDefault();

        if (loadingImages) return;

        const newErrors = validate(values, { isProduct, hasSubcategories: subcategoryOptions.length > 0 });

        if (Object.keys(newErrors).length > 0) {

            setErrors(newErrors);

            return;

        }

        const result = onSave({

            tipo,
            name: values.name.trim(),
            categoria: values.categoria,
            subcategoria: values.subcategoria,
            price: Number(values.price),
            ...(isProduct ? { stock: Number(values.stock) } : {}),
            description: values.description.trim(),
            images,

        });

        if (!result.ok) {

            setErrors({ general: result.error });

            return;

        }

        onClose();

    };

    return (

        <FormDialog

            open={open}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={publication ? `Editar ${itemLabel.toLowerCase()}` : `Nuevo ${itemLabel.toLowerCase()}`}
            submitLabel={publication ? "Guardar Cambios" : `Publicar ${itemLabel}`}
            maxWidth="sm"

        >

            {errors.general && <p role="alert" style={{ color: "#d32f2f" }}>{errors.general}</p>}

            <div className="form-grid">

                <FormField

                    id="pub-name"
                    label={`Nombre del ${itemLabel.toLowerCase()}`}
                    required
                    placeholder="Ej: Audífonos Bluetooth"
                    value={values.name}
                    onChange={handleChange("name")}
                    error={errors.name}

                />

                <FormField

                    id="pub-categoria"
                    label="Categoría"
                    required
                    placeholder="Selecciona categoría"
                    options={categoryOptions}
                    value={values.categoria}
                    onChange={handleCategoryChange}
                    error={errors.categoria}

                />

                <FormField

                    id="pub-subcategoria"
                    label="Subcategoría"
                    required={subcategoryOptions.length > 0}
                    placeholder={subcategoryOptions.length > 0 ? "Selecciona subcategoría" : "Sin subcategorías"}
                    options={subcategoryOptions}
                    disabled={subcategoryOptions.length === 0}
                    value={values.subcategoria}
                    onChange={handleChange("subcategoria")}
                    error={errors.subcategoria}

                />

                <FormField

                    id="pub-price"
                    label="Precio (CLP)"
                    required
                    inputMode="numeric"
                    placeholder="Ej: 24990"
                    value={values.price}
                    onChange={handleChange("price")}
                    error={errors.price}

                />

                {isProduct && (

                    <FormField

                        id="pub-stock"
                        label="Stock (unidades)"
                        required
                        inputMode="numeric"
                        placeholder="Ej: 20"
                        value={values.stock}
                        onChange={handleChange("stock")}
                        error={errors.stock}

                    />

                )}

            </div>

            <div style={{ marginTop: 16 }}>

                <label htmlFor="pub-description" style={{ display: "block", marginBottom: 4 }}>

                    Descripción *

                </label>

                <textarea

                    id="pub-description"
                    rows={4}
                    maxLength={500}
                    placeholder={`Describe tu ${itemLabel.toLowerCase()}`}
                    value={values.description}
                    onChange={handleChange("description")}
                    style={{ width: "100%", boxSizing: "border-box", padding: 8, borderRadius: 8, border: "1px solid #ccc", font: "inherit" }}

                />

                {errors.description && (

                    <p role="alert" style={{ color: "#d32f2f", margin: "4px 0 0", fontSize: "0.8rem" }}>

                        {errors.description}

                    </p>

                )}

            </div>

            <div style={{ marginTop: 16 }}>

                <p style={{ margin: "0 0 8px" }}>Fotos (hasta {MAX_IMAGES})</p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>

                    {images.map((src, i) => (

                        <div key={i} style={{ textAlign: "center" }}>

                            <img

                                src={src}
                                alt={`Foto ${i + 1}`}
                                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }}

                            />

                            <div>

                                <button type="button" onClick={() => handleRemoveImage(i)} aria-label={`Quitar foto ${i + 1}`}>

                                    Quitar

                                </button>

                            </div>

                        </div>

                    ))}

                </div>

                {images.length < MAX_IMAGES && (

                    <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={loadingImages} />

                )}

                {loadingImages && <p>Procesando fotos...</p>}

                {errors.images && <p role="alert" style={{ color: "#d32f2f" }}>{errors.images}</p>}

            </div>

        </FormDialog>

    );

}