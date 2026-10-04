import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginScreen from "./pages/Login/LoginScreen";
import Register from "./components/Register";
import Home from "./components/Home";
import CheckoutScreen from "./pages/Checkout/CheckoutScreen";

function App() {

  return (

    <ThemeProvider theme = {theme}>

      <CssBaseline />

      <AuthProvider>

        <CartProvider>

          <BrowserRouter>
          
            <Routes>

              <Route path ="/" element = {<LoginScreen />} />
              <Route path = "/registro" element = {<Register />} />
              <Route

                path = "/home"
                element = {

                  <ProtectedRoute>

                    <Home />

                  </ProtectedRoute>

                }

              />

              <Route

                path = "/pago"
                element = {

                  <ProtectedRoute>

                    <CheckoutScreen />

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