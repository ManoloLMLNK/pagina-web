import { useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginField ({

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

    return (

        <div className = "login-field">

            <label htmlFor = {id} className = "login-field__label">

                {label}

            </label>

            <TextField

                id = {id}
                type = {isPassword && show ? "text" : type}
                value = {value}
                onChange = {onChange}
                placeholder = {placeholder}
                autoComplete = {autoComplete}
                error = {Boolean(error)}
                helperText = {error}
                fullWidth
                size = "small"
                slotProps = {{

                    input: isPassword

                        ? {

                            endAdornment: (

                                <InputAdornment position = "end">

                                    <IconButton

                                        edge = "end"
                                        onClick = {() => setShow((prev) => !prev)}
                                        aria-label = {show ? "Ocultar contraseña" : "Mostrar contraseña"}

                                    >

                                        {show ? <VisibilityOff /> : <Visibility />}

                                    </IconButton>


                                </InputAdornment>

                            ),

                        }

                    : undefined,

                }}

            />

        </div>

    );

}