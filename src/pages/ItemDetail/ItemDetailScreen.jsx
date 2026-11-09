import { useParams } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import ItemDetailView from "../../components/organisms/ItemDetailView/ItemDetailView";
import { getItemById } from "../../data/catalog";

export default function ItemDetailScreen() {

    const { id } = useParams();

    const item = getItemById(id);


    return (

        <MainTemplate>
            
            {item ? (
                
                <ItemDetailView item={item} />
            
            ) : (
            
                <p className="item-grid__empty">No se encontró el producto.</p>

            )}
    
        </MainTemplate>
    
    );

}