import { useState } from "react";
import { REGIONES } from "../../../data/chile";
import { saveRates, shippingCost } from "../../../utils/shipping";

//el vendedor define cuanto cobra por enviar a cada region

export default function ShippingRates({ sellerRut }) {

    const [rates, setRates] = useState(() => Object.fromEntries(REGIONES.map((r) => [r.id, shippingCost(sellerRut, r.id)])));

    const [notice, setNotice] = useState("");

    return (

        <details style={{ margin: "12px 0" }}>

            <summary style={{ cursor: "pointer" }}>Mis tarifas de envío por región</summary>

            {REGIONES.map((r) => (

                <p key={r.id}>

                    <label>

                        {r.nombre}: ${" "}

                        <input type="number" min="0" value={rates[r.id]} onChange={(e) => { setRates({ ...rates, [r.id]: e.target.value }); setNotice(""); }} />

                    </label>

                </p>

            ))}

            <button type="button" onClick={() => setNotice(saveRates(sellerRut, rates) ? "Tarifas guardadas." : "No se pudo guardar.")}>

                Guardar tarifas

            </button>{" "}

            <span role="status">{notice}</span>

        </details>

    );

}