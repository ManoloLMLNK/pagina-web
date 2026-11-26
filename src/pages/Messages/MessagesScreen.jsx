import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import { useAuth } from "../../context/AuthContext";
import { getContacts, getConversation, sendMessage } from "../../utils/messages";

const boxStyle = { border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fff" };

const buttonStyle = { padding: "6px 14px", marginRight: 8, marginBottom: 8, border: "1px solid #5f4b8b", borderRadius: 999, background: "#fff", color: "#5f4b8b", cursor: "pointer" };

const activeStyle = { ...buttonStyle, background: "#5f4b8b", color: "#fff" };

export default function MessagesScreen() {

    const { currentUser, users } = useAuth();

    //cn quien se esta hablando va en la direccion /mensajes

    const [params, setParams] = useSearchParams();

    const other = params.get("con") ?? "";

    const [text, setText] = useState(params.get("asunto") ?? "");

    const [error, setError] = useState("");

    const [, setVersion] = useState(0);

    useEffect(() => {

        document.title = "CompraYa - Mensajes";

        //si llega un mensaje desde otra pestaña se actualiza

        const refresh = () => setVersion((v) => v + 1);

        window.addEventListener("storage", refresh);

        return () => window.removeEventListener("storage", refresh);

    }, []);

    if (!currentUser) return null;

    const rut = currentUser.rut;

    const userName = (r) => users.find((u) => u.rut === r)?.fullName ?? r;

    const valid = other !== rut && users.some((u) => u.rut === other);

    const contacts = getContacts(rut);

    if (valid && !contacts.includes(other)) contacts.unshift(other);

    const messages = valid ? getConversation(rut, other) : [];

    const openChat = (contact) => {

        setText("");

        setError("");

        setParams({ con: contact });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!text.trim()) return;

        if (sendMessage(rut, other, text)) {

            setText("");

            setError("");

        } else {

            setError("No se pudo enviar el mensaje.");

        }

    };

    return (

        <MainTemplate>

            <h2 className="section-title">Mensajes</h2>

            {contacts.length === 0 && <p>Aún no tienes conversaciones. Puedes iniciar una desde la página de un producto.</p>}

            <div>

                {contacts.map((c) => (

                    <button key={c} type="button" style={c === other ? activeStyle : buttonStyle} onClick={() => openChat(c)}>

                        {userName(c)}

                    </button>

                ))}

            </div>

            {valid && (

                <div style={boxStyle}>

                    <h3 className="section-title">Chat con {userName(other)}</h3>

                    {messages.length === 0 && <p>Escribe el primer mensaje.</p>}

                    {messages.map((m, i) => (

                        <div key={i} style={{ textAlign: m.from === rut ? "right" : "left", margin: "8px 0" }}>

                            <span style={{ display: "inline-block", maxWidth: "80%", padding: "8px 12px", borderRadius: 12, textAlign: "left", overflowWrap: "anywhere", background: m.from === rut ? "#ece7f6" : "#f2f2f2" }}>

                                {m.text}

                            </span>

                            <div style={{ fontSize: "0.7rem", color: "#777" }}>{new Date(m.date).toLocaleString("es-CL")}</div>

                        </div>

                    ))}

                    {error && <p role="alert" style={{ color: "#d32f2f" }}>{error}</p>}

                    <form onSubmit={handleSubmit}>

                        <textarea

                            rows={2}
                            maxLength={500}
                            aria-label="Mensaje"
                            placeholder="Escribe un mensaje..."
                            style={{ width: "100%", boxSizing: "border-box", margin: "8px 0", padding: 8, font: "inherit" }}
                            value={text}
                            onChange={(e) => setText(e.target.value)}

                        />

                        <button type="submit" style={activeStyle} disabled={!text.trim()}>Enviar</button>

                    </form>

                </div>

            )}

        </MainTemplate>

    );

}