import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import {
    BarList,
    ChartCard,
    ColumnChart,
    LowStockList,
    StatCard,
    formatCompactCLP,
} from "../../components/organisms/Analytics/AnalyticsWidgets";
import { useAuth } from "../../context/AuthContext";
import { formatCLP } from "../../utils/currency";
import { getAdminAnalytics, getOperationAndQuality, getSellerAnalytics } from "../../utils/analytics";

//se acomodan solas mas columnas en pantallas grandes una sola en el celular

const STATS_GRID = { display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", mb: 3 };

const CHARTS_GRID = { display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", mb: 3 };

//lo primero q ven el administrador y el vendedor al iniciar sesion

export default function DashboardScreen() {

    const { currentUser, users } = useAuth();

    const isAdmin = currentUser?.role === "administrador";

    useEffect(() => {

        document.title = "CompraYa - Panel";

    }, []);

    const data = useMemo(

        () => (isAdmin ? getAdminAnalytics(users) : getSellerAnalytics(currentUser.rut)),

        [isAdmin, users, currentUser]

    );

    const extra = useMemo(

        () => getOperationAndQuality(users, isAdmin ? undefined : currentUser.rut),

        [isAdmin, users, currentUser]

    );

    return (

        <MainTemplate>
        
            <h2 className="section-title">{isAdmin ? "Panel de administración" : "Panel de ventas"}</h2>

            <p style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        
                <Link to="/ventas">Ver historial de ventas</Link>
        
                <Link to="/reportes">Reportes</Link>
        
                <Link to="/moderacion">Preguntas y mensajes</Link>
        
            </p>

            <h3 className="section-title">Análisis comercial</h3>

            <Box sx={STATS_GRID}>
        
                {isAdmin ? (
        
                    <>
                    
                        <StatCard label="Ganancia de la plataforma (5%)" value={data.commission} format={formatCLP} />
                        <StatCard label="Total vendido (con IVA)" value={data.totalSold} format={formatCLP} />
                        <StatCard label="Pedidos vigentes" value={data.orderCount} />
                        <StatCard label="Usuarios registrados" value={data.userCount} />
                    
                    </>
                
                ) : (
                
                    <>
                    
                        <StatCard label="Ingresos (sin IVA)" value={data.revenue} format={formatCLP} />
                        <StatCard label="Unidades vendidas" value={data.unitsSold} />
                        <StatCard label="Pedidos recibidos" value={data.orderCount} />
                        <StatCard label="Mis publicaciones" value={data.itemCount} />
                    
                    </>
                
                )}
            
            </Box>

            <Box sx={CHARTS_GRID}>
            
                <ChartCard title="Ventas por mes">
            
                    <ColumnChart data={data.salesByMonth} format={formatCompactCLP} />
            
                </ChartCard>
            
                <ChartCard title="Lo más vendido (unidades)">
            
                    <BarList data={data.topItems} />
            
                </ChartCard>
            
                {isAdmin ? (
            
                    <ChartCard title="Usuarios por rol">
                    
                        <BarList data={data.usersByRole} />
                    
                    </ChartCard>
                
                ) : (
                
                    <ChartCard title="Inventario crítico (menos de 10)">
                    
                        <LowStockList data={data.lowStock} />
                    
                    </ChartCard>
                
                )}
            
            </Box>

            <h3 className="section-title">Análisis operativo</h3>

            <Box sx={STATS_GRID}>
            
                <StatCard label="Días promedio de entrega" value={extra.deliveryDays} />
            
            </Box>

            <Box sx={CHARTS_GRID}>
            
                <ChartCard title="Pedidos por estado">
            
                    <BarList data={extra.ordersByState} />
            
                </ChartCard>
            
                <ChartCard title="Despachos por empresa de transporte">
            
                    <BarList data={extra.byCarrier} />
            
                </ChartCard>
            
                <ChartCard title="Despachos por región">
            
                    <BarList data={extra.byRegion} />
            
                </ChartCard>
            
            </Box>

            <h3 className="section-title">Análisis de calidad</h3>

            <Box sx={STATS_GRID}>
            
                <StatCard label="Calificación promedio" value={extra.rating} />
                <StatCard label="Tasa de devoluciones" value={extra.returnRate} format={(v) => `${v}%`} />
                <StatCard label="Preguntas sin respuesta (+48 h)" value={extra.lateQuestions} />
                <StatCard label="Mensajes sin respuesta (+48 h)" value={extra.lateChats} />
            
            </Box>

            <Box sx={CHARTS_GRID}>
            
                <ChartCard title="Reseñas por estrellas">
            
                    <BarList data={extra.stars} />
            
                </ChartCard>
            
                <ChartCard title="Alerta: publicaciones bajo 3 estrellas">
            
                    <BarList data={extra.lowRated} />
            
                </ChartCard>
            
            </Box>
        
        </MainTemplate>
    
    );

}