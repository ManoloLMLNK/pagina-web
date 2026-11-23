//esta e sla parte nueva donde se superpone a la hora de pagar jiji

import {useState} from "react";
import {Box, Popover} from "@mui/material";
import {useCart} from "../../../context/CartContext";
import { generateOrderPDF } from "../../../utils/pdf";
import PaymentMethodSelector from "../PaymentMethodSelector/PaymentMethodSelector";
import CardPaymentForm from "../CardPaymentForm/CardPaymentForm";
import PaymentSuccess from "../PaymentSuccess/PaymentSuccess";
import { useAuth } from "../../../context/AuthContext";
import { saveOrder } from "../../../utils/orders";
import { decreaseStock } from "../../../data/catalog";

const METHOD_LABELS = {

    tarjeta: "Tarjeta de Crédito o Débito",

};

//aquui progtamamos la ventana flotante del metodo de pago, usara el mismo ancho del carrito

export default function CheckoutPanel ({anchorEl, onClose}) {

    const { currentUser } = useAuth();

    const {items, subtotal, iva, envio, total, clearCart} = useCart();

    const open = Boolean(anchorEl);

    const [step, setStep] = useState("method");
    
    const [method, setMethod] = useState("");

    const [loading, setLoading] = useState(false);

    const [order, setOrder] = useState(null);

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

        if (currentUser) saveOrder(currentUser.rut, { ...newOrder, estado: "En preparación" });

        setOrder(newOrder);

        decreaseStock(items);

        clearCart();

        setStep("succes");

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

    //aqui hacemos un reinicio

    const handleClose = () => {

        onClose();
        setStep("method");
        setMethod("");
        setOrder(null);

    };

    return (

        <Popover

            open = {open}

            anchorEl = {anchorEl}

            onClose = {handleClose}

            anchorOrigin = {{vertical: "top", horizontal: "left"}}

            transformOrigin = {{vertical: "bottom", horizontal: "right"}}

        >

            <Box sx = {{width: 320, maxWidth: "90vw", p: 2}}>

                {step === "method" && (

                    <PaymentMethodSelector

                        value = {method}

                        onChange = {setMethod}

                        onContinue = {handleContinueFromMethod}

                    />

                )}

                {step === "card" && (

                    <CardPaymentForm

                        onBack = {() => setStep("method")}

                        onSubmit = {handleCardSubmit}

                        loading = {loading}

                    />

                )}

                {step === "succes" && order && (

                    <PaymentSuccess order = {order} onViewOrders = {handleClose} onBackHome = {handleClose} />

                )}

            </Box>

        </Popover>

    );

}