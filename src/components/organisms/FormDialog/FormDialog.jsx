//los menus emergentes de los formularios

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function FormDialog({

    open,
    onClose,
    onSubmit,
    title = "Información General",
    submitLabel,
    maxWidth = "md",
    children,

}) {

    return (

        <Dialog

            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={maxWidth}
            aria-labelledby="form-dialog-title"
            slotProps={{ paper: { component: "form", onSubmit, noValidate: true } }}

        >

            <DialogTitle

                id="form-dialog-title"

                sx={{   

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "#fdf6d8",
                    py: 1,
                    fontSize: "0.95rem",
                    fontWeight: 500,

                }}

            >

                {title}

                <IconButton size="small" onClick={onClose} aria-label="Cerrar">

                    <CloseIcon fontSize="small" />

                </IconButton>

            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>{children}</DialogContent>


            <DialogActions sx={{ px: 3, pb: 2 }}>

                <Button type="submit" variant="contained" sx={{ textTransform: "none", borderRadius: 1 }}>

                    {submitLabel}

                </Button>

            </DialogActions>

        </Dialog>

    );

}