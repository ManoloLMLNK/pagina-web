import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import { useAuth } from "../../context/AuthContext";
import { getAllItems } from "../../data/catalog";
import { formatCLP } from "../../utils/currency";
import { acceptQuote, answerQuote, getClientQuotes, getSellerQuotes, getStatus, getTotals, requestQuotes } from "../../utils/quotes";
import { generateQuotePDF } from "../../utils/quotePdf";

const boxStyle = { border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fff" };

const buttonStyle = { padding: "6px 14px", marginRight: 8, border: "none", borderRadius: 6, background: "#5f4b8b", color: "#fff", cursor: "pointer" };

const textStyle = { display: "block", width: "100%", boxSizing: "border-box", margin: "8px 0", padding: 8, font: "inherit" };

//una cotizacion vista por el cliente o por el vendedor

function QuoteCard({ quote, isSeller, userName, onAnswer, onAccept }) {

    const [prices, setPrices] = useState(() => Object.fromEntries(quote.items.map((it) => [it.id, it.price])));

    const [answer, setAnswer] = useState("");

    const status = getStatus(quote);

    const answering = isSeller && status === "Solicitada";

    const items = answering ? quote.items.map((it) => ({ ...it, price: Number(prices[it.id]) })) : quote.items;

    const { subtotal, iva, total } = getTotals(items);

    const validPrices = items.every((it) => it.price > 0);

    return (

        <div style={boxStyle}>

            <p><strong>Cotización #{quote.id}</strong> — {status}</p>

            <p>{isSeller ? `Cliente: ${userName(quote.clientRut)}` : `Vendedor: ${userName(quote.sellerRut)}`}</p>

            {quote.message && <p>Mensaje del cliente: {quote.message}</p>}

            <ul>

                {quote.items.map((it) => (

                    <li key={it.id}>

                        {it.name} x {it.quantity} —{" "}

                        {answering ? (

                            <label>

                                precio unitario sin IVA:{" "}

                                <input type="number" min="1" value={prices[it.id]} onChange={(e) => setPrices({ ...prices, [it.id]: e.target.value })} />

                            </label>

                        ) : (

                            `${formatCLP(it.price)} c/u`

                        )}

                    </li>

                ))}

            </ul>

            <p>

                {status === "Solicitada" && !isSeller ? "Total referencial" : "Total"}: <strong>{formatCLP(total)}</strong>{" "}
                (neto {formatCLP(subtotal)} + IVA {formatCLP(iva)})

            </p>

            {quote.answer && <p>Respuesta: {quote.answer}</p>}

            {quote.expiresAt && <p>Válida hasta: {new Date(quote.expiresAt).toLocaleDateString("es-CL")}</p>}

            {answering && (

                <>

                    <textarea style={textStyle} rows={2} maxLength={300} placeholder="Comentario para el cliente (opcional)" value={answer} onChange={(e) => setAnswer(e.target.value)} />

                    <button type="button" style={buttonStyle} disabled={!validPrices} onClick={() => onAnswer(quote.id, prices, answer.trim())}>

                        Responder cotización

                    </button>

                </>

            )}

            {!isSeller && status === "Respondida" && (

                <button type="button" style={buttonStyle} onClick={() => onAccept(quote.id)}>Aceptar cotización</button>

            )}

            {quote.answeredAt && (

                <button type="button" style={buttonStyle} onClick={() => generateQuotePDF(quote, userName(quote.clientRut), userName(quote.sellerRut))}>

                    Descargar PDF

                </button>

            )}

        </div>

    );

}

export default function QuotesScreen() {

    const { currentUser, users } = useAuth();

    const [params] = useSearchParams();

    //los productos elegidos y su cantidad si se llega desde un producto ya viene marcado

    const [selected, setSelected] = useState(() => (params.get("item") ? { [params.get("item")]: 1 } : {}));

    const [message, setMessage] = useState("");

    const [notice, setNotice] = useState("");

    const [, setVersion] = useState(0);

    useEffect(() => {

        document.title = "CompraYa - Cotizaciones";

    }, []);

    if (!currentUser) return null;

    const rut = currentUser.rut;

    //solo se pueden cotizar publicaciones de otros vendedores

    const available = getAllItems().filter((it) => it.sellerRut && it.sellerRut !== rut);

    const chosen = available.filter((it) => selected[it.id] >= 1).map((it) => ({ ...it, quantity: selected[it.id] }));

    const sent = getClientQuotes(rut);

    const received = getSellerQuotes(rut);

    const userName = (r) => users.find((u) => u.rut === r)?.fullName ?? r;

    const refresh = (ok, text) => {

        setNotice(ok ? text : "No se pudo completar la acción.");

        setVersion((v) => v + 1);

    };

    const toggle = (id) => setSelected(({ [id]: current, ...rest }) => (current === undefined ? { ...rest, [id]: 1 } : rest));

    const handleRequest = () => {

        const count = requestQuotes(rut, chosen, message.trim());

        if (count) {

            setSelected({});

            setMessage("");

        }

        refresh(count > 0, `Solicitud enviada (${count} cotización/es).`);

    };

    return (

        <MainTemplate>

            <h2 className="section-title">Cotizaciones</h2>

            {notice && <p role="status">{notice}</p>}

            <div style={boxStyle}>

                <h3 className="section-title">Nueva solicitud</h3>

                {available.length === 0 && <p>No hay publicaciones de vendedores para cotizar.</p>}

                {available.map((it) => (

                    <p key={it.id}>

                        <label>

                            <input type="checkbox" checked={selected[it.id] !== undefined} onChange={() => toggle(it.id)} />{" "}
                            {it.name} — {formatCLP(it.price)}

                        </label>

                        {selected[it.id] !== undefined && (

                            <input

                                type="number"
                                min="1"
                                aria-label={`Cantidad de ${it.name}`}
                                style={{ width: 70, marginLeft: 8 }}
                                value={selected[it.id]}
                                onChange={(e) => setSelected({ ...selected, [it.id]: e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value))) })}

                            />

                        )}

                    </p>

                ))}

                <textarea style={textStyle} rows={2} maxLength={300} placeholder="¿Qué necesitas? (opcional)" value={message} onChange={(e) => setMessage(e.target.value)} />

                <button type="button" style={buttonStyle} disabled={chosen.length === 0} onClick={handleRequest}>Solicitar cotización</button>

            </div>

            <h3 className="section-title">Mis solicitudes ({sent.length})</h3>

            {sent.map((q) => (

                <QuoteCard key={q.id} quote={q} userName={userName} onAccept={(id) => refresh(acceptQuote(id, rut), "Cotización aceptada.")} />

            ))}

            {(currentUser.roles?.includes("vendedor") || received.length > 0) && (

                <>

                    <h3 className="section-title">Solicitudes recibidas ({received.length})</h3>

                    {received.map((q) => (

                        <QuoteCard key={q.id} quote={q} isSeller userName={userName} onAnswer={(id, prices, text) => refresh(answerQuote(id, rut, prices, text), "Cotización respondida.")} />

                    ))}

                </>

            )}

        </MainTemplate>

    );

}