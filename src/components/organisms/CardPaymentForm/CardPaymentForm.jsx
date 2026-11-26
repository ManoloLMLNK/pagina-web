import { useState } from "react";
import {

    Box,
    Button,
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

    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;

}

const BRAND_LABELS = {visa: "VISA", mastercard: "MASTERCARD"};

export default function CardPaymentForm ({onBack, onSubmit, loading}) {

    const [cardNumber, setCardNumber] = useState("");

    const [expiry, setExpiry] = useState("");

    const [cvv, setCvv] = useState("");

    const [errors, setErrors] = useState({});

    const brand = getCardBrand (cardNumber);

    const handleSubmit = (e) => {

        e.preventDefault();

        const newErrors = {}

        if (!isValidCardNumber(cardNumber)) newErrors.cardNumber = "Número de tarjeta inválido";
        if (!/^\d{2}\/\d{2}$/.test(expiry)) newErrors.expiry = "Formato Mes/Año";
        if (!/^\d{3,4}$/.test(cvv)) newErrors.cvv = "CVV inválido";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        onSubmit({

            last4: cardNumber.replace(/\D/g, "").slice(-4),
            brand: brand ? BRAND_LABELS[brand] : "",

        });

        setCardNumber("");

        setExpiry("");

        setCvv("");

    };

    return (

        <Box component = "form" onSubmit = {handleSubmit}>

            <Box sx = {{display: "flex", alignItems: "center", gap: 1, mb: 2}}>

                <IconButton onClick = {onBack} size = "small" aria-label = "Volver">

                    <ArrowBackIcon />

                </IconButton>

                {brand && (

                    <Typography variant = "body2" fontWeight = {600}>

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
                slotProps = {{htmlInput: {inputMode: "numeric", autoComplete: "off"}}}

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
                        slotProps = {{htmlInput: {inputMode: "numeric", autoComplete: "off"}}}

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
                        onChange = {(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        error = {Boolean(errors.cvv)}
                        helperText = {errors.cvv}
                        slotProps = {{htmlInput: {inputMode: "numeric", autoComplete: "off"}}}

                    />

                </Box>

            </Box>

            <Typography variant = "caption" color = "text.secondary" display = "block" sx = {{mb: 2}}>

                Por seguridad, solo guardamos los últimos 4 dígitos de tu tarjeta para el comprobante.
                El número completo, la fecha y el CVV nunca se guardan.

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