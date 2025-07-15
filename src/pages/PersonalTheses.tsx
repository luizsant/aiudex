import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Search,
  Edit,
  Trash2,
  Play,
  Eye,
  Edit3,
  Clock,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const mockTheses = [
  {
    id: 1,
    title: "Tese de Exemplo 1",
    area: "Cível",
    tags: ["contrato", "danos"],
    content: "Conteúdo da tese 1...",
    bgColor: "bg-blue-100",
    color: "text-blue-600",
    icon: BookOpen,
    author: "Dr. João Silva",
    successRate: "92%",
    lastUsed: "2024-03-10",
  },
  {
    id: 2,
    title: "Tese de Exemplo 2",
    area: "Trabalhista",
    tags: ["rescisão"],
    content: "Conteúdo da tese 2...",
    bgColor: "bg-orange-100",
    color: "text-orange-600",
    icon: BookOpen,
    author: "Dra. Maria Santos",
    successRate: "88%",
    lastUsed: "2024-03-08",
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR");
}

const PersonalTheses = () => {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [theses, setTheses] = useState(mockTheses);

  const filtered = theses.filter(
    (t) =>
      (t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.includes(search.toLowerCase()))) &&
      (area === "" || t.area === area)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Banco de Teses Pessoais"
        subtitle="Cadastre, organize e utilize suas teses jurídicas pessoais para alimentar a IA e padronizar o escritório"
        icon={<FileText className="w-5 h-5 md:w-6 md:h-6" />}
        actions={
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nova Tese
          </Button>
        }
      />
      <div className="max-w-5xl mx-auto p-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar tese ou tag..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
                <Input
                  placeholder="Área (ex: Cível)"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.length === 0 && (
                <Card className="col-span-full text-center py-12">
                  <CardContent>
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma tese encontrada
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Crie sua primeira tese pessoal
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Tese
                    </Button>
                  </CardContent>
                </Card>
              )}
              {filtered.map((tese) => (
                <Card
                  key={tese.id}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div
                        className={`w-16 h-16 ${tese.bgColor} rounded-lg flex items-center justify-center mx-auto`}>
                        <tese.icon className={`w-8 h-8 ${tese.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {tese.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {tese.area} • {tese.author}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {tese.successRate} sucesso
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(tese.lastUsed)}</span>
                      </div>
                      <div className="space-y-3">
                        <Button
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); /* Lógica para usar tese */
                          }}>
                          <Play className="w-4 h-4 mr-2" />
                          Usar Tese
                        </Button>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 transform hover:scale-105 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation(); /* Lógica para visualizar */
                            }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 transform hover:scale-105 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation(); /* Lógica para editar */
                            }}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalTheses;
