import {Fragment} from "react";
import {Link as RouterLink} from "react-router-dom";

export default function Breadcrumb({segments, linkLast = false}) {

    return (

        <nav className = "breadcrumb" aria-label = "Ruta de navegación">

            {segments.map ((seg, i) => {

                const isLast = i === segments.length - 1;

                const asText = isLast && !linkLast;

                return (

                    <Fragment key = {`${seg.label}-${i}`}>

                        {asText ? (

                            <span className = "breadcrumb__current" aria-current = "page">

                                {seg.label}

                            </span>

                        ) : (

                            <RouterLink to = {seg.to} className = "breadcrumb__link">

                                {seg.label}

                            </RouterLink>

                        )}

                        {!isLast && (
                        
                            <span className = "breadcrumb__sep" aria-hidden = "true">

                                &gt;

                            </span>
                        
                        )}

                        </Fragment>

                );

            })}

        </nav>

    );

}