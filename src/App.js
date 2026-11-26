import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginScreen from "./pages/Login/LoginScreen";
import RegisterScreen from "./pages/Register/RegisterScreen";
import Home from "./components/Home";
import CatalogScreen from "./pages/Catalog/CatalogScreen";
import ItemDetailScreen from "./pages/ItemDetail/ItemDetailScreen";
import SearchScreen from "./Search/SearchScreen";
import EmpresasScreen from "./pages/Empresas/EmpresasScreen";
import ClientesScreen from "./pages/Clientes/ClientesScreen";
import ProfileScreen from "./pages/Profile/ProfileScreen";
import SettingsScreen from "./pages/Settings/SettingsScreen";
import CartScreen from "./pages/Cart/CartScreen";
import ManageItemsScreen from "./pages/Manage/ManageItemsScreen";
import MiCompanyScreen from "./pages/MyCompany/MiCompanyScreen";
import DashboardScreen from "./pages/Dashboard/DashboardScreen";
import CategoriesScreen from "./pages/Categories/CategoriesScreen";
import SalesScreen from "./pages/Sales/SalesScreen";
import QuotesScreen from "./pages/Quotes/QuotesScreen";
import MessagesScreen from "./pages/Messages/MessagesScreen";
import ReportsScreen from "./pages/Reports/ReportsScreen";
import ModerationScreen from "./pages/Moderation/ModerationScreen";

function App() {

  return (

    <ThemeProvider theme={theme}>
    
      <CssBaseline />
    
      <AuthProvider>
    
        <CartProvider>
    
          <BrowserRouter>
    
            <Routes>
    
              <Route path="/" element={<LoginScreen />} />
              <Route path="/registro" element={<RegisterScreen />} />

              <Route
    
                path="/home"
                element={
                
                  <ProtectedRoute>
                  
                    <Home />
                  
                  </ProtectedRoute>
                
                }
              
              />

              <Route

                path="/panel"
                element={

                  <ProtectedRoute allowedRoles={["vendedor", "administrador"]}>

                    <DashboardScreen />

                  </ProtectedRoute>

                }

              />

              <Route

                path="/perfil"
                element={

                  <ProtectedRoute>

                    <ProfileScreen />

                  </ProtectedRoute>

                }

              />

              <Route path="/reportes" element={<ProtectedRoute allowedRoles={["vendedor", "administrador"]}><ReportsScreen /></ProtectedRoute>} />
              <Route path="/moderacion" element={<ProtectedRoute allowedRoles={["vendedor", "administrador"]}><ModerationScreen /></ProtectedRoute>} />
              <Route path="/mensajes" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />

              <Route path="/cotizaciones" element={<ProtectedRoute><QuotesScreen /></ProtectedRoute>} />

              <Route

                path="/ventas"
                element={

                  <ProtectedRoute allowedRoles={["vendedor", "administrador"]}>

                    <SalesScreen />

                  </ProtectedRoute>

                }

              />

              <Route

                path="/carrito"
                element={

                <ProtectedRoute>

                  <CartScreen />

                </ProtectedRoute>

                }

              />

              <Route

                path="/administrar/productos"
                element={

                  <ProtectedRoute allowedRoles={["vendedor", "administrador"]}>

                    <ManageItemsScreen key="productos" tipo="productos" />

                  </ProtectedRoute>

                }

              />

              <Route

                path="/administrar/servicios"
                element={

                  <ProtectedRoute allowedRoles={["vendedor", "administrador"]}>

                    <ManageItemsScreen key="servicios" tipo="servicios" />

                  </ProtectedRoute>

                }

              />

              <Route
  
                path="/categorias"
                element={
    
                  <ProtectedRoute allowedRoles={["administrador"]}>
      
                    <CategoriesScreen />
    
                  </ProtectedRoute>
  
                }

            />

              <Route

                path="/mi-empresa"
                element={

                  <ProtectedRoute allowedRoles={["vendedor", "administrador"]}>

                    <MiCompanyScreen />

                  </ProtectedRoute>

                }

              />

              <Route

                path="/configuracion"
                element={

                  <ProtectedRoute>

                    <SettingsScreen />

                  </ProtectedRoute>

                }

              />

              <Route
                path="/productos/*"
                element={
                  <ProtectedRoute>
                    <CatalogScreen tipo="productos" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/servicios/*"
                element={
                  <ProtectedRoute>
                    <CatalogScreen tipo="servicios" />
                  </ProtectedRoute>
                }
              />

              <Route
                
                path="/buscar"
                element={
                  
                  <ProtectedRoute>
                  
                    <SearchScreen />
                  
                  </ProtectedRoute>
                
                }
              
              />

              <Route
                
                path="/item/:id"
                element={
                  
                  <ProtectedRoute>
                  
                    <ItemDetailScreen />
                  
                  </ProtectedRoute>
                
                }
              
              />

              <Route
                
                path="/empresas"
                element={
                  
                  <ProtectedRoute allowedRoles={["administrador"]}>
                  
                    <EmpresasScreen />
                  
                  </ProtectedRoute>
                
                }
              
              />
              
              <Route
                
                path="/clientes"
                element={
                  
                  <ProtectedRoute allowedRoles={["administrador"]}>
                  
                    <ClientesScreen />
                  
                  </ProtectedRoute>
                
                }
              
              />
            
            </Routes>
          
          </BrowserRouter>
        
        </CartProvider>
      
      </AuthProvider>
    
    </ThemeProvider>
  
  );

}

export default App;