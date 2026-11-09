import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import Breadcrumb from "../../components/molecules/Breadcrumb/Breadcrumb";
import CategoryRow from "../../components/organisms/CategoryRow/CategoryRow";
import ItemGrid from "../../components/organisms/ItemGrid/ItemGrid";
import {

    TIPOS,
    findCategory,
    findSubcategory,
    getCategories,
    getItems,

} from "../../data/catalog";

export default function CatalogScreen({ tipo }) {

    const { categoria, subcategoria } = useParams();

    const [search, setSearch] = useState("");

    const tipoInfo = TIPOS[tipo];

    const category = categoria ? findCategory(tipo, categoria) : undefined;

    const subcategory = subcategoria ? findSubcategory(tipo, categoria, subcategoria) : undefined;

    const isInvalidPath = Boolean(categoria && !category) || Boolean(subcategoria && !subcategory);

    const currentLabel = subcategory?.label ?? category?.label ?? tipoInfo.label;

    useEffect(() => {

        document.title = `CompraYa - ${currentLabel}`;

    }, [currentLabel]);

    useEffect(() => {

        setSearch("");

    }, [tipo, categoria, subcategoria]);


    if (isInvalidPath) {

        return <Navigate to={`/${tipo}`} replace />;

    }

    const segments = [{ label: tipoInfo.label, to: `/${tipo}` }];

    if (category) {

        segments.push({ label: category.label, to: `/${tipo}/${category.id}` });

    }

    if (subcategory) {

        segments.push({ label: subcategory.label, to: `/${tipo}/${category.id}/${subcategory.id}` });

    }

    let tiles = getCategories(tipo);

    let tilesBaseUrl = `/${tipo}`;

    if (category) {

        tiles = category.subcategories;

        tilesBaseUrl = `/${tipo}/${category.id}`;

    }

    const items = getItems({ tipo, categoria, subcategoria, search });

    return (

        <MainTemplate

        searchPlaceholder={`Buscar ${tipoInfo.label}`}

        searchValue={search}

        onSearchChange={setSearch}

        >

      <Breadcrumb segments={segments} />

      {!subcategoria && <CategoryRow categories={tiles} baseUrl={tilesBaseUrl} />}

        <ItemGrid

            items={items}

            minSlots={search ? 0 : 14}

            emptyMessage="No se encontraron resultados."

        />
    
    </MainTemplate>
  
    );

}