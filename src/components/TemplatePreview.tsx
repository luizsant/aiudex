import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplateSettings } from "@/hooks/use-template-settings";

interface TemplatePreviewProps {
  className?: string;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  className = "",
}) => {
  const { settings, getDocumentStyles } = useTemplateSettings();

  // Obter estilos sempre que o componente renderizar
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

  const sampleContent = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA 1ª VARA CÍVEL DA COMARCA DE SÃO PAULO

JOÃO DA SILVA, brasileiro, casado, empresário, portador da Cédula de Identidade RG nº 12.345.678-9 e inscrito no CPF sob o nº 123.456.789-00, residente e domiciliado na Rua das Flores, 123, Centro, São Paulo/SP, CEP 01234-567, por seu advogado que ao final subscreve (procuração anexa), vem, respeitosamente, à presença de Vossa Excelência, propor a presente

AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS

contra BANCO EXEMPLO S.A., pessoa jurídica de direito privado, inscrito no CNPJ sob o nº 12.345.678/0001-90, com sede na Av. Paulista, 1000, Bela Vista, São Paulo/SP, pelos fatos e fundamentos jurídicos a seguir expostos:

DOS FATOS

O Requerente é correntista do Requerido há mais de 5 (cinco) anos, mantendo conta corrente com saldo médio de R$ 10.000,00 (dez mil reais).

No dia 15 de março de 2024, o Requerente tentou realizar um saque de R$ 500,00 (quinhentos reais) em um caixa eletrônico do Requerido, localizado na Rua Augusta, 500, São Paulo/SP.

Para sua surpresa, o sistema do banco bloqueou a operação, alegando "suspeita de fraude", sem qualquer justificativa técnica ou fundamento legal.

DO DIREITO

Fundamenta-se a presente ação no art. 186 do Código Civil, que estabelece a responsabilidade civil por ato ilícito. Ademais, aplica-se o art. 944 do mesmo diploma legal, que determina a reparação civil.

>STJ, REsp 1.234.567/DF, Rel. Min. João Silva, 3ª Turma, DJe 15/03/2024: "A responsabilidade objetiva do fornecedor independe de culpa, bastando a demonstração do nexo causal entre o produto/serviço e o dano sofrido pelo consumidor, nos termos do art. 14 do Código de Defesa do Consumidor."

>STF, RE 987.654/SP, Rel. Min. Maria Santos, 2ª Turma, DJe 20/02/2024: "O dano moral deve ser reparado sempre que houver violação a direitos da personalidade, independentemente de prejuízo patrimonial, conforme estabelecido no art. 186 do Código Civil."

>TJSP, Apelação Cível 123.456-78.2023.8.26.0000, Rel. Des. Pedro Oliveira, 15ª Câmara de Direito Privado, j. 10/01/2024: "A inversão do ônus da prova em favor do consumidor é medida que visa equilibrar a relação jurídica, especialmente quando o fornecedor detém informações técnicas sobre o produto ou serviço."

DOS PEDIDOS

Ante o exposto, requer:

a) A citação do Requerido;

b) A procedência do pedido para condenar o Requerido ao pagamento de R$ 5.000,00 (cinco mil reais) a título de danos morais;

c) A inversão do ônus da prova, nos termos do art. 6º, VIII, do Código de Defesa do Consumidor;

d) A concessão dos benefícios da justiça gratuita;

e) A inversão do ônus da prova.

Dá-se à causa o valor de R$ 5.000,00 (cinco mil reais).

Nestes termos,
Pede deferimento.

São Paulo, 20 de março de 2024.

_______________________
Dr. João Silva
OAB/SP nº 123456`;

  // Processar markdown básico primeiro
  let processed = sampleContent
    .split("\n")
    .map((line, index, lines) => {
      line = line.trim();
      let chapterCount = 0;
      let subChapterCount = 0;
      let isInQualification = false;

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
      const currentIndex = lines.findIndex((l) => l.trim() === line);
      const enderecamentoIndex = lines.findIndex((l) =>
        l.trim().match(/^EXCELENT[ÍI]SSIMO/i)
      );
      const dosFatosIndex = lines.findIndex(
        (l) =>
          l.trim().match(/^DOS?\s+FATOS/i) ||
          l.trim().match(/^FATOS$/i) ||
          l.trim().includes("DOS FATOS")
      );

      // Estamos na qualificação se estamos entre endereçamento e DOS FATOS
      isInQualification =
        hasEnderecamento &&
        hasDosFatos &&
        enderecamentoIndex !== -1 &&
        dosFatosIndex !== -1 &&
        currentIndex > enderecamentoIndex &&
        currentIndex < dosFatosIndex;

      // Endereçamento (EXCELENTÍSSIMO...)
      if (line.match(/^EXCELENT[ÍI]SSIMO/i)) {
        return `<p style="text-align: center; margin: 0.75em 0 6em 0; font-weight: bold; text-indent: 0;">${line}</p>`;
      }

      // Título da ação
      if (
        line.match(/^\([^)]+\)$/) ||
        line.match(/^AÇÃO\s+DE\s+/i) ||
        line.match(/^presente\s+AÇÃO\s+/i)
      ) {
        return `<p style="text-align: center; margin: 0.75em 0; font-weight: bold; text-indent: 0;">${line}</p>`;
      }

      // Detectar e tratar títulos de seção (com ou sem numeração romana)
      const isTitleSection =
        line.match(/^[IVX]+\s*–\s*[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) || // Numeração romana + título
        line.match(/^DOS?\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) || // DOS + título
        (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) &&
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

        return `<p style="text-align: justify; margin: 1em 0; font-weight: bold; text-indent: 0;">${chapterNumber}${cleanLine}</p>`;
      }

      // Subtítulos (começando com número e ponto)
      if (line.match(/^\d+\.\d+\s+[A-Z]/)) {
        if (settings.chapterNumbering === "unit") {
          subChapterCount++;
          return `<p style="text-align: justify; margin: 1em 0; font-weight: bold; text-indent: 0;">${chapterCount}.${subChapterCount}. ${line.replace(
            /^\d+\.\d+\s+/,
            ""
          )}</p>`;
        }
      }

      // Citações e jurisprudências
      if (line.startsWith(">")) {
        return `<p style="margin: 0.5em 0; text-align: justify; padding-left: ${
          settings.jurisprudenceIndent
        }; font-size: ${settings.jurisprudenceFontSize}pt;">${line
          .substring(1)
          .trim()}</p>`;
      }

      // Parágrafos normais (sem numeração por enquanto)
      return `<p style="margin: 0.5em 0; text-align: justify; text-indent: ${
        isInQualification ? "0" : settings.firstLineIndent
      };">${line}</p>`;
    })
    .join("\n");

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Preview das Configurações de Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Configurações Atuais */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs bg-gray-50 p-3 rounded">
            <div>
              <span className="font-medium">Fonte:</span>
              <br />
              <span className="text-gray-600">{settings.defaultFont}</span>
            </div>
            <div>
              <span className="font-medium">Tamanho:</span>
              <br />
              <span className="text-gray-600">{settings.fontSize}pt</span>
            </div>
            <div>
              <span className="font-medium">Espaçamento:</span>
              <br />
              <span className="text-gray-600">{settings.lineSpacing}</span>
            </div>
            <div>
              <span className="font-medium">Parágrafos:</span>
              <br />
              <span className="text-gray-600">{settings.paragraphSpacing}</span>
            </div>
            <div>
              <span className="font-medium">Margens:</span>
              <br />
              <span className="text-gray-600">{settings.margins}</span>
            </div>
            <div>
              <span className="font-medium">Jurisprudência:</span>
              <br />
              <span className="text-gray-600">
                {settings.jurisprudenceIndent} /{" "}
                {settings.jurisprudenceFontSize}pt
              </span>
            </div>
          </div>

          {/* Preview do Documento */}
          <div className="border rounded-lg p-6 bg-white">
            <div
              className="juridical-content"
              style={{
                ...documentStyles,
                fontFamily: getFontFamily(settings.defaultFont),
                textAlign: "justify",
                color: "#1f2937",
                maxHeight: "400px",
                overflowY: "auto",
              }}
              dangerouslySetInnerHTML={{
                __html: processed,
              }}
            />
          </div>

          <div className="text-xs text-gray-500 text-center">
            Este preview mostra como o documento ficará com as configurações
            atuais
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;
