import { useState } from "react";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { formatCLP } from "../../../utils/currency";

//datos de ejemplo se cambian por los de la cuenta real de la plataforma

const BANK_DATA = [

    ["Banco", "Banco de ejemplo"],
    ["Tipo de cuenta", "Cuenta corriente"],
    ["N° de cuenta", "000000000"],
    ["Titular", "CompraYa"],
    ["RUT", "00.000.000-0"],
    ["Correo", "pagos@compraya.cl"],

];

const CODE_PATTERN = /^[A-Za-z0-9]{6,20}$/;

//pago por transferencia se muestran los datos de la cuenta y se pide el codigo de la transferencia

export default function TransferPaymentForm({ total, onBack, onSubmit, loading }) {

    const [code, setCode] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = (e) => {

        e.preventDefault();

        const clean = code.trim();

        if (!clean) {

            setError("Ingresa el código de la transferencia.");

            return;

        }

        if (!CODE_PATTERN.test(clean)) {

            setError("El código debe tener de 6 a 20 letras o números.");

            return;

        }

        onSubmit({ transferCode: clean.toUpperCase() });

    };

    return (

        <Box component="form" onSubmit={handleSubmit} noValidate>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>

                <IconButton onClick={onBack} size="small" aria-label="Volver">

                    <ArrowBackIcon />

                </IconButton>

                <Typography variant="subtitle1" fontWeight={600}>

                    Transferencia Bancaria

                </Typography>

            </Box>

            <Typography variant="body2" sx={{ mb: 1 }}>

                Transfiere {formatCLP(total)} a esta cuenta y escribe abajo el código de la operación:

            </Typography>

            <Box sx={{ bgcolor: "#f8f7fc", borderRadius: 2, p: 1.5, mb: 2 }}>

                {BANK_DATA.map(([label, value]) => (

                    <Typography key={label} variant="body2">

                        <strong>{label}:</strong> {value}

                    </Typography>

                ))}

            </Box>

            <Typography variant="body2" sx={{ mb: 0.5 }}>

                Código de la transferencia

            </Typography>

            <TextField

                fullWidth
                size="small"
                placeholder="Ej: 8472910563"
                value={code}
                onChange={(e) => {

                    setCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 20));

                    setError("");

                }}
                error={Boolean(error)}
                helperText={error}
                sx={{ mb: 2 }}

            />

            <Button

                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ borderRadius: 999, textTransform: "none" }}

            >

                {loading ? "Procesando" : "Realizar Pedido"}

            </Button>

        </Box>

    );

}