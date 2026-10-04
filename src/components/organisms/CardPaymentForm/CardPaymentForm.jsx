import { useState } from "react";
import {

    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    TextField,
    Typography,

} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getCardBrand, isValidCardNumber } from "../../../utils/card";

function formatCardNumber (value) {

    const digits = value.replace(/\D/g, "").slice(0,16);

    return digits.replace(/(.{4})/g, "$1 ").trim();

}

function formatExpiry (value) {

    const digits = value.replace(/\D/g, "").slice(0, 6);

    if (digits.length <= 2) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;

}

const BRAND_LABELS = {visa: "VISA", mastercard: "MASTERCARD"};

//aunq en figma diga q guarde los datos para una futura compra, legalmente se necesita un
//permiso y blablabla, y la tontera es rara asi q lo q implementaremos en su lugar
//es un sistema de compra dentro de la pagina web, y q los datos de la tarjeta
//se eliminen de la memoria de la pagina, asi no nos quedamos con los datos de
//tarjeta de los usuarios, y esto es legalmente aceptable y realista jiji

//(estoy cayendo en la locura)

export default function CardPaymentForm ({onBack, onSubmit, loading}) {

    const [cardNumber, setCardNumber] = useState("");

    const [expiry, setExpiry] = useState("");

    const [cvv, setCvv] = useState("");

    const [remember, setRemember] = useState(false);

    const [errors, setErrors] = useState({});

    const brand = getCardBrand (cardNumber);

    const handleSubmit = (e) => {

        e.preventDefault();

        const newErrors = {}

        if (!isValidCardNumber(cardNumber)) newErrors.cardNumber = "Número de tarjeta inválido";
        if (!/^\d{2}\/\d{4}$/.test(expiry)) newErrors.expiry = "Formato Mes/Año";
        if (!/^\d{3,4}$/.test(cvv)) newErrors.cvv = "CVV inválido";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        onSubmit();

        setCardNumber("");

        setExpiry("");

        setCvv("");

    };

    return (

        <Box component = "form" onSubmit = {handleSubmit}>

            <Box sx = {{display: "flex", alingItems: "center", gap: 1, mb: 2}}>

                <IconButton onClick = {onBack} size = "small" aria-label = "Volver">

                    <ArrowBackIcon />

                </IconButton>

                {brand && (

                    <Typography variant = "body2" fontWeigth = {600}>

                        {BRAND_LABELS[brand]}

                    </Typography>

                )}

            </Box>

            <Typography variant = "body2" sx = {{mb: 0.5}}>
                
                Número de la Tarjeta

            </Typography>

            <TextField

                fullWidth
                size = "small"
                placeholder = "0000 0000 0000 0000"
                value = {cardNumber}
                onChange = {(e) => setCardNumber(formatCardNumber(e.target.value))}
                error = {Boolean(errors.cardNumber)}
                helperText = {errors.cardNumber}
                sx = {{mb: 2}}
                slotProps = {{htmlInput: {inputMode: "numeric"}}}

            />

            <Box sx = {{display: "flex", gap: 2, mb: 2}}>

                <Box sx = {{flex: 1}}>

                    <Typography variant = "body2" sx = {{mb: 0.5}}>

                        Fecha de Caducidad

                    </Typography>

                    <TextField
                    
                        fullWidth
                        size = "small"
                        placeholder = "Mes/Año"
                        value = {expiry}
                        onChange = {(e) => setExpiry(formatExpiry(e.target.value))}
                        error = {Boolean(errors.expiry)}
                        helperText = {errors.expiry}
                        slotProps = {{htmlInput: {inputMode: "numeric"}}}

                    />

                </Box>

                <Box sx = {{flex: 1}}>

                    <Typography variant = "body2" sx = {{mb: 0.5}}>

                        CVV

                    </Typography>

                    <TextField

                        fullWidth
                        size = "small"
                        placeholder = "3-4 Dígitos"
                        value = {cvv}
                        onChange = {(e) => (e.target.value.replace(/\D/g, "").slice(0, 4))}
                        error = {Boolean(errors.cvv)}
                        slotProps = {{htmlInput: {inputMode: "numeric"}}}

                    />

                </Box>

            </Box>

            <FormControlLabel

                control = {

                    <Checkbox checked = {remember} onChange = {(e) => setRemember(e.target.checked)} size = "small" />


                }

                label = "Recordar esta tarjeta a futuro" //lo pongo por poner, pero realmente no va a funcionar

            />

            <Typography variant = "caption" color = "text.secondary" display = "block" sx = {{mb: 2}}>

                Por seguridad, no guardamos los datos de su tarjeta: solo se usaran para este pago

            </Typography>

            <Button

                type = "submit"
                variant = "contained"
                fullWidth
                disabled = {loading}
                sx = {{borderRadius: 999, textTransform: "none"}}
            
            >

                {loading ? "Procesando" : " Realizar Pedido"}

            </Button>

        </Box>

    );

}