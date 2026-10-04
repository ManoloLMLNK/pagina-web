import { Checkbox, FormControlLabel, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function RememberUser({ checked, onChange }) {

    return (

        <div className = "remember-user">
        
            <FormControlLabel

                control = {<Checkbox checked = {checked} onChange = {onChange} size = "small" />}

                label = "Recordarme"

            />

            <Link

                component = {RouterLink}
                to = "/recuperar-contraseña"
                underline = "hover"
                variant = "body2"

            >

                ¿Olvidaste tu contraseña?

            </Link>

        </div>

    );

}