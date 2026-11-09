import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function ConfirmDialog({

    open,
    title,
    message,
    confirmLabel = "Eliminar",
    onConfirm,
    onClose,

}) {

    return (

        <Dialog

            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"

        >
            <DialogTitle
        
                id="confirm-dialog-title"
                sx={{ bgcolor: "#fdf6d8", py: 1, fontSize: "0.95rem", fontWeight: 500 }}
      
            >
                
                {title}
            
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
        
                <DialogContentText id="confirm-dialog-message">{message}</DialogContentText>
      
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
        
                <Button onClick={onClose} autoFocus sx={{ textTransform: "none" }}>
                    
                    Cancelar
        
                </Button>
        
                <Button
          
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    sx={{ textTransform: "none", borderRadius: 1 }}
        
                >
          
                    {confirmLabel}
                
                </Button>
            
            </DialogActions>
    
        </Dialog>
    
    );

}