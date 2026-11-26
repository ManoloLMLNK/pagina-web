import { useState } from "react";
import { canCancel, canRequestReturn, cancelOrder, refundedAmount, requestReturn, resolveReturn } from "../../../utils/orders";
import { formatCLP } from "../../../utils/currency";

const formatDate = (iso) => new Date(iso).toLocaleDateString("es-CL");

//cancelacion devolucion y reembolso de un pedido

export default function OrderActions({ order, buyerRut, isBuyer, isSeller, onChange }) {

    const [mode, setMode] = useState("");

    const [text, setText] = useState("");

    const [error, setError] = useState("");

    const { cancelacion, devolucion } = order;

    const open = (next) => {

        setMode(next);
        setText("");
        setError("");

    };

    const finish = (result) => {

        if (!result.ok) {

            setError(result.error);

            return;

        }

        open("");

        onChange();

    };

    const confirm = () => {

        if (mode === "cancel") finish(cancelOrder(buyerRut, order.id, text));

        if (mode === "return") finish(requestReturn(buyerRut, order.id, text));

    };

    return (

        <div style={{ fontSize: "0.85rem", textAlign: "left" }}>

            {cancelacion && <p>Cancelado el {formatDate(cancelacion.fecha)}. Motivo: {cancelacion.motivo}</p>}

            {devolucion && (

                <p>
                
                    Devolución <strong>{devolucion.estado}</strong>. Motivo: {devolucion.motivo}
                
                    {devolucion.respuesta ? `. Respuesta: ${devolucion.respuesta}` : ""}
                
                </p>
            
            )}

            {refundedAmount(order) > 0 && <p><strong>Reembolsado:</strong> {formatCLP(refundedAmount(order))}</p>}

            {!mode && (isBuyer || isSeller) && canCancel(order) && (
            
                <button type="button" onClick={() => open("cancel")}>Cancelar pedido</button>
            
            )}

            {!mode && isBuyer && canRequestReturn(order) && (
            
                <button type="button" onClick={() => open("return")}>Solicitar devolución</button>
            
            )}

            {mode && (
            
                <div>
                
                    <textarea
                
                        rows={2}
                        maxLength={200}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={mode === "cancel" ? "Motivo de la cancelación" : "Motivo de la devolución"}
                        aria-label="Motivo"
                        style={{ width: "100%", boxSizing: "border-box", font: "inherit" }}
                    
                    />
                    
                    <button type="button" onClick={confirm}>Confirmar</button>{" "}
                    
                    <button type="button" onClick={() => open("")}>Volver</button>
                
                </div>
            
            )}

            {isSeller && devolucion?.estado === "Solicitada" && (
                
                <div>
                
                    <textarea
                
                        rows={2}
                        maxLength={200}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Respuesta (obligatoria si rechazas)"
                        aria-label="Respuesta a la devolución"
                        style={{ width: "100%", boxSizing: "border-box", font: "inherit" }}
                    
                    />
                    
                    <button type="button" onClick={() => finish(resolveReturn(buyerRut, order.id, true, text))}>Aprobar y reembolsar</button>{" "}
                    
                    <button type="button" onClick={() => finish(resolveReturn(buyerRut, order.id, false, text))}>Rechazar</button>
                
                </div>
            
            )}

            {error && <p role="alert" style={{ color: "#d32f2f" }}>{error}</p>}

        </div>
    
    );

}