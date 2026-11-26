import { useState } from "react";
import { saveTracking } from "../../../utils/shipping";

export default function TrackingForm({ order }) {

    const [company, setCompany] = useState(order.transportista ?? "");

    const [number, setNumber] = useState(order.seguimiento ?? "");

    const [notice, setNotice] = useState("");

    const handleSave = () => {

        const ok = saveTracking(order.buyerRut, order.id, company.trim(), number.trim());

        setNotice(ok ? "Guardado" : "No se pudo guardar");

    };

    return (

        <div style={{ display: "grid", gap: 4, marginTop: 4 }}>

            <input aria-label="Empresa de transporte" placeholder="Empresa de transporte" value={company} onChange={(e) => { setCompany(e.target.value); setNotice(""); }} />

            <input aria-label="Número de seguimiento" placeholder="N° de seguimiento" value={number} onChange={(e) => { setNumber(e.target.value); setNotice(""); }} />

            <button type="button" onClick={handleSave} disabled={!company.trim() || !number.trim()}>Guardar</button>

            <span role="status">{notice}</span>

        </div>

    );

}