import React from "react";
import { MDXProvider } from "@mdx-js/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Gavel,
  Scale,
  BookOpen,
  User,
  Building,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

interface JuridicalMarkdownPreviewProps {
  content: string;
  title?: string;
  clientName?: string;
  logoUrl?: string;
  className?: string;
  showHeader?: boolean;
}

// Componentes personalizados para MDX
const components = {
  h1: (props: any) => (
    <h1
      {...props}
      className="text-2xl font-bold text-center uppercase mb-6 text-gray-800 border-b-2 border-gray-300 pb-2"
    />
  ),
  h2: (props: any) => (
    <h2
      {...props}
      className="text-xl font-bold uppercase mb-4 text-gray-800 mt-6"
    />
  ),
  h3: (props: any) => (
    <h3
      {...props}
      className="text-lg font-semibold uppercase mb-3 text-gray-700 mt-4"
    />
  ),
  h4: (props: any) => (
    <h4
      {...props}
      className="text-base font-semibold uppercase mb-2 text-gray-700 mt-3"
    />
  ),
  p: (props: any) => (
    <p
      {...props}
      className="text-justify leading-relaxed mb-3 text-gray-800 text-sm"
    />
  ),
  strong: (props: any) => (
    <strong {...props} className="font-bold text-gray-900" />
  ),
  em: (props: any) => <em {...props} className="italic text-gray-700" />,
  ul: (props: any) => (
    <ul
      {...props}
      className="list-disc list-inside mb-4 space-y-1 text-sm text-gray-800"
    />
  ),
  ol: (props: any) => (
    <ol
      {...props}
      className="list-decimal list-inside mb-4 space-y-1 text-sm text-gray-800"
    />
  ),
  li: (props: any) => (
    <li {...props} className="text-justify leading-relaxed" />
  ),
  blockquote: (props: any) => (
    <blockquote
      {...props}
      className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700"
    />
  ),
  code: (props: any) => (
    <code
      {...props}
      className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800"
    />
  ),
  pre: (props: any) => (
    <pre
      {...props}
      className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"
    />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-4">
      <table {...props} className="min-w-full border border-gray-300 text-sm" />
    </div>
  ),
  th: (props: any) => (
    <th
      {...props}
      className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left"
    />
  ),
  td: (props: any) => (
    <td {...props} className="border border-gray-300 px-4 py-2" />
  ),
  hr: () => <Separator className="my-6" />,
  // Componentes jurídicos personalizados
  JuridicalHeader: ({ children, ...props }: any) => (
    <div className="text-center mb-8 p-4 bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg border">
      <h1 className="text-xl font-bold uppercase text-gray-800 mb-2">
        {children}
      </h1>
      <div className="text-sm text-gray-600">Documento Jurídico</div>
    </div>
  ),
  JuridicalSection: ({ title, children, ...props }: any) => (
    <div className="mb-6">
      <h2 className="text-lg font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">
        {title}
      </h2>
      <div className="pl-4">{children}</div>
    </div>
  ),
  JuridicalSignature: ({ lawyerName, oab, state, ...props }: any) => (
    <div className="mt-8 text-center">
      <Separator className="mb-4" />
      <div className="text-sm text-gray-600">
        <p className="font-semibold">{lawyerName}</p>
        <p>
          OAB/{state} nº {oab}
        </p>
      </div>
    </div>
  ),
  JuridicalFooter: ({ officeName, address, phone, email, ...props }: any) => (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
      <div className="flex items-center justify-center space-x-4">
        {officeName && (
          <div className="flex items-center space-x-1">
            <Building className="w-3 h-3" />
            <span>{officeName}</span>
          </div>
        )}
        {address && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{address}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3" />
            <span>{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center space-x-1">
            <Mail className="w-3 h-3" />
            <span>{email}</span>
          </div>
        )}
      </div>
    </div>
  ),
};

// Função para processar o conteúdo markdown
const processMarkdownContent = (content: string): string => {
  if (!content) return "";

  // Converter quebras de linha em <br/> para preservar formatação
  let processed = content
    .replace(/\n\n/g, "\n\n") // Manter parágrafos duplos
    .replace(/\n/g, "  \n"); // Adicionar espaços para quebras de linha simples

  // Detectar e formatar títulos jurídicos
  processed = processed.replace(/^(EXCELENTÍSSIMO[A-Z\s]+)/gm, "## $1");

  // Detectar seções jurídicas comuns
  processed = processed.replace(
    /^(DOS FATOS|DO DIREITO|DOS PEDIDOS|DOS TÓPICOS PRELIMINARES)/gm,
    "## $1"
  );

  // Formatar assinatura
  processed = processed.replace(
    /^([A-Z\s]+)\nOAB\/([A-Z]+) nº ([0-9]+)/gm,
    "**$1**\nOAB/$2 nº $3"
  );

  return processed;
};

export const JuridicalMarkdownPreview: React.FC<
  JuridicalMarkdownPreviewProps
> = ({
  content,
  title,
  clientName,
  logoUrl,
  className = "",
  showHeader = true,
}) => {
  const processedContent = processMarkdownContent(content);

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
            <div className="w-12"></div> {/* Espaçador */}
          </div>
        </div>
      )}

      {/* Conteúdo do Documento */}
      <div className="p-8">
        <MDXProvider components={components}>
          <div
            className="prose prose-sm max-w-none"
            style={{
              fontFamily: "Times New Roman, serif",
              fontSize: "12pt",
              lineHeight: "1.5",
              textAlign: "justify",
            }}>
            {/* Renderizar o conteúdo processado */}
            <div
              dangerouslySetInnerHTML={{
                __html: processedContent
                  .replace(/\n/g, "<br/>")
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                  .replace(
                    /## (.*?)(?=\n|$)/g,
                    '<h2 class="text-lg font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">$1</h2>'
                  )
                  .replace(
                    /^([A-Z\s]+)\nOAB\/([A-Z]+) nº ([0-9]+)/gm,
                    '<div class="mt-8 text-center"><hr class="mb-4"/><div class="text-sm text-gray-600"><p class="font-semibold">$1</p><p>OAB/$2 nº $3</p></div></div>'
                  ),
              }}
            />
          </div>
        </MDXProvider>
      </div>

      {/* Indicadores de qualidade */}
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
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
      </div>
    </div>
  );
};

export default JuridicalMarkdownPreview;
