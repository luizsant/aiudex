import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Gavel,
  Scale,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  useTemplateSettings,
  TemplateSettings,
} from "@/hooks/use-template-settings";

interface JuridicalDocumentPreviewProps {
  content: string;
  title?: string;
  clientName?: string;
  logoUrl?: string;
  className?: string;
  showHeader?: boolean;
  showQualityIndicators?: boolean;
}

// Função para limpar tags HTML para exibição (editor e preview)
const cleanHtmlTagsForDisplay = (content: string): string => {
  let cleaned = content;

  // Remover tags <center> mantendo apenas o conteúdo
  cleaned = cleaned.replace(/<center>(.*?)<\/center>/g, "$1");

  // Remover tags <strong> mantendo apenas o conteúdo
  cleaned = cleaned.replace(/<strong>(.*?)<\/strong>/g, "$1");

  // Remover tags <em> mantendo apenas o conteúdo
  cleaned = cleaned.replace(/<em>(.*?)<\/em>/g, "$1");

  // Converter &nbsp; para espaços normais
  cleaned = cleaned.replace(/&nbsp;/g, " ");

  return cleaned;
};

// Função para processar tags HTML para visualização (apenas no preview)
const processHtmlTagsForPreview = (content: string): string => {
  let processed = content;

  // Converter tags <center> para div centralizado
  processed = processed.replace(
    /<center>(.*?)<\/center>/g,
    '<div style="text-align: center; margin: 0.75em 0; font-weight: bold; text-indent: 0;">$1</div>'
  );

  // Manter tags <strong> e <em> para formatação
  processed = processed.replace(
    /<strong>(.*?)<\/strong>/g,
    "<strong>$1</strong>"
  );
  processed = processed.replace(/<em>(.*?)<\/em>/g, "<em>$1</em>");

  // Processar tags &nbsp; para espaçamento
  processed = processed.replace(/&nbsp;/g, "&nbsp;");

  return processed;
};

// Função para processar e formatar o conteúdo jurídico
const processJuridicalContent = (
  content: string,
  settings: TemplateSettings
): string => {
  if (!content) return "";

  let processed = content;
  let chapterCount = 0;
  let subChapterCount = 0;
  let isInQualification = false;

  // Limpar tags HTML para exibição (editor e preview)
  processed = cleanHtmlTagsForDisplay(processed);

  // Processar markdown básico primeiro
  processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  processed = processed.replace(/__(.*?)__/g, "<strong>$1</strong>");
  processed = processed.replace(/\*(.*?)\\*/g, "<em>$1</em>");
  processed = processed.replace(/_(.*?)_/g, "<em>$1</em>");

  // Dividir o texto em linhas para processamento específico
  let lines = processed.split("\n");
  let result = [];

  // Detectar seções uma vez no início
  const hasEnderecamento = lines.some((l) =>
    l.trim().match(/^EXCELENT[ÍI]SSIMO/i)
  );
  const hasDosFatos = lines.some(
    (l) =>
      l.trim().match(/^DOS?\s+FATOS/i) ||
      l.trim().match(/^FATOS$/i) ||
      l.trim().includes("DOS FATOS")
  );
  const enderecamentoIndex = lines.findIndex((l) =>
    l.trim().match(/^EXCELENT[ÍI]SSIMO/i)
  );
  const dosFatosIndex = lines.findIndex(
    (l) =>
      l.trim().match(/^DOS?\s+FATOS/i) ||
      l.trim().match(/^FATOS$/i) ||
      l.trim().includes("DOS FATOS")
  );

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      continue; // Pular linhas vazias
    }

    // Estamos na qualificação se estamos entre endereçamento e DOS FATOS
    isInQualification =
      hasEnderecamento &&
      hasDosFatos &&
      enderecamentoIndex !== -1 &&
      dosFatosIndex !== -1 &&
      i > enderecamentoIndex &&
      i < dosFatosIndex;

    // Endereçamento (EXCELENTÍSSIMO...)
    if (line.match(/^EXCELENT[ÍI]SSIMO/i)) {
      result.push(
        `<p style="text-align: center; margin: 0.75em 0 6em 0; font-weight: bold; text-indent: 0;">${line}</p>`
      );
      continue;
    }

    // Título da ação
    if (
      line.match(/^\([^)]+\)$/) ||
      line.match(/^AÇÃO\s+DE\s+/i) ||
      line.match(/^presente\s+AÇÃO\s+/i)
    ) {
      result.push(
        `<p style="text-align: center; margin: 0.75em 0; font-weight: bold; text-indent: 0;">${line}</p>`
      );
      continue;
    }

    // Subtítulos numerados (ex: 1.1, II.I, 1.A, I.II, etc)
    if (
      line.match(
        /^((\d+|[IVX]+|[A-Z])\.(\d+|[IVX]+|[A-Z]))(\.[A-Z0-9]+)*\s+.+/i
      )
    ) {
      // Exemplo: 1.1 Título, II.I Título, 1.A Título, I.II Título
      result.push(
        `<p style="font-weight:bold; text-indent:0; margin:0;">${line}</p>`
      );
      continue;
    }

    // Detectar e tratar títulos de seção (com ou sem numeração romana)
    const isTitleSection =
      line.match(/^[IVX]+\s*–\s*[A-ZÁÉÍÓÚÂÊÎÔÛÃÇ\s]+$/i) || // Numeração romana + título
      line.match(/^DOS?\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÇ\s]+$/i) || // DOS + título
      (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÇ\s]+$/i) &&
        line.length > 3 &&
        line.length < 50); // Título em maiúsculas

    if (isTitleSection) {
      isInQualification = false;
      chapterCount++;
      subChapterCount = 0;

      // Remover numeração romana se existir
      const cleanLine = line.replace(/^[IVX]+\s*–\s*/, "");

      const chapterNumber =
        settings.chapterNumbering === "integer" ||
        settings.chapterNumbering === "unit"
          ? `${chapterCount}. `
          : "";

      result.push(
        `<p style="text-align: justify; margin: 1em 0; font-weight: bold; text-indent: 0;">${chapterNumber}${cleanLine}</p>`
      );
      continue;
    }

    // Citações e jurisprudências
    if (line.startsWith(">")) {
      result.push(
        `<p style="margin: 0.5em 0; text-align: justify; padding-left: ${
          settings.jurisprudenceIndent
        }; font-size: ${settings.jurisprudenceFontSize}pt;">${line
          .substring(1)
          .trim()}</p>`
      );
      continue;
    }

    // Parágrafos normais (sem numeração por enquanto)
    let paragraph = line;
    // Nome das partes na qualificação em negrito
    if (isInQualification) {
      // Padrões comuns: Nome: X, REQUERENTE: X, AUTOR: X, RÉU: X, REQUERIDO: X
      paragraph = paragraph.replace(
        /(Nome\s*:\s*)([^,\.\n]+)/i,
        "$1<strong>$2</strong>"
      );
      paragraph = paragraph.replace(
        /(REQUERENTE\s*:\s*)([^,\.\n]+)/i,
        "$1<strong>$2</strong>"
      );
      paragraph = paragraph.replace(
        /(AUTOR(A)?\s*:\s*)([^,\.\n]+)/i,
        "$1<strong>$3</strong>"
      );
      paragraph = paragraph.replace(
        /(R[ÉE]U\s*:\s*)([^,\.\n]+)/i,
        "$1<strong>$2</strong>"
      );
      paragraph = paragraph.replace(
        /(REQUERIDO\s*:\s*)([^,\.\n]+)/i,
        "$1<strong>$2</strong>"
      );
      // Se começa com 'em face de' ou 'contra', só o nome após o prefixo fica em negrito
      paragraph = paragraph.replace(
        /^(em face de|contra|a parte|ao réu|ao requerido)\s+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇa-záéíóúâêîôûãõç'\- ]+),/,
        function (_, prefix, nome) {
          return prefix + " <strong>" + nome.trim() + "</strong>,";
        }
      );
      // Se começa com nome antes da primeira vírgula, envolver em <strong> (mas não se já pegou o caso acima)
      if (
        paragraph.match(/^([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇa-záéíóúâêîôûãõç'\- ]+),/) &&
        !paragraph.match(/^(em face de|contra|a parte|ao réu|ao requerido)\s+/i)
      ) {
        paragraph = paragraph.replace(
          /^([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇa-záéíóúâêîôûãõç'\- ]+),/,
          "<strong>$1</strong>,"
        );
      }
    }
    result.push(
      `<p style="margin: 0.5em 0; text-align: justify; text-indent: ${
        isInQualification ? "0" : settings.firstLineIndent
      };">${paragraph}</p>`
    );
  }

  return result.join("\n");
};

// Função para detectar elementos jurídicos no conteúdo
const analyzeJuridicalContent = (content: string) => {
  const analysis = {
    hasAddressing: false,
    hasFacts: false,
    hasLegalBasis: false,
    hasRequests: false,
    hasSignature: false,
    hasOAB: false,
    wordCount: 0,
    paragraphCount: 0,
  };

  if (!content) return analysis;

  analysis.hasAddressing = /EXCELENTÍSSIMO/i.test(content);
  analysis.hasFacts = /DOS FATOS/i.test(content);
  analysis.hasLegalBasis = /DO DIREITO/i.test(content);
  analysis.hasRequests = /DOS PEDIDOS/i.test(content);
  analysis.hasSignature = /OAB\//i.test(content);
  analysis.hasOAB = /OAB\/[A-Z]+ nº [0-9]+/i.test(content);
  analysis.wordCount = content.split(/\s+/).length;
  analysis.paragraphCount = content.split(/\n\n/).length;

  return analysis;
};

export const JuridicalDocumentPreview: React.FC<
  JuridicalDocumentPreviewProps
> = ({
  content,
  title,
  clientName,
  logoUrl,
  className = "",
  showHeader = true,
  showQualityIndicators = true,
}) => {
  const { getDocumentStyles, isLoaded, settings } = useTemplateSettings();
  const processedContent = processJuridicalContent(content, settings);
  const analysis = analyzeJuridicalContent(content);
  const documentStyles = getDocumentStyles();

  // Adicionar fallbacks para fontes
  const getFontFamily = (font: string) => {
    const fontMap: { [key: string]: string } = {
      "Times New Roman": "Times New Roman, Times, serif",
      Arial: "Arial, Helvetica, sans-serif",
      Calibri: "Calibri, Arial, sans-serif",
      Georgia: "'Georgia', 'Times New Roman', Times, serif",
      "Book Antiqua": "'Playfair Display', 'Book Antiqua', Palatino, serif",
      Roboto: "'Roboto', 'Segoe UI', Arial, sans-serif",
    };
    return fontMap[font] || "Times New Roman, Times, serif";
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header do Documento */}
      {showHeader && (title || clientName || logoUrl) && (
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
            )}
            <div className="flex-1 text-center">
              {title && (
                <h1 className="text-xl font-bold uppercase mb-2">{title}</h1>
              )}
              {clientName && (
                <p className="text-blue-100 text-sm">Cliente: {clientName}</p>
              )}
            </div>
            <div className="w-12"></div>
          </div>
        </div>
      )}

      {/* Conteúdo do Documento */}
      <div className="p-8" style={{ margin: documentStyles.margin }}>
        <div
          className="juridical-content"
          style={{
            fontFamily: getFontFamily(settings.defaultFont),
            fontSize: documentStyles.fontSize,
            lineHeight: documentStyles.lineHeight,
            textAlign: "justify",
            color: "#1f2937",
          }}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Nova seção: Dados do Processo */}
      {(settings?.numero_processo ||
        settings?.vara ||
        settings?.comarca ||
        settings?.valor ||
        settings?.grau ||
        settings?.uf ||
        settings?.orgao_julgador ||
        settings?.classe ||
        settings?.assunto ||
        settings?.data_distribuicao ||
        settings?.polo_ativo ||
        settings?.polo_passivo) && (
        <div className="my-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4 text-blue-800">
            Dados do Processo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {settings?.numero_processo && (
              <div>
                <strong>Número do processo:</strong> {settings.numero_processo}
              </div>
            )}
            {settings?.comarca && (
              <div>
                <strong>Comarca/Seção:</strong> {settings.comarca}
              </div>
            )}
            {settings?.vara && (
              <div>
                <strong>Vara:</strong> {settings.vara}
              </div>
            )}
            {settings?.grau && (
              <div>
                <strong>Grau de jurisdição:</strong> {settings.grau}
              </div>
            )}
            {settings?.uf && (
              <div>
                <strong>UF:</strong> {settings.uf}
              </div>
            )}
            {settings?.orgao_julgador && (
              <div>
                <strong>Órgão julgador:</strong> {settings.orgao_julgador}
              </div>
            )}
            {settings?.classe && (
              <div>
                <strong>Classe processual:</strong> {settings.classe}
              </div>
            )}
            {settings?.assunto && (
              <div>
                <strong>Assunto:</strong> {settings.assunto}
              </div>
            )}
            {settings?.data_distribuicao && (
              <div>
                <strong>Data de distribuição:</strong>{" "}
                {settings.data_distribuicao}
              </div>
            )}
            <div>
              <strong>Valor da causa:</strong>{" "}
              {settings?.valor ? (
                settings.valor
              ) : (
                <span className="text-red-600">(obrigatório)</span>
              )}
            </div>
            {settings?.polo_ativo && (
              <div>
                <strong>Polo Ativo:</strong> {settings.polo_ativo}
              </div>
            )}
            {settings?.polo_passivo && (
              <div>
                <strong>Polo Passivo:</strong> {settings.polo_passivo}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicadores de Qualidade */}
      {showQualityIndicators && (
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>Documento Jurídico</span>
              </div>
              <div className="flex items-center space-x-1">
                <Gavel className="w-3 h-3" />
                <span>Formatado</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Scale className="w-3 h-3" />
              <span>Pronto para Protocolo</span>
            </div>
          </div>

          {/* Análise de Qualidade */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              {analysis.hasAddressing ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-yellow-500" />
              )}
              <span>Endereçamento</span>
            </div>
            <div className="flex items-center space-x-1">
              {analysis.hasFacts ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-yellow-500" />
              )}
              <span>Fatos</span>
            </div>
            <div className="flex items-center space-x-1">
              {analysis.hasLegalBasis ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-yellow-500" />
              )}
              <span>Fundamentação</span>
            </div>
            <div className="flex items-center space-x-1">
              {analysis.hasSignature ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-yellow-500" />
              )}
              <span>Assinatura</span>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-400">
            <span>
              {analysis.wordCount} palavras • {analysis.paragraphCount}{" "}
              parágrafos
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JuridicalDocumentPreview;
