import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import { useCart } from "../../context/CartContext";
import { generateOrderPDF } from "../../utils/pdf";
import PaymentMethodSelector from "../../components/organisms/PaymentMethodSelector/PaymentMethodSelector";
import CardPaymentForm from "../../components/organisms/CardPaymentForm/CardPaymentForm";
import "../../styles/Checkout.css";
import PaymentSuccess from "../../components/organisms/PaymentSuccess/PaymentSuccess";

const METHOD_LABELS = {

    tarjeta: "Tarjeta de Crédito/Débito",

};

export default function CheckoutScreen() {

    const navigate = useNavigate();

    const {items, subtotal, iva, envio, total, clearCart} = useCart();

    const [step, setStep] = useState("method");
    const [method, setMethod] = useState("");
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);

    if (items.length === 0 && step !== "success") {

        navigate("/home");

        return null;

    }

    const finishOrder = () => {

        const newOrder = {

            id: Math.floor(100000 + Math.random() * 900000),
            date: new Date().toLocaleString("es-CL"),
            items,
            subtotal,
            iva,
            envio,
            total,
            paymentMethod: METHOD_LABELS[method] || method,

        };

        generateOrderPDF(newOrder);
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

                {step === "success" && order && (

                    <PaymentSuccess

                        order = {order}
                        onViewOrders = {() => navigate ("/home")}
                        onBackHome = {() => navigate("/home")}

                    />

                )}

            </Paper>

        </Box>

    );

}