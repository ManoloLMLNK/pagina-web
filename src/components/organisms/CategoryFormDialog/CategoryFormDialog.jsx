import { useEffect, useState } from "react";
import FormDialog from "../FormDialog/FormDialog";
import FormField from "../../molecules/FormField/FormField";

const MIN_LENGTH = 3;

const MAX_LENGTH = 60;

const VALID_NAME = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 &,.()-]*$/;

function validate(label) {

    const clean = label.trim();

    if (clean.length < MIN_LENGTH) return `Ingrese al menos ${MIN_LENGTH} caracteres.`;

    if (clean.length > MAX_LENGTH) return `Máximo ${MAX_LENGTH} caracteres.`;

    if (!VALID_NAME.test(clean)) return "Use solo letras, números y & , . ( ) -";

    return "";

}

export default function CategoryFormDialog({ open, title, initialLabel = "", submitLabel = "Guardar", onClose, onSave }) {
    
    const [label, setLabel] = useState(initialLabel);
    
    const [error, setError] = useState("");

    useEffect(() => {
    
        if (open) {
    
            setLabel(initialLabel);
            setError("");
    
        }
    
    }, [open, initialLabel]);
    
    const handleSubmit = (e) => {
    
        e.preventDefault();
    
        const problem = validate(label);
    
        if (problem) {
    
            setError(problem);
    
            return;
    
        }
    
        const result = onSave({ label: label.trim() });
    
        if (!result.ok) {
    
            setError(result.error);
    
            return;
    
        }
    
        onClose();
    
    };

    return (
        
        <FormDialog open={open} onClose={onClose} onSubmit={handleSubmit} title={title} submitLabel={submitLabel} maxWidth="xs">
            
            <FormField
            
                id="category-label"
                label="Nombre"
                required
                placeholder="Ej: Jardinería"
                value={label}
                onChange={(e) => {
            
                    setLabel(e.target.value.slice(0, MAX_LENGTH));
                    setError("");
            
                }}
            
                error={error}
    
            />
    
        </FormDialog>
    
    );

}