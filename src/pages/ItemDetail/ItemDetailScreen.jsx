import { useParams } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import ItemDetailView from "../../components/organisms/ItemDetailView/ItemDetailView";
import ItemGrid from "../../components/organisms/ItemGrid/ItemGrid";
import { getItemById, getRelated, TIPOS } from "../../data/catalog";

export default function ItemDetailScreen() {

    const { id } = useParams();

    const item = getItemById(id);

    const related = item ? getRelated(item) : [];

    return (

        <MainTemplate>

            {item ? (

                <>

                    <ItemDetailView key={item.id} item={item} typeLabel={TIPOS[item.tipo]?.itemLabel ?? "producto"} />

                    {related.length > 0 && (

                        <>

                            <h2 className="section-title">Relacionados</h2>

                            <ItemGrid items={related} minSlots={0} />

                        </>

                    )}

                </>

            ) : (

                <p className="item-grid__empty">No se encontró el producto.</p>

            )}

        </MainTemplate>

    );

}