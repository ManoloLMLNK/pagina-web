//esta e sla parte nueva donde se superpone a la hora de pagar jiji

import {useState} from "react";
import {Box, Popover, Typography} from "@mui/material";
import {useCart} from "../../../context/CartContext";
import { generateOrderPDF } from "../../../utils/pdf";
import PaymentMethodSelector from "../PaymentMethodSelector/PaymentMethodSelector";
import CardPaymentForm from "../CardPaymentForm/CardPaymentForm";
import TransferPaymentForm from "../TransferPaymentForm/TransferPaymentForm";
import PaymentSuccess from "../PaymentSuccess/PaymentSuccess";
import { useAuth } from "../../../context/AuthContext";
import { saveOrder } from "../../../utils/orders";
import { PAYMENT_LABELS } from "../../../utils/payment";
import { decreaseStock } from "../../../data/catalog";
import DeliveryStep from "../DeliveryStep/DeliveryStep";
import { addressLabel, requiresShipping, shippingCost } from "../../../utils/shipping";
import { stringToAddress } from "../../../utils/addresses";

//aquui progtamamos la ventana flotante del metodo de pago, usara el mismo ancho del carrito

export default function CheckoutPanel ({anchorEl, onClose}) {

    const { currentUser, users } = useAuth();

    const {items, subtotal, iva, clearCart} = useCart();

    const open = Boolean(anchorEl);

    const [step, setStep] = useState("delivery");

    const [method, setMethod] = useState("");

    const [loading, setLoading] = useState(false);

    const [order, setOrder] = useState(null);

    const [error, setError] = useState("");

    //despacho solo si hay productos y la persona no retira

    const [wantsShipping, setWantsShipping] = useState(true);

    const [addressId, setAddressId] = useState("");

    //en la cuenta se guardan cm texto aqui se separan en calle region y comuna

    const addresses = (currentUser?.addresses ?? [])

        .map((text, i) => ({ ...stringToAddress(text), id: String(i) }))

        .filter((a) => a.regionId && a.comuna);

    const address = addresses.find((a) => a.id === addressId) ?? addresses[0];

    const needsShipping = requiresShipping(items);

    const shipped = needsShipping && wantsShipping;

    const envio = shipped && address ? shippingCost(items[0]?.sellerRut ?? "", address.regionId) : 0;

    const total = subtotal + iva + envio;

    const currentStep = step === "delivery" && !needsShipping ? "method" : step;

    const finishOrder = (paymentData = {}) => {

        if (items.length === 0) return;

        if (shipped && !address) {

            setStep("delivery");

            return;

        }

        //cada compra es a un solo vendedor

        const sellers = new Set(items.map((it) => it.sellerRut ?? ""));

        if (sellers.size > 1) {

            setError("Tu carrito tiene productos de más de un vendedor. Deja solo los de un vendedor para pagar.");

            setStep("method");

            return;

        }

        const sellerRut = items[0].sellerRut ?? "";

        const seller = users.find((u) => u.rut === sellerRut);

        const payment = { method, label: PAYMENT_LABELS[method] ?? method };

        if (method === "tarjeta") {

            payment.last4 = String(paymentData.last4 ?? "").slice(-4);

            payment.brand = paymentData.brand ?? "";

        }

        if (method === "transferencia") payment.transferCode = paymentData.transferCode;

        const newOrder = {

            id: Math.floor(100000 + Math.random() * 900000),
            date: new Date().toLocaleString("es-CL"),
            createdAt: new Date().toISOString(),

            items,
            subtotal,
            iva,
            envio,
            total,

            requiereDespacho: shipped,
            direccionDespacho: shipped ? addressLabel(address) : "",

            sellerRut,
            sellerName: seller?.fullName ?? "",

            payment,
            paymentMethod: payment.label,

        };

        generateOrderPDF(newOrder);

        if (currentUser) saveOrder(currentUser.rut, { ...newOrder, estado: "Recibido" });

        setOrder(newOrder);

        decreaseStock(items);

        clearCart();

        setStep("success");

    };

    const handleContinueFromMethod = () => {

        setError("");

        if (method === "tarjeta") {

            setStep("card");

            return;

        }

        if (method === "transferencia") {

            setStep("transfer");

            return;

        }

        finishOrder();

    };

    //simula el tiempo q tarda el pago

    const handlePay = (paymentData) => {

        setLoading(true);

        setTimeout(() => {

            setLoading(false);

            finishOrder(paymentData);

        }, 800);

    };

    //aqui hacemos un reinicio

    const handleClose = () => {

        onClose();
        setStep("delivery");
        setWantsShipping(true);
        setAddressId("");
        setMethod("");
        setOrder(null);
        setError("");

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

                {currentStep === "delivery" && (

                    <DeliveryStep

                        addresses = {addresses}
                        wantsShipping = {wantsShipping}
                        onWantsShipping = {setWantsShipping}
                        addressId = {address?.id ?? ""}
                        onAddress = {setAddressId}
                        cost = {envio}
                        total = {total}
                        onContinue = {() => setStep("method")}

                    />

                )}

                {currentStep === "method" && (

                    <>

                        {needsShipping && (

                            <button type = "button" onClick = {() => setStep("delivery")}>Cambiar entrega</button>

                        )}

                        {error && (

                            <Typography role = "alert" variant = "body2" color = "error" sx = {{mb: 1.5}}>

                                {error}

                            </Typography>

                        )}

                        <PaymentMethodSelector

                            value = {method}

                            onChange = {setMethod}

                            onContinue = {handleContinueFromMethod}

                        />

                    </>

                )}

                {currentStep === "card" && (

                    <CardPaymentForm

                        onBack = {() => setStep("method")}

                        onSubmit = {handlePay}

                        loading = {loading}

                    />

                )}

                {currentStep === "transfer" && (

                    <TransferPaymentForm

                        total = {total}

                        onBack = {() => setStep("method")}

                        onSubmit = {handlePay}

                        loading = {loading}

                    />

                )}

                {currentStep === "success" && order && (

                    <PaymentSuccess order = {order} onViewOrders = {handleClose} onBackHome = {handleClose} />

                )}

            </Box>

        </Popover>

    );

}