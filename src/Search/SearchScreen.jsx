import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainTemplate from "../components/templates/MainTemplate/MainTemplate";
import ItemGrid from "../components/organisms/ItemGrid/ItemGrid";
import { TIPOS, getItems } from "../data/catalog";

//los resultados de buscar desde el inicio o desde el detalle
//muestra los productos y los servicios q coinciden cada grupo por separado

export default function SearchScreen() {

    const [params] = useSearchParams();

    const query = (params.get("q") ?? "").trim();

    useEffect(() => {

        document.title = query ? `CompraYa - Buscar: ${query}` : "CompraYa - Buscar";

    }, [query]);

    const productos = query ? getItems({ tipo: "productos", search: query }) : [];

    const servicios = query ? getItems({ tipo: "servicios", search: query }) : [];

    const total = productos.length + servicios.length;


    return (

        <MainTemplate initialSearch={query}>
      
            <h2 className="section-title">{query ? `Resultados para “${query}”` : "Buscar"}</h2>

            {!query && <p className="item-grid__empty">Escribe en el buscador lo que necesitas.</p>}

            {query && total === 0 && (
        
                <p className="item-grid__empty">
          
                    No se encontraron resultados para “{query}”. Prueba con otra palabra.
        
                </p>
            
            )}

            {productos.length > 0 && (
        
                <>
          
                    <h3 className="section-title">
            
                        {TIPOS.productos.label} ({productos.length})
          
                    </h3>
          
                    <ItemGrid items={productos} minSlots={0} />
        
                </>
      
            )}

            {servicios.length > 0 && (
        
                <>
          
                    <h3 className="section-title">
            
                        {TIPOS.servicios.label} ({servicios.length})
          
                    </h3>
          
                    <ItemGrid items={servicios} minSlots={0} />
        
                </>
      
            )}
        
        </MainTemplate>
    
    );

}