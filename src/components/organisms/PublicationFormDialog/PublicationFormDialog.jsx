import { useEffect, useState } from "react";
import FormDialog from "../FormDialog/FormDialog";
import FormField from "../../molecules/FormField/FormField";
import { MAX_DEPTH, TIPOS, getCategories, getItemPath } from "../../../data/catalog";
import { fileToDataUrl } from "../../../utils/images";

const MAX_IMAGES = 3;

const REQUIRED = "Campo obligatorio.";

const EMPTY_VALUES = {

    name: "",
    path: [],
    size: "",
    weight: "",
    color: "",
    material: "",
    ageRestriction: "18",
    duration: "",
    offerPercent: "",
    offerUntil: "",
    price: "",
    stock: "",
    description: "",

};

//convierte una publicacion guardada en los valores del formulario

function toFormValues(publication) {

    if (!publication) return EMPTY_VALUES;

    return {

        name: publication.name ?? "",
        path: getItemPath(publication),
        size: publication.size ?? "",
        weight: String(publication.weight ?? ""),
        color: publication.color ?? "",
        material: publication.material ?? "",
        ageRestriction: String(publication.ageRestriction ?? "18"),
        duration: publication.duration ?? "",
        offerPercent: String(publication.offer?.percent ?? ""),
        offerUntil: publication.offer?.until ?? "",
        price: String(publication.price ?? ""),
        stock: publication.stock === undefined ? "" : String(publication.stock),
        description: publication.description ?? "",

    };

}

const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 9);

//peso numeros cn hasta un separador decimal

const onlyDecimal = (value) => value.replace(",", ".").replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 8);

const LEVEL_LABELS = ["Categoría", "Subcategoría", "Subcategoría (nivel 3)", "Subcategoría (nivel 4)"];

//un selector por cada nivel q tenga opciones

function categoryLevels(tipo, path) {

    const levels = [];
    
    let list = getCategories(tipo);

    for (let i = 0; i < MAX_DEPTH && list.length > 0; i += 1) {

        const selected = list.find((c) => c.id === path[i]);

        levels.push({ options: list.map((c) => ({ value: c.id, label: c.label })), value: selected?.id ?? "" });
        
        list = selected?.subcategories ?? [];

    }

    return levels;

}

//fecha de hoy como "aaaa-mm-dd"
const todayISO = () => new Date().toLocaleDateString("en-CA");

const inputStyle = { padding: 8, borderRadius: 8, border: "1px solid #ccc", font: "inherit", boxSizing: "border-box" };

function validate(values, { isProduct, levels, variants, previousOffer }) {

    const errors = {};

    if (values.name.trim().length < 3) errors.name = "Ingrese un nombre de al menos 3 caracteres.";

    levels.forEach((level, i) => {

        if (!level.value) errors[`level${i}`] = REQUIRED;

    });

    if (variants.length === 0 && (!values.price || Number(values.price) <= 0)) errors.price = "Ingrese un precio mayor a 0.";

    if (isProduct) {

        if (variants.length === 0 && values.stock === "") errors.stock = REQUIRED;

        const names = variants.map((v) => v.name.trim().toLowerCase());

        if (variants.some((v) => !v.name.trim() || !(Number(v.price) > 0) || v.stock === "")) {

            errors.variants = "Completa nombre, precio y stock de cada variante.";

        } else if (new Set(names).size !== names.length) {

            errors.variants = "Hay variantes con el mismo nombre.";

        }
        
        if (!values.size.trim()) errors.size = REQUIRED;
        
        if (!(Number(values.weight) > 0)) errors.weight = "Ingrese un peso mayor a 0.";
        
        if (!values.color.trim()) errors.color = REQUIRED;
        
        if (!values.material.trim()) errors.material = REQUIRED;

    } else {

        const age = Number(values.ageRestriction);

        if (!(age >= 18 && age <= 99)) errors.ageRestriction = "Ingrese una edad entre 18 y 99.";
        
        if (!values.duration.trim()) errors.duration = REQUIRED;

    }

    if (!values.description.trim()) errors.description = REQUIRED;

    //la oferta es opcional pero si se usa necesita las dos cosas
    
    if (values.offerPercent || values.offerUntil) {

        const percent = Number(values.offerPercent);

        if (!(percent >= 1 && percent <= 90)) errors.offerPercent = "Ingrese un descuento entre 1 y 90.";

        //una oferta ya vencida se puede dejar como estaba
        
        if (!values.offerUntil || (values.offerUntil < todayISO() && values.offerUntil !== previousOffer?.until)) {

            errors.offerUntil = "Elija una fecha desde hoy en adelante.";

        }

    }

    return errors;

}

//formulario para publicar o editar un producto o servicio

export default function PublicationFormDialog({ open, tipo, publication, onClose, onSave }) {

    const [values, setValues] = useState(EMPTY_VALUES);

    const [images, setImages] = useState([]);

    const [variants, setVariants] = useState([]);

    const [errors, setErrors] = useState({});

    const [loadingImages, setLoadingImages] = useState(false);

    const itemLabel = TIPOS[tipo]?.itemLabel ?? "Publicación";

    const isProduct = tipo === "productos";

    //cada vez q se abre el formulario aparece vacio

    useEffect(() => {

        if (open) {

            setValues(toFormValues(publication));

            setImages(publication?.images ?? []);

            setVariants((publication?.variants ?? []).map((v) => ({ ...v, price: String(v.price), stock: String(v.stock) })));

            setErrors({});

        }

    }, [open, publication]);

    const levels = categoryLevels(tipo, values.path);

    const handleChange = (field) => (e) => {

        let value = e.target.value;

        if (field === "price" || field === "stock" || field === "ageRestriction") value = onlyDigits(value);

        if (field === "weight") value = onlyDecimal(value);

        setValues((prev) => ({ ...prev, [field]: value }));

        setErrors((prev) => ({ ...prev, [field]: undefined }));

    };

    //al cambiar un nivel los niveles de abajo se borran

    const handleLevelChange = (index) => (e) => {

        const value = e.target.value;

        setValues((prev) => ({ ...prev, path: [...prev.path.slice(0, index), value] }));
        
        setErrors((prev) => ({ ...prev, level0: undefined, level1: undefined, level2: undefined, level3: undefined }));

    };

    const addVariant = () =>
        
        setVariants((prev) => [...prev, { id: `v-${Date.now()}-${prev.length}`, name: "", price: values.price, stock: "" }]);

    const changeVariant = (id, field, value) => {

        const clean = field === "name" ? value : onlyDigits(value);

        setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: clean } : v)));
        
        setErrors((prev) => ({ ...prev, variants: undefined }));

    };

    //campos de texto propios de productos o de servicios
    
    const textField = (field, label, placeholder, inputMode) => (

        <FormField
            id={`pub-${field}`}
            label={label}
            required
            inputMode={inputMode}
            placeholder={placeholder}
            value={values[field]}
            onChange={handleChange(field)}
            error={errors[field]}
        />

    );

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

        const newErrors = validate(values, { isProduct, levels, variants, previousOffer: publication?.offer });

        const cleanVariants = isProduct
            
            ? variants.map((v) => ({ id: v.id, name: v.name.trim(), price: Number(v.price), stock: Number(v.stock) }))
            
            : [];

        const hasVariants = cleanVariants.length > 0;

        if (Object.keys(newErrors).length > 0) {

            setErrors(newErrors);

            return;

        }

        const result = onSave({

            tipo,
            
            name: values.name.trim(),
            categoria: values.path[0],
            subcategoria: values.path[1] ?? "",
            categoryPath: values.path,
            
            //cn variantes el precio es el menor y el stock la suma de todas
            
            price: hasVariants ? Math.min(...cleanVariants.map((v) => v.price)) : Number(values.price),
            offer: values.offerPercent ? { percent: Number(values.offerPercent), until: values.offerUntil } : null,
            
            variants: cleanVariants,
            
            ...(isProduct
            
                ? {
            
                    stock: hasVariants ? cleanVariants.reduce((sum, v) => sum + v.stock, 0) : Number(values.stock),
                    size: values.size.trim(),
                    weight: Number(values.weight),
                    color: values.color.trim(),
                    material: values.material.trim(),
            
                }
            
                : { ageRestriction: Number(values.ageRestriction), duration: values.duration.trim() }),
            
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

                {levels.map((level, i) => (

                    <FormField
                        key={i}
                        id={`pub-categoria-${i}`}
                        label={LEVEL_LABELS[i]}
                        required
                        placeholder="Selecciona una opción"
                        options={level.options}
                        value={level.value}
                        onChange={handleLevelChange(i)}
                        error={errors[`level${i}`]}
                    />

                ))}

                {variants.length === 0 && (

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

                )}

                {isProduct && variants.length === 0 && (

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

                {isProduct ? (

                    <>
                        {textField("size", "Tamaño", "Ej: 20 x 10 x 5 cm, o talla M")}
                        {textField("weight", "Peso (kg)", "Ej: 0.5", "decimal")}
                        {textField("color", "Color", "Ej: Negro")}
                        {textField("material", "Material principal", "Ej: Plástico")}
                    </>

                ) : (

                    <>
                        {textField("ageRestriction", "Restricción de edad (mínima)", "18", "numeric")}
                        {textField("duration", "Tiempo del servicio", "Ej: 2 horas")}
                    </>

                )}

            </div>

            {isProduct && (

                <div style={{ marginTop: 16 }}>

                    <p style={{ margin: "0 0 8px" }}>Variantes (opcional): por ejemplo colores o tallas, cada una con su precio y stock</p>

                    {variants.map((v, i) => (

                        <div key={v.id} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>

                            <input style={{ ...inputStyle, flex: "2 1 140px" }} aria-label={`Nombre de la variante ${i + 1}`} placeholder="Nombre (ej: Rojo, talla M)" maxLength={30} value={v.name} onChange={(e) => changeVariant(v.id, "name", e.target.value)} />
                            <input style={{ ...inputStyle, flex: "1 1 80px", width: 80 }} aria-label={`Precio de la variante ${i + 1}`} placeholder="Precio" inputMode="numeric" value={v.price} onChange={(e) => changeVariant(v.id, "price", e.target.value)} />
                            <input style={{ ...inputStyle, flex: "1 1 70px", width: 70 }} aria-label={`Stock de la variante ${i + 1}`} placeholder="Stock" inputMode="numeric" value={v.stock} onChange={(e) => changeVariant(v.id, "stock", e.target.value)} />
                            
                            <button type="button" onClick={() => setVariants((prev) => prev.filter((x) => x.id !== v.id))}>Quitar</button>

                        </div>

                    ))}

                    <button type="button" onClick={addVariant}>+ Agregar variante</button>

                    {errors.variants && <p role="alert" style={{ color: "#d32f2f" }}>{errors.variants}</p>}

                </div>

            )}

            <div style={{ marginTop: 16 }}>

                <p style={{ margin: "0 0 8px" }}>Oferta por tiempo limitado (opcional)</p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

                    <label>
                    
                        Descuento (%){" "}
                    
                        <input style={{ ...inputStyle, width: 80 }} inputMode="numeric" value={values.offerPercent} onChange={(e) => { setValues((p) => ({ ...p, offerPercent: e.target.value.replace(/\D/g, "").slice(0, 2) })); setErrors((p) => ({ ...p, offerPercent: undefined })); }} />
                    
                    </label>

                    <label>
                    
                        Válida hasta{" "}
                    
                        <input style={inputStyle} type="date" min={todayISO()} value={values.offerUntil} onChange={handleChange("offerUntil")} />
                    
                    </label>

                </div>

                {(errors.offerPercent || errors.offerUntil) && (
                    <p role="alert" style={{ color: "#d32f2f" }}>{errors.offerPercent || errors.offerUntil}</p>
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