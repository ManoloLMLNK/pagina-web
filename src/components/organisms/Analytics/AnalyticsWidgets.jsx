import { Box, Paper, Typography } from "@mui/material";

export const NO_DATA = "No hay registros";

//simplicfica ganancias grandes

export function formatCompactCLP(value) {

    if (value >= 1000000) return `$${(value / 1000000).toFixed(1).replace(".", ",")}M`;

    if (value >= 1000) return `$${Math.round(value / 1000)}k`;

    return `$${value}`;

}

function NoData() {

    return (

        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>

            {NO_DATA}

        </Typography>

    );

}

//una tarjeta cn un numero si es 0 dice No hay registros

export function StatCard({ label, value, format = String }) {

    return (

        <Paper variant="outlined" sx={{ p: 2 }}>

            <Typography variant="caption" color="text.secondary">{label}</Typography>

            {value ? (

                <Typography variant="h5" fontWeight={700}>{format(value)}</Typography>

            ) : (

                <NoData />

            )}

        </Paper>

    );

}

export function ChartCard({ title, children }) {

    return (

        <Paper variant="outlined" sx={{ p: 2 }}>

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{title}</Typography>

            {children}

        </Paper>

    );

}

const CHART_HEIGHT = 140;

//columnas verticales sii todo esta en 0 No hay registros

export function ColumnChart({ data, format = String }) {

    const max = Math.max(0, ...data.map((d) => d.value));

    if (max === 0) return <NoData />;

    return (

        <Box sx={{ display: "flex", gap: 1 }}>

            {data.map((d) => {

                const height = d.value > 0 ? Math.max(4, Math.round((d.value / max) * CHART_HEIGHT)) : 0;

                return (

                    <Box key={d.label} sx={{ flex: 1, minWidth: 0, textAlign: "center" }}>

                        <Box

                            sx={{

                                height: CHART_HEIGHT + 18,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                alignItems: "center",

                            }}

                        >

                            {d.value > 0 && (

                                <Typography variant="caption" sx={{ fontSize: 10, lineHeight: "18px" }}>

                                    {format(d.value)}

                                </Typography>

                            )}

                            <Box sx={{ width: "70%", height, bgcolor: "primary.main", borderRadius: "4px 4px 0 0" }} />

                        </Box>

                        <Typography variant="caption" color="text.secondary">{d.label}</Typography>

                    </Box>

                );

            })}

        </Box>

    );

}

//barras horizontales una fila en 0 dice No hay registros

export function BarList({ data, format = String }) {

    const max = Math.max(0, ...data.map((d) => d.value));

    if (data.length === 0 || max === 0) return <NoData />;

    return (

        <Box sx={{ display: "grid", gap: 1.5 }}>

            {data.map((d, i) => (

                <Box key={`${d.label}-${i}`}>

                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>

                        <Typography variant="body2" noWrap>{d.label}</Typography>

                        <Typography variant="body2" fontWeight={600} color={d.value ? "text.primary" : "text.secondary"} noWrap>

                            {d.value ? format(d.value) : NO_DATA}

                        </Typography>

                    </Box>

                    {d.value > 0 && (

                        <Box sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", mt: 0.5 }}>

                            <Box sx={{ height: "100%", width: `${(d.value / max) * 100}%`, bgcolor: "primary.main", borderRadius: 4 }} />

                        </Box>

                    )}

                </Box>

            ))}

        </Box>

    );

}

//produtos cn poco stock alerta de inventario

export function LowStockList({ data }) {

    if (data.length === 0) return <NoData />;

    return (

        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 1 }}>

            {data.map((d, i) => (

                <Box component="li" key={`${d.label}-${i}`} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>

                    <Typography variant="body2" noWrap>{d.label}</Typography>

                    <Typography variant="body2" fontWeight={600} color={d.stock === 0 ? "error.main" : "warning.main"} noWrap>

                        {d.stock === 0 ? "Agotado" : `Quedan ${d.stock}`}

                    </Typography>

                </Box>

            ))}

        </Box>

    );

}