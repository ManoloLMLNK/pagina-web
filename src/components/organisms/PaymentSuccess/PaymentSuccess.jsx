import { Box, Button, Typography } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { formatCLP } from "../../../utils/currency";

export default function PaymentSuccess({ order, onViewOrders, onBackHome }) {
  
  return (

    <Box sx={{ textAlign: "center" }}>

      <CheckCircleOutlined sx={{ fontSize: 72, color: "primary.main", mb: 1 }} />

      <Typography variant="h6" color="primary" fontWeight={700} sx={{ mb: 2 }}>

        ¡Tu Pago Fue Exitoso!

      </Typography>

      <Box sx={{ textAlign: "left", bgcolor: "#f8f7fc", borderRadius: 2, p: 2, mb: 3 }}>

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>

          Detalle de la Compra

        </Typography>
        <Typography variant="body2">N° de Pedido: #{order.id}</Typography>
        <Typography variant="body2">Fecha: {order.date}</Typography>
        <Typography variant="body2">Entrega: 3-5 Días Hábiles</Typography>
        <Typography variant="body2">Total Pagado: {formatCLP(order.total)}</Typography>

      </Box>

      <Button
      
        variant="contained"
        fullWidth
        sx={{ borderRadius: 999, mb: 1, textTransform: "none" }}
        onClick={onViewOrders}
  
      >
  
        Ver Mis Pedidos
  
      </Button>
  
      <Button variant="outlined" fullWidth sx={{ borderRadius: 999, textTransform: "none" }} onClick={onBackHome}>
  
        Volver al Inicio
  
      </Button>
  
    </Box>

  );

}