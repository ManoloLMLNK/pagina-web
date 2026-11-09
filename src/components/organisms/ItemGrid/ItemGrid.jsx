import ItemCard from "../../molecules/ItemCard/ItemCard";

export default function ItemGrid({items, minSlots = 14, emptyMessage = "No hay resultados"}) {

    if (items.length === 0 && minSlots === 0) {

        return <p className = "item-grid__empty">{emptyMessage}</p>;

    }

    const emptySlots = Math.max(0, minSlots - items.length);

    return (

        <div className = "card-row">

            {items.map((item) => (

                <ItemCard key = {item.id} item = {item} />

            ))}

            {Array.from({length: emptySlots}).map((_, i) => (

                <div className = "card placeholder" key = {`empty-${i}`} />

            ))}

        </div>
        
    );

}