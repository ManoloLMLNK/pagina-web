import { Box, Button, FormControlLabel, Paper, Radio, RadioGroup, Typography } from "@mui/material";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";

const METHODS = [

    {id: "tarjeta", label: "Tarjeta de Crédito/Débito", icon: <CreditCardOutlined />},

];

export default function PaymentMethodSelector({value, onChange, onContinue}) {

    return (

        <Box>

            <Typography variant = "h6" sx = {{mb: 2}}>

                Método de Pago

            </Typography>

            <RadioGroup value = {value} onChange = {(e) => onChange(e.target.value)}>
                
                {METHODS.map((m) => (

                    <Paper

                        key = {m.id}
                        variant = "outlined"
                        sx = {{

                            display: "flex",
                            alingItems: "center",
                            gap: 1,
                            p: 1,
                            mb: 1.5,
                            borderRadius: 2,
                            borderColor: value === m.id ? "primary.main" : undefined,

                        }}

                    >

                        {m.icon}

                        <FormControlLabel value = {m.id} control = {<Radio />} label = {m.label} sx = {{flex: 1, ml: 0.5}} />

                    </Paper>

                ))}

            </RadioGroup>

            <Typography variant = "body2" color = "text.secondary" sx = {{mb: 3}}>
                
                Entrega: 3 a 5 Días Hábiles

            </Typography>

            <Button

                variant = "contained"
                fullWidth
                disabled = {!value}
                sx = {{borderRadius: 999, textTransform: "none"}}
                onClick = {onContinue}

            >

                Continuar

            </Button>

        </Box>

    );

}