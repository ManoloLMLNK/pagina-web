import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowCircleRightOutlined from "@mui/icons-material/ArrowCircleRightOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import LoginField from "../../molecules/LoginField/LoginField";
import MultiTextField from "../../molecules/MultiTextField/MultiTextField";
import AddressListField from "../../molecules/AddressListField/AddressListField";
import { sanitizePhone } from "../../../utils/text";

//el coso de Crear Cuenta solo se encarga de como se ve
//los datos y la logica los recibe desde la pagina RegisterScreen

export default function RegisterForm({

    values,
    phones,
    addresses,
    errors,
    loading,
    onChange,
    onPhonesChange,
    onAddressesChange,
    onSubmit,

}) {

    return (

        <form className="login-screen__form register-form" onSubmit={onSubmit} noValidate>

            <LoginField

                id="rut"
                label="Rut"
                placeholder="Ej: 12.345.678-9"
                autoComplete="username"
                value={values.rut}
                onChange={onChange("rut")}
                error={errors.rut}

            />

            <LoginField

                id="fullName"
                label="Nombre completo"
                placeholder="Ej: Aylin Alexandra Henriquez Castillo"
                autoComplete="name"
                value={values.fullName}
                onChange={onChange("fullName")}
                error={errors.fullName}

            />

            <LoginField

                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="Ej: tralalero.tralala@gmail.com"
                autoComplete="email"
                value={values.email}
                onChange={onChange("email")}
                error={errors.email}

            />

            <LoginField

                id="birthDate"
                label="Fecha de nacimiento"
                placeholder="Ej: 18/04/2005"
                autoComplete="off"
                value={values.birthDate}
                onChange={onChange("birthDate")}
                error={errors.birthDate}

            />

            <MultiTextField

                id="phone"
                label="Número de teléfono"
                entryName="teléfono"
                type="tel"
                inputMode="tel"
                placeholder="Ej: +569 94738390"
                sanitize={sanitizePhone}
                entries={phones}
                onChange={onPhonesChange}
                errors={errors.phones}

            />

            <AddressListField

                addresses={addresses}
                onChange={onAddressesChange}
                errors={errors.addresses}

            />

            <LoginField

                id="password"
                label="Contraseña"
                type="password"
                placeholder="Ingrese su contraseña"
                autoComplete="new-password"
                value={values.password}
                onChange={onChange("password")}
                error={errors.password}

            />

            <LoginField

                id="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                placeholder="Ingrese su contraseña de nuevo"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={onChange("confirmPassword")}
                error={errors.confirmPassword}

            />

            <CustomButton type="submit" loading={loading} startIcon={<ArrowCircleRightOutlined />}>

                {loading ? "Registrando..." : "Registrarse"}

            </CustomButton>

            <p className="login-screen__register">

                ¿Ya tiene cuenta?{" "}

                <Link component={RouterLink} to="/" underline="hover">

                    Iniciar sesión

                </Link>

            </p>

        </form>

    );

}