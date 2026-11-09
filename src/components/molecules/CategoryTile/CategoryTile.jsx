import {Link} from "react-router-dom";

export default function CategoryTitle({label, icon, to}) {

    return (

        <Link to = {to} className = "category-item category-item--link">

            <div className = "category-icon">

                {typeof icon === "string" && icon.includes("/") ? (

                    <img src = {icon} alt = "" style = {{width: 40, height: 40, objectFit: "contain"}} />

                ) : (

                    icon

                )}

            </div>

            <span>{label}</span>

        </Link>

    );

}