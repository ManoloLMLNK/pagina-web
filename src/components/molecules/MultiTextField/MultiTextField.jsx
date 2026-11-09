import { IconButton, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { createEntry } from "../../../utils/entries";

const BUTTON_SX = {

    width: 40,
    height: 40,
    border: 1,
    borderColor: "divider",
    borderRadius: 1,
    flexShrink: 0,

};


//un campo q se puede repetir (varios telefonos, varias direcciones)
// cada casilla tiene un "+" q agrega otra casilla abajo sin limite
//desde la segunda casilla tambien hay una "x" para eliminarla

export default function MultiTextField({

    id,
    label,
    entryName,
    entries,
    onChange,
    placeholder,
    type = "text",
    inputMode,
    maxLength,
    sanitize,
    errors = {},

}) {

    const handleEntryChange = (entryId) => (e) => {

        const raw = e.target.value;

        const value = sanitize ? sanitize(raw) : raw;

        onChange(entries.map((entry) => (entry.id === entryId ? { ...entry, value } : entry)));

    };
    
    const handleAdd = () => onChange([...entries, createEntry()]);

    const handleRemove = (entryId) => onChange(entries.filter((entry) => entry.id !== entryId));

    return (

        <div className="multi-field">

            <label htmlFor={`${id}-${entries[0]?.id}`} className="login-field__label">

                {label}

            </label>

            {entries.map((entry, index) => (

                <div className="multi-field__row" key={entry.id}>

                    <TextField

                        id={`${id}-${entry.id}`}
                        type={type}
                        value={entry.value}
                        onChange={handleEntryChange(entry.id)}
                        placeholder={placeholder}
                        error={Boolean(errors[entry.id])}
                        helperText={errors[entry.id]}
                        autoComplete="off"
                        fullWidth
                        size="small"
                        slotProps={{

                            htmlInput: {

                                inputMode,

                                maxLength,

                                //la primera casilla se lee con la etiqueta de arriba, las demas cn su numero

                                "aria-label": index === 0 ? undefined : `${label} ${index + 1}`,

                            },

                        }}

                    />              

                    <IconButton

                        onClick={handleAdd}
                        sx={BUTTON_SX}
                        aria-label={`Agregar otro ${entryName}`}

                    >

                        <AddIcon fontSize="small" />

                    </IconButton>

                    {index > 0 ? (

                        <IconButton

                            onClick={() => handleRemove(entry.id)}
                            sx={BUTTON_SX}
                            aria-label={`Eliminar ${entryName} ${index + 1}`}

                        >

                            <CloseIcon fontSize="small" />

                        </IconButton>

                    ) : (

//espacio reservado para q todas las casillas queden del mismo ancho

                        <span className="multi-field__ghost" aria-hidden="true" />

                    )}

                </div>

            ))}

        </div>

    );

}