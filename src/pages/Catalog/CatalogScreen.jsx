import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import Breadcrumb from "../../components/molecules/Breadcrumb/Breadcrumb";
import CategoryRow from "../../components/organisms/CategoryRow/CategoryRow";
import ItemGrid from "../../components/organisms/ItemGrid/ItemGrid";
import { TIPOS, findPath, getCategories, getItems } from "../../data/catalog";

//catalogo de productos o servicios cn cualquier nivel de categoria en la direccion

export default function CatalogScreen({ tipo }) {
    
    const route = useParams()["*"] ?? "";
    
    const path = route.split("/").filter(Boolean);
    
    const [search, setSearch] = useState("");

    const trail = findPath(tipo, path);
    
    const { label } = TIPOS[tipo];
    
    const current = trail?.[trail.length - 1];

    useEffect(() => {
    
        setSearch("");
    
    }, [tipo, route]);

    useEffect(() => {
    
        document.title = `CompraYa - ${current?.label ?? label}`;
    
    }, [current?.label, label]);

    if (!trail) return <Navigate to={`/${tipo}`} replace />;

    const urlOf = (depth) => `/${[tipo, ...path.slice(0, depth)].join("/")}`;

    const segments = [
    
        { label, to: `/${tipo}` },
    
        ...trail.map((node, i) => ({ label: node.label, to: urlOf(i + 1) })),
    
    ];

    const tiles = current ? current.subcategories : getCategories(tipo);
    
    const items = getItems({ tipo, path, search });

    return (
    
        <MainTemplate searchPlaceholder={`Buscar ${label}`} searchValue={search} onSearchChange={setSearch}>
        
            <Breadcrumb segments={segments} />
        
            {tiles.length > 0 && <CategoryRow categories={tiles} baseUrl={urlOf(path.length)} />}
        
            <ItemGrid items={items} minSlots={search ? 0 : 14} emptyMessage="No se encontraron resultados." />
        
        </MainTemplate>
    
    );

}