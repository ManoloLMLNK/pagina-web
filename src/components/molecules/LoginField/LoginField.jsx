import { useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

//etiqueta + campo + mensaje de error
//type="password" agrega solo el ojito para ver/ocultar la contrasena

export default function LoginField({

    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    autoComplete,

}) {

    const [show, setShow] = useState(false);

    const isPassword = type === "password";

    //a los campos de contraseña no se les pasa "value" si se le pasara,
    //React escribiria la clave como atributo en el HTML y se veria al inspeccionar la
    //pagina asi la clave vive solo dentro del campo

    const valueProps = isPassword ? {} : { value };

    return (

        <div className="login-field">

            <label htmlFor={id} className="login-field__label">

                {label}

            </label>

            <TextField

                id={id}
                type={isPassword && show ? "text" : type}
                {...valueProps}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                error={Boolean(error)}
                helperText={error}
                fullWidth
                size="small"
                slotProps={{

                    input: isPassword

                        ? {
                
                                endAdornment: (

                                    <InputAdornment position="end">

                                        <IconButton

                                            edge="end"
                                            onClick={() => setShow((prev) => !prev)}
                                            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}

                                        >

                                            {show ? <VisibilityOff /> : <Visibility />}

                                        </IconButton>

                                    </InputAdornment>

                                ),

                            }

                        : undefined,

                    htmlInput: isPassword ? { autoCapitalize: "off", spellCheck: false } : undefined,

                }}

            />

        </div>

    );

}