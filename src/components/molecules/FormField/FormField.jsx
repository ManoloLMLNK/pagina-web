//para las cosas donde hay q poner cuestiones esto muestra si es obligatorio o no

import { MenuItem, TextField } from "@mui/material";

export default function FormField({

    id,
    label,
    required = false,
    value,
    onChange,
    placeholder,
    error,
    type = "text",
    inputMode,
    options,
    disabled = false,
    autoComplete = "off",

}) {

    const isSelect = Array.isArray(options);

    const slotProps = isSelect

        ? { select: { displayEmpty: true } }

        : { htmlInput: { inputMode, "aria-required": required || undefined } };


    return (

        <div className="form-field">

            <label htmlFor={id} className="form-field__label">

                {label}

                {required && (

                    <span className="form-field__required" aria-hidden="true">

                        {" "}

                        *

                    </span>

                )}

            </label>



            <TextField

                id={id}
                select={isSelect}
                type={isSelect ? undefined : type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                error={Boolean(error)}
                helperText={error}
                autoComplete={autoComplete}
                fullWidth
                size="small"
                slotProps={slotProps}
                sx={isSelect && value === "" ? { "& .MuiSelect-select": { color: "text.disabled" } } : undefined}

            >

                {isSelect

                    ? [

                        <MenuItem key="placeholder" value="" disabled>

                            {placeholder}

                        </MenuItem>,

                        ...options.map((opt) => (

                            <MenuItem key={opt.value} value={opt.value}>

                                {opt.label}

                            </MenuItem>

                        )),

                    ]

                : null}

            </TextField>

        </div>

    );

}