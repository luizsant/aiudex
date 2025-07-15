import { SimplifiedEditor } from "@/components/SimplifiedEditor";
import { useNavigate } from "react-router-dom";

const SimplifiedEditorPage = () => {
  const navigate = useNavigate();

  const handleSave = (document: any) => {
    // Redirecionar para a página de documentos após salvar
    navigate("/documents");
  };

  return <SimplifiedEditor onSave={handleSave} />;
};

export default SimplifiedEditorPage;
