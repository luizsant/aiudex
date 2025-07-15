import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Scissors,
  Image,
  FileArchive,
  FilePlus,
  FileInput,
  ArrowRight,
  Play,
  Edit3,
  Clock,
  X,
  Gavel,
  Users,
  MessageSquare,
  RefreshCw,
  Megaphone,
  FileCheck,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import PdfCompressor from "@/components/PdfCompressor";
import PdfSplitter from "@/components/PdfSplitter";
import PdfMerger from "@/components/PdfMerger";
import MediaTranscriber from "@/components/MediaTranscriber";

const tools = [
  {
    id: 1,
    name: "Compressão de PDF",
    icon: <FileArchive className="w-6 h-6" />,
    desc: "Reduza o tamanho de arquivos PDF facilmente.",
    component: "pdf-compressor",
  },
  {
    id: 2,
    name: "Split de PDF",
    icon: <Scissors className="w-6 h-6" />,
    desc: "Divida arquivos PDF em partes menores.",
    component: "pdf-splitter",
  },
  {
    id: 3,
    name: "Juntar PDF",
    icon: <FileText className="w-6 h-6" />,
    desc: "Una múltiplos arquivos PDF em um.",
    component: "pdf-merger",
  },
];

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolClick = (tool: any) => {
    if (tool.component) {
      setSelectedTool(tool.component);
    }
  };

  const closeModal = () => {
    setSelectedTool(null);
  };

  const renderToolModal = () => {
    switch (selectedTool) {
      case "pdf-compressor":
        return <PdfCompressor />;
      case "pdf-splitter":
        return <PdfSplitter />;
      case "pdf-merger":
        return <PdfMerger />;
      case "media-transcriber":
        return <MediaTranscriber />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Ferramentas"
        subtitle="Utilitários para manipulação de arquivos PDF e imagens. Tudo online, rápido e seguro"
        icon={<FileText className="w-5 h-5 md:w-6 md:h-6" />}
      />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col gap-8 mx-auto w-full max-w-6xl py-8">
            {/* Grid com 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Acessar ${tool.name}`}
                  className="transition-all cursor-pointer border border-gray-200 h-full flex flex-col justify-between bg-white rounded-lg shadow-lg hover:shadow-aiudex-xl hover:scale-105 focus:ring-4 focus:ring-blue-400/30 outline-none">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="text-center space-y-6 flex-1 flex flex-col justify-between">
                      <div className="w-20 h-20 bg-gradient-aiudex rounded-2xl flex items-center justify-center mx-auto shadow-aiudex">
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gradient-aiudex mb-3">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-blue-700 leading-relaxed font-medium">
                          {tool.desc}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-3 text-xs bg-gradient-aiudex text-white border-0 shadow-aiudex">
                          Ferramenta
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-xs text-blue-600 font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Processamento Rápido</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ferramentas */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b-2 border-blue-200/30">
              <h2 className="text-xl font-bold text-gradient-aiudex">
                {tools.find((t) => t.component === selectedTool)?.name ||
                  "Ferramenta"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="hover:bg-blue-50 text-blue-600 transition-all duration-300 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">{renderToolModal()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
