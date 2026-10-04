import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowCircleRightOutlined from "@mui/icons-material/ArrowCircleRightOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import LoginField from "../../molecules/LoginField/LoginField";
import RememberUser from "../../molecules/RememberUser/RememberUser";

export default function LoginFrom ({ values, errors, loading, onChange, onSubmit }) {

    return (

        <form className = "login-screen__form" onSubmit = {onSubmit} noValidate>

            <LoginField

                id = "rut"
                label = "RUT"
                placeholder = "Ej: 12.345.678-9"
                autoComplete = "username"
                value = {values.rut}
                onChange = {onChange("rut")}
                error = {errors.rut}

            />

            <LoginField

                id = "password"
                label = "Contraseña"
                type = "password"
                placeholder = "Ingresa tu contraseña"
                autoComplete = "current-password"
                value = {values.password}
                onChange = {onChange("password")}
                error = {errors.password}

            />

            <RememberUser checked = {values.remember} onChange = {onChange("remember")} />

            <CustomButton

                type = "submit"
                loading = {loading}
                startIcon = {<ArrowCircleRightOutlined />}

            >

                {loading ? "Iniciando Sesión" : "Iniciar Sesión"}

            </CustomButton>

            <p className = "login-screen__register">

                ¿No tienes una cuenta?{" "}

                <Link component = {RouterLink} to = "/registro" underline = "hover">
                
                    Registrate

                </Link>

            </p>

        </form>

    );

}