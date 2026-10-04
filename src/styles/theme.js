import { createTheme } from "@mui/material/styles";

const theme = createTheme({

    palette: {

        primary: {main: "#5f4b8b", dark: "#4e3d75" },
        background: {default: "#f8f7fc"},

    },

    typography: {

        fontFamily: '"Inter", system-ui, sans-serif',

    },

    shape: {borderRadius: 8},

    components: {

        MuiButton: {

            styleOverrides: { root: {textTransform: "none"} },

        },

    },

});

export default theme;