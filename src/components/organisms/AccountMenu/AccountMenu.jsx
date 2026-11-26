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
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";

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

function rolesLabel(user) {

  const roles = user?.roles ?? (user?.role ? [user.role] : []);

  return roles.map(roleLabel).filter(Boolean).join(" · ");

}

const MENUS = {
    
  comprador: [
  
    { label: "Perfil", path: "/perfil", icon: <PersonOutlined fontSize="small" /> },
    { label: "Pedidos", path: "/perfil", icon: <ReceiptLongOutlined fontSize="small" /> },
    { label: "Lista de Deseos", path: "/perfil", icon: <FavoriteBorder fontSize="small" /> },
  
  ],
  
  vendedor: [
  
    { label: "Panel", path: "/panel", icon: <DashboardOutlined fontSize="small" /> },
    { label: "Perfil", path: "/perfil", icon: <PersonOutlined fontSize="small" /> },
    { label: "Empresa", path: "/mi-empresa", icon: <StorefrontOutlined fontSize="small" /> }, 
    { label: "Productos", path: "/administrar/productos", icon: <Inventory2Outlined fontSize="small" /> },
    { label: "Servicios", path: "/administrar/servicios", icon: <BuildOutlined fontSize="small" /> },
  
  ],
  
  administrador: [
  
    { label: "Panel", path: "/panel", icon: <DashboardOutlined fontSize="small" /> },
    { label: "Perfil", path: "/perfil", icon: <PersonOutlined fontSize="small" /> },
    { label: "Administrar Productos", path: "/administrar/productos", icon: <Inventory2Outlined fontSize="small" /> },
    { label: "Administrar Servicios", path: "/administrar/servicios", icon: <BuildOutlined fontSize="small" /> },
    { label: "Administrar Categorías", path: "/categorias", icon: <CategoryOutlined fontSize="small" /> },
  
  ],

};

const ROLE_ORDER = ["administrador", "vendedor", "comprador"];

//junta las opciones de todos los roles de la persona

function optionsFor(user) {

    const roles = user?.roles ?? (user?.role ? [user.role] : ["comprador"]);

    const seen = new Set();

    return ROLE_ORDER

        .filter((r) => roles.includes(r))
        .flatMap((r) => MENUS[r] ?? [])
        .filter((opt) => {

            if (seen.has(opt.label)) return false;

            seen.add(opt.label);

            return true;

        });

}

export default function AccountMenu({ currentUser, onLogout }) {

    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const navigate = useNavigate();

    const goTo = (path) => {
    
      setAnchorEl(null);
      if (path) navigate(path);
    
    };

    const options = optionsFor(currentUser);

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
        
            {rolesLabel(currentUser)}
        
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