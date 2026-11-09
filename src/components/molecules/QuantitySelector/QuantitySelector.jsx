import {Box, IconButton, Typography} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

export default function QuantitySelector({value, onChange, min = 1, max = 99}) {

    return (

        <Box

            sx = {{

                display: "inline-flex",

                alingItems: "center",

                gap: 1,

                border: 1,

                borderColor: "divider",

                borderRadius: 1,

                px: 0.5,

            }}

        >

            <IconButton

                size = "small"

                onClick = {() => onChange(Math.max(min, value - 1))}

                disabled = {value <= min}

                aria-label = "Restar"

            >

                <RemoveIcon fontSize = "inherit" />

            </IconButton>

            <Typography variant = "body2" sx = {{minWidth: 24, textAlign: "center"}}>

                {value}

            </Typography>

            <IconButton

                size = "small"

                onClick = {() => onChange(Math.min(max, value + 1))}

                disabled = {value >= max}

                aria-label = "Sumar"

            >

                <AddIcon fontSize = "inherit" />

            </IconButton>

        </Box>

    );

}