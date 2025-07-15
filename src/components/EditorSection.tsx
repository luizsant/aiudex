import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, CheckCircle, Clock, Scale } from "lucide-react";

const EditorSection = () => {
  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Editor com IA Avançada
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
            Crie Peças Jurídicas em Minutos
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Nossa IA especializada gera peças processuais completas com base nas
            melhores práticas jurídicas, jurisprudência atualizada e sua
            estratégia específica.
          </p>
        </div>

        {/* Main Editor Demo */}
        <div className="mb-16">
          <Card className="max-w-6xl mx-auto shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Petição Inicial - Ação de Indenização
                    </h3>
                    <p className="text-blue-100">
                      Geração automática com IA jurídica
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-sm">Revisado pela IA</span>
                </div>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Steps */}
                <div className="md:col-span-1">
                  <h4 className="font-bold text-slate-700 mb-4">
                    Etapas do Processo
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-600">
                        Descrição dos fatos
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-600">
                        Teses e jurisprudências
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-600">
                        Edição da petição
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="md:col-span-2">
                  <h4 className="font-bold text-slate-700 mb-4">
                    Prévia do Documento
                  </h4>
                  <div className="bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-200 min-h-[300px]">
                    <div className="space-y-4 text-sm text-slate-600">
                      <div className="text-center font-bold">
                        EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ª
                        VARA CÍVEL
                      </div>
                      <div className="space-y-2">
                        <p>
                          <strong>LUCAS SILVA</strong>, brasileiro, solteiro,
                          taxista, portador do RG nº 12.345.678-9...
                        </p>
                        <p className="bg-amber-100 p-2 rounded border-l-4 border-amber-400">
                          <strong>IA Sugestão:</strong> Incluir CPF e endereço
                          completo para qualificação adequada
                        </p>
                        <p>
                          <strong>DOS TÓPICOS PRELIMINARES</strong>
                        </p>
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="font-semibold text-blue-700">
                            JUSTIÇA GRATUITA
                          </p>
                          <p className="text-xs">
                            Sugerido automaticamente pela IA com base no perfil
                            do requerente
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    Justiça Gratuita
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    Desinteresse em Conciliação
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                    Dano Moral e Material
                  </span>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                  Finalizar Petição
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800">
                IA Jurídica Especializada
              </h3>
              <p className="text-slate-600">
                Treinada com milhões de peças e jurisprudências para gerar
                documentos precisos e atualizados.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800">
                Blocos Modulares
              </h3>
              <p className="text-slate-600">
                Componentes pré-definidos para tutela antecipada, dano moral,
                liminar e muito mais.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Scale className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800">
                Teses Jurídicas
              </h3>
              <p className="text-slate-600">
                Sugestões automáticas de teses com base na jurisprudência mais
                recente dos tribunais.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EditorSection;
