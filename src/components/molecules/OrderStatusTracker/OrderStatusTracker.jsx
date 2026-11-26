import { ORDER_STATES } from "../../../utils/orders";

//muestra los 4 estados del pedido y marca hasta donde

export default function OrderStatusTracker({ estado }) {

    const current = ORDER_STATES.indexOf(estado);

    return (

        <ol

            aria-label="Estado del pedido"
            
            style={{ display: "flex", flexWrap: "wrap", gap: 6, listStyle: "none", padding: 0, margin: "6px 0" }}

        >

            {ORDER_STATES.map((state, index) => {

                const reached = index <= current;

                return (

                    <li

                        key={state}
                        aria-current={index === current ? "step" : undefined}
                        style={{

                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: "0.78rem",
                            background: reached ? "#5f4b8b" : "#ececf0",
                            color: reached ? "#ffffff" : "#7a7a80",
                            fontWeight: index === current ? 700 : 400,

                        }}

                    >

                        {state}

                    </li>

                );

            })}

        </ol>

    );

}