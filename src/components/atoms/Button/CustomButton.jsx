import { Button } from "@mui/material";

export default function CustomButton({

    children,
    startIcon,
    loading = false,
    disabled = false,
    ...props

}) {

    return (

        <Button

            variant="contained"
            fullWidth
            startIcon={startIcon}
            disabled={loading || disabled}
            sx = {{borderRadius: 999, height: 40, fontSize: "1.05rem", boxShadow: "none"}}
            {...props}

        >

            {children}

        </Button>

    );

}