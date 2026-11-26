//pantalla de pago completa. El carrito usa CheckoutPanel, esta se conserva y hace lo mismo

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { generateOrderPDF } from "../../utils/pdf";
import { saveOrder } from "../../utils/orders";
import { decreaseStock } from "../../data/catalog";
import PaymentMethodSelector from "../../components/organisms/PaymentMethodSelector/PaymentMethodSelector";
import CardPaymentForm from "../../components/organisms/CardPaymentForm/CardPaymentForm";
import PaymentSuccess from "../../components/organisms/PaymentSuccess/PaymentSuccess";
import "../../styles/Checkout.css";

const METHOD_LABELS = {

    tarjeta: "Tarjeta de Crédito o Débito",

};

export default function CheckoutScreen() {

    const navigate = useNavigate();

    const { currentUser } = useAuth();

    const {items, subtotal, iva, envio, total, clearCart} = useCart();

    const [step, setStep] = useState("method");

    const [method, setMethod] = useState("");

    const [loading, setLoading] = useState(false);

    const [order, setOrder] = useState(null);

    if (items.length === 0 && step !== "success") {

        return <Navigate to = "/home" replace />;

    }

    const finishOrder = () => {

        const newOrder = {

            id: Math.floor(100000 + Math.random() * 900000),
            date: new Date().toLocaleString("es-CL"),
            createdAt: new Date().toISOString(),
            items,
            subtotal,
            iva,
            envio,
            total,
            paymentMethod: METHOD_LABELS[method] || method,

        };

        generateOrderPDF(newOrder);

        if (currentUser) saveOrder(currentUser.rut, { ...newOrder, estado: "Recibido" });

        decreaseStock(items);

        setOrder(newOrder);

        clearCart();

        setStep("success");

    };

    const handleContinueFromMethod = () => {

        if (method === "tarjeta") {

            setStep("card");

            return;

        }

        finishOrder();

    };

    const handleCardSubmit = () => {

        setLoading(true);

        setTimeout(() => {

            setLoading(false);

            finishOrder();

        }, 800);

    };

    return (

        <Box className = "checkout-screen">

            <Paper className = "checkout-screen__card" elevation = {3}>

                {step === "method" && (

                    <PaymentMethodSelector value = {method} onChange = {setMethod} onContinue = {handleContinueFromMethod} />

                )}

                {step === "card" && (

                    <CardPaymentForm onBack = {() => setStep("method")} onSubmit = {handleCardSubmit} loading = {loading} />

                )}

                {step === "success" && order && (

                    <PaymentSuccess

                        order = {order}
                        onViewOrders = {() => navigate("/home")}
                        onBackHome = {() => navigate("/home")}

                    />

                )}

            </Paper>

        </Box>

    );

}