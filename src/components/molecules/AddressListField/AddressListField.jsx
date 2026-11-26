import FormField from "../FormField/FormField";
import { REGIONES, getComunas } from "../../../data/chile";
import { createAddress } from "../../../utils/addresses";

const REGION_OPTIONS = REGIONES.map((r) => ({ value: r.id, label: r.nombre }));

const MAX_ADDRESSES = 5;

const MAX_STREET = 100;

const cardStyle = {

    border: "1px solid #e1e1e8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    display: "grid",
    gap: 10,

};

//lista de direcciones de despacho calle region comuna
//la primera es obligatoria se pueden agregar hasta MAX_ADDRESSES

export default function AddressListField({ addresses, onChange, errors = {}, idPrefix = "address" }) {

    const update = (id, changes) => onChange(addresses.map((a) => (a.id === id ? { ...a, ...changes } : a)));

    const remove = (id) => onChange(addresses.filter((a) => a.id !== id));

    return (

        <div className="address-list">

            <p style={{ margin: "0 0 8px", fontWeight: 500 }}>Direcciones de despacho</p>

            {addresses.map((address, index) => {

                const err = errors[address.id] ?? {};

                return (

                    <div key={address.id} style={cardStyle}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                            <strong style={{ fontSize: "0.85rem" }}>Dirección {index + 1}</strong>

                            {index > 0 && (

                                <button type="button" onClick={() => remove(address.id)}>

                                    Quitar

                                </button>

                            )}

                        </div>

                        <FormField

                            id={`${idPrefix}-${address.id}-calle`}
                            label="Calle y número"
                            required={index === 0}
                            placeholder="Ej: Av. Francia 12, depto 3"
                            value={address.calle}
                            onChange={(e) => update(address.id, { calle: e.target.value.slice(0, MAX_STREET) })}
                            error={err.calle}

                        />

                        <FormField

                            id={`${idPrefix}-${address.id}-region`}
                            label="Región"
                            required={index === 0}
                            placeholder="Selecciona región"
                            options={REGION_OPTIONS}
                            value={address.regionId}
                            onChange={(e) => update(address.id, { regionId: e.target.value, comuna: "" })}
                            error={err.regionId}

                        />

                        <FormField

                            id={`${idPrefix}-${address.id}-comuna`}
                            label="Comuna"
                            required={index === 0}
                            placeholder="Selecciona comuna"
                            options={getComunas(address.regionId).map((c) => ({ value: c, label: c }))}
                            disabled={!address.regionId}
                            value={address.comuna}
                            onChange={(e) => update(address.id, { comuna: e.target.value })}
                            error={err.comuna}

                        />

                    </div>

                );

            })}

            {addresses.length < MAX_ADDRESSES && (

                <button type="button" onClick={() => onChange([...addresses, createAddress()])}>

                    + Agregar otra dirección

                </button>

            )}

        </div>

    );

}