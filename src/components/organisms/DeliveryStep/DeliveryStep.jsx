import { Box, Button, Checkbox, FormControlLabel, MenuItem, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { formatCLP } from "../../../utils/currency";
import { addressLabel } from "../../../utils/shipping";

//primer paso del pago cn o sin despacho y a que direccion

export default function DeliveryStep({ addresses, wantsShipping, onWantsShipping, addressId, onAddress, cost, total, onContinue }) {

    const missing = wantsShipping && !addressId;

    return (

        <Box>

            <Typography variant="h6" sx={{ mb: 1 }}>Entrega</Typography>

            <FormControlLabel

                control={<Checkbox checked={!wantsShipping} onChange={(e) => onWantsShipping(!e.target.checked)} />}
                label="Retiro en persona (sin costo)"

            />

            {wantsShipping && addresses.length > 0 && (

                <TextField select fullWidth size="small" label="Dirección de despacho" value={addressId} onChange={(e) => onAddress(e.target.value)} sx={{ my: 1.5 }}>

                    {addresses.map((a) => (

                        <MenuItem key={a.id} value={a.id} sx={{ whiteSpace: "normal" }}>{addressLabel(a)}</MenuItem>

                    ))}

                </TextField>

            )}

            {wantsShipping && addresses.length === 0 && (

                <Typography variant="body2" color="error" sx={{ my: 1 }}>

                    No tienes una dirección con región y comuna. Agrégala en <Link to="/configuracion">Configuración</Link>.

                </Typography>

            )}

            <Typography variant="body2">Envío: {missing ? "—" : formatCLP(cost)}</Typography>

            <Typography variant="body2" sx={{ mb: 2 }}><strong>Total: {formatCLP(total)}</strong></Typography>

            <Button variant="contained" fullWidth disabled={missing} sx={{ borderRadius: 999, textTransform: "none" }} onClick={onContinue}>

                Continuar

            </Button>

        </Box>

    );

}