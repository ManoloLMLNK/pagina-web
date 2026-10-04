import { Box, Button, Divider, IconButton, Popover, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import { useCart } from "../../../context/CartContext";
import { formatCLP } from "../../../utils/currency";

export default function CartDrawer({ anchorEl, onClose, onCheckout }) {

    const { items, removeItem, updateQuantity, subtotal, iva, envio, total } = useCart();

    const open = Boolean(anchorEl);


    return (

        <Popover

        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}

        >

      <Box sx={{ width: 320, maxWidth: "90vw", p: 2 }}>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>

          <Typography variant="h6">Mi Carrito</Typography>

          <IconButton size="small" onClick={onClose} aria-label="Cerrar carrito">

            <CloseIcon fontSize="small" />

          </IconButton>

        </Box>

        {items.length === 0 && (

            <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
        
                Tu carrito está vacío.
        
            </Typography>
        
        )}

        {items.map((item) => (
        
            <Box key={item.id} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
            
            <Box
            
                sx={{
                
                    width: 56,
                    height: 56,
                    borderRadius: 1,
                    bgcolor: "#f0f0f0",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
              
                }}
            
            >
              
              <ShoppingBagOutlined fontSize="small" sx={{ color: "#9a9a9a" }} />
            
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
            
              <Typography variant="body2" color="primary" fontWeight={600} noWrap>
            
                {item.name}
            
              </Typography>
            
              <Typography variant="body2">{formatCLP(item.price)}</Typography>
            
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            
                <IconButton
            
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Restar"
                
                >
                
                  <RemoveIcon fontSize="inherit" />
                
                </IconButton>
                
                <Typography variant="body2">{item.quantity}</Typography>
                
                <IconButton
                
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Sumar"
                
                >
                  
                  <AddIcon fontSize="inherit" />
                
                </IconButton>
              
              </Box>

            </Box>

            <IconButton size="small" onClick={() => removeItem(item.id)} aria-label="Eliminar">

              <DeleteOutlined fontSize="small" />

            </IconButton>

          </Box>

        ))}

        <Divider sx={{ my: 1.5 }} />

        
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        
          <Typography variant="body2">Subtotal</Typography>
          <Typography variant="body2">{formatCLP(subtotal)}</Typography>
        
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        
          <Typography variant="body2">IVA</Typography>
          <Typography variant="body2">{formatCLP(iva)}</Typography>
        
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        
          <Typography variant="body2">Envío</Typography>
          <Typography variant="body2">{envio === 0 ? "Gratis" : formatCLP(envio)}</Typography>
        
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        
          <Typography variant="subtitle1" fontWeight={700}>
        
            Total
        
          </Typography>
        
          <Typography variant="subtitle1" fontWeight={700}>
        
            {formatCLP(total)}
        
          </Typography>
        
        </Box>

        <Button
        
            variant="contained"
            fullWidth
            disabled={items.length === 0}
            sx={{ borderRadius: 999, mb: 1, textTransform: "none" }}
            onClick={onCheckout}
        
        >
        
          Ir a Pagar
        
        </Button>
        
        <Button
        
            variant="outlined"
            fullWidth
            sx={{ borderRadius: 999, textTransform: "none" }}
            onClick={onClose}
        
        >
        
          Seguir Comprando
        
        </Button>
      
      </Box>
    
    </Popover>
  
    );

}