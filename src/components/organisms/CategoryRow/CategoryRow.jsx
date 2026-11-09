import { CATEGORIES } from "../../../data/catalog";
import CategoryTile from "../../molecules/CategoryTile/CategoryTile";

const MIN_TILES = 12;

export default function CategoryRow({categories, baseUrl}) {

    const emptyTitles = Math.max(0, MIN_TILES - categories.length);

    return (

        <div className = "category-row">

            {categories.map((cat) => (

                <CategoryTile 
                    
                    key = {cat.id}
                    
                    label = {cat.label}
                    
                    icon = {cat.icon}

                    to = {`${baseUrl}/${cat.id}`}

                />

            ))}

            {Array.from({length: emptyTitles}).map((_, i) => (

                <div className = "category-item placeholder" key = {`empty-${i}`} />

            ))}

        </div>

    );

}