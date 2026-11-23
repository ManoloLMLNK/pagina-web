import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { useCart } from "../../../context/CartContext";
import CustomButton from "../../atoms/Button/CustomButton";
import QuantitySelector from "../../molecules/QuantitySelector/QuantitySelector";
import { useAuth } from "../../../context/AuthContext";
import { isInWishlist, toggleWishlist } from "../../../utils/wishlist";
import ItemComments from "../ItemComments/ItemComments";

export default function ItemDetailView({ item, typeLabel }) {
  
    const { addItem } = useCart();

    const { currentUser } = useAuth();
  
    const [selectedImage, setSelectedImage] = useState(0);
  
    const [quantity, setQuantity] = useState(1);
  
    const [liked, setLiked] = useState(false);

//el corazon sale lleno si el producto ya esta en los deseados de esta cuenta

    useEffect(() => {

        if (currentUser) setLiked(isInWishlist(currentUser.rut, item.id));

    }, [currentUser, item.id]);

    const handleToggleLike = () => {

        if (!currentUser) return;

        setLiked(toggleWishlist(currentUser.rut, item.id).includes(item.id));

    };
  
    const [added, setAdded] = useState(false);

    const images = item.images ?? [];

    const handleAdd = () => {
  
        console.log("Agregando desde el detalle:", item.id, "cantidad:", quantity);
  
        addItem(item, quantity);

        setAdded(true);
    
        setTimeout(() => setAdded(false), 1500);
  
    };
  
    return (
  
        <div className="item-detail">
  
            <div className="item-detail__gallery">
                
                <div className="item-detail__main-image">
          
                    {images[selectedImage] ? (
                        
                        <img src={images[selectedImage]} alt={item.name} />
          
                      ) : (
            
                        <span>Sin imagen</span>
          
                      )}
        
                </div>

                {images.length > 1 && (
        
                    <div className="item-detail__thumbs">
        
                        {images.map((src, i) => (
        
                            <button
        
                                key={i}
        
                                type="button"
        
                                className={`item-detail__thumb${i === selectedImage ? " active" : ""}`}
        
                                onClick={() => setSelectedImage(i)}
        
                                aria-label={`Ver imagen ${i + 1}`}
        
                            >
        
                                <img src={src} alt="" />
        
                            </button>
        
                        ))}
        
                    </div>
        
                )}
      
            </div>

      
            <div className="item-detail__side">
      
                <section className="item-detail__panel">
      
                    <h1 className="item-detail__title">{item.title ?? item.name}</h1>

      
                    <div className="item-detail__meta">
      
                        <span>
      
                          ID del {typeLabel}: {item.displayId}
      
                        </span>
      
                        <IconButton
      
                            onClick={handleToggleLike}
      
                            aria-label={liked ? "Quitar de la lista de deseos" : "Agregar a la lista de deseos"}
      
                        >
      
                            {liked ? <Favorite color="error" /> : <FavoriteBorder />}
      
                        </IconButton>
      
                    </div>

                    <p className="item-detail__rating">
      
                        estrella {item.rating}
      
                        <span>({item.reviews})</span>
      
                    </p>
      
                </section>

                <section className="item-detail__panel">
      
                    <div className="item-detail__quantity">
      
                        <span>Cantidad</span>
      
                        <QuantitySelector value={quantity} onChange={setQuantity} />
      
                    </div>

                    <CustomButton onClick={handleAdd}>
      
                        {added ? "Agregado al carro" : "Agregar al Carro"}
      
                    </CustomButton>
      
                </section>

                {item.description && (
      
                    <section className="item-detail__panel">
      
                        <h2 className="item-detail__subtitle">Descripción</h2>
      
                        <p className="item-detail__description">{item.description}</p>
      
                    </section>
      
                )}

                <ItemComments key = {item.id} itemId = {item.id} />
      
            </div>
    
        </div>
  
    );

}