import { useEffect, useState } from "react";
   import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import ListToolbar from "../../components/organisms/ListToolbar/ListToolbar";
import DataTable from "../../components/organisms/DataTable/DataTable";
import EmpresaFormDialog from "../../components/organisms/EmpresaFormDialog/EmpresaFormDialog";
import { useStoredList } from "../../hooks/useStoredList";
import { matchesSearch } from "../../utils/search";
import "../../styles/Admin.css";

//las columnas de la tabla, para quitar, agregar o reordenar, se edita esta lista

const COLUMNS = [
  
    { key: "nombre", label: "Nombre" },
  
    { key: "rut", label: "Rut" },

    { key: "telefono", label: "Teléfono" },

    { key: "correo", label: "Correo" },

    { key: "comuna", label: "Comuna" },

    { key: "paginaWeb", label: "Página Web" },

];

//la lista de empresas (solo para administradores)

export default function EmpresasScreen() {

    const { items: empresas, addItem, removeItem } = useStoredList("compraya_empresas");

    const [search, setSearch] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {

        document.title = "CompraYa - Empresas";

    }, []);

    const visibleEmpresas = empresas.filter((e) => matchesSearch([e.nombre, e.paginaWeb], search));

    const handleSave = (data) => {

        if (empresas.some((e) => e.rut === data.rut)) {

            return { ok: false, error: "Ya existe una empresa con ese RUT." };

        }

        const saved = addItem(data);

        console.log("Empresa guardada:", saved);

        return { ok: true };

    };

    const handleDelete = (empresa) => {

        if (window.confirm(`¿Eliminar la empresa "${empresa.nombre}"?`)) {

            removeItem(empresa.id);

        }

    };

    return (
    
        <MainTemplate
            
            toolbar={
        
                <ListToolbar
        
                    title="Empresas"
                    searchPlaceholder="Buscar por Nombre o Página Web"
                    searchValue={search}
                    onSearchChange={setSearch}        
                    onAdd={() => setDialogOpen(true)}
        
                />
      
            }
    
        >
    
            <DataTable
    
                columns={COLUMNS}
                rows={visibleEmpresas}
                minRows={search ? 0 : 10}
                emptyMessage="No se encontraron empresas."
                onDelete={handleDelete}
    
            />

    
            <EmpresaFormDialog
    
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
    
            />
    
        </MainTemplate>
  
    );

}