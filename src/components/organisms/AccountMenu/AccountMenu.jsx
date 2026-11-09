import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,

} from "@mui/material";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import BuildOutlined from "@mui/icons-material/BuildOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";

function getInitials(fullName) {
  
    if (!fullName) return "??";
  
    return fullName
  
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

}

function roleLabel(role) {

    switch (role) {
        case "administrador":
            return "Administrador";

        case "vendedor":
            return "Vendedor";

        case "comprador":
            return "Comprador";

        default:
        
        return "";
  
    }

}

const MENUS = {
    
  comprador: [
  
    { label: "Mi Perfil", path: "/perfil", icon: <PersonOutlined fontSize="small" /> },
    { label: "Mis Pedidos", path: "/perfil", icon: <ReceiptLongOutlined fontSize="small" /> },
    { label: "Mi Lista de Deseos", path: "/perfil", icon: <FavoriteBorder fontSize="small" /> },
  
  ],
  
  vendedor: [
  
    { label: "Mi Perfil", path: "/perfil", icon: <PersonOutlined fontSize="small" /> },
    { label: "Mi Empresa", path: "/empresas", icon: <StorefrontOutlined fontSize="small" /> },  
    { label: "Mis Productos", path: "/productos", icon: <Inventory2Outlined fontSize="small" /> },
    { label: "Mis Servicios", path: "/servicios", icon: <BuildOutlined fontSize="small" /> },
  
  ],
  
  administrador: [
  
    { label: "Mi Perfil", path: "/perfil", icon: <PersonOutlined fontSize="small" /> },
    { label: "Administrar Productos", path: "/productos", icon: <Inventory2Outlined fontSize="small" /> },
    { label: "Administrar Servicios", path: "/servicios", icon: <BuildOutlined fontSize="small" /> },
  
  ],

};

export default function AccountMenu({ currentUser, onLogout }) {

    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const navigate = useNavigate();

    const goTo = (path) => {
    
      setAnchorEl(null);
      if (path) navigate(path);
    
    };

    const options = MENUS[currentUser?.role] || MENUS.comprador;

    const firstName = currentUser?.fullName?.split(" ")[0] || "Usuario";


    return (

    <>
    
        <Box

            onClick={(e) => setAnchorEl(e.currentTarget)}

            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}

        >
        
        <Avatar sx={{ bgcolor: "primary.main" }}>
        
          {getInitials(currentUser?.fullName)}
        
        </Avatar>
        
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
        
          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
        
            {firstName}
        
          </Typography>
        
          <Typography variant="caption" color="text.secondary">
        
            {roleLabel(currentUser?.role)}
        
          </Typography>
        
        </Box>
      
      </Box>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
      
        {options.map((opt) => (
      
            <MenuItem key={opt.label} onClick={() => goTo(opt.path)}>
            
                <ListItemIcon>{opt.icon}</ListItemIcon>
                <ListItemText>{opt.label}</ListItemText>
          
            </MenuItem>
        
        ))}

        <Divider />

        <MenuItem onClick={() => goTo("/configuracion")}>
        
          <ListItemIcon>
        
            <SettingsOutlined fontSize="small" />
        
          </ListItemIcon>
        
          <ListItemText>Configuración</ListItemText>
        
        </MenuItem>

        <MenuItem onClick={onLogout} sx={{ color: "error.main" }}>
        
          <ListItemIcon>
        
            <LogoutOutlined fontSize="small" color="error" />
        
          </ListItemIcon>
        
          <ListItemText>Cerrar Sesión</ListItemText>
        
        </MenuItem>
      
      </Menu>
    
    </>
  
    );

}