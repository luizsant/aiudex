import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  Header,
  Footer,
  HorizontalPositionAlign,
  VerticalPositionAlign,
} from "docx";
import { saveAs } from "file-saver";
import { LegalDocument } from "./document-service";

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  private getBrandingSettings() {
    try {
      if (typeof window === "undefined") {
        console.log("⚠️ Executando no servidor, localStorage não disponível");
        return null;
      }
      const branding = localStorage.getItem("legalai_branding");
      return branding ? JSON.parse(branding) : null;
    } catch (error) {
      console.error("Erro ao carregar configurações de branding:", error);
      return null;
    }
  }

  async exportToDOCX(
    docData: LegalDocument & { templateSettings?: any }
  ): Promise<void> {
    try {
      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        AlignmentType,
        Header,
        Footer,
      } = await import("docx");

      // Buscar configurações de template do localStorage OU do argumento
      let templateSettings = {
        defaultFont: "Times New Roman",
        fontSize: "12",
        lineSpacing: "1.5",
        paragraphSpacing: "1.0",
        margins: "2.5cm",
        jurisprudenceIndent: "4.0cm",
        jurisprudenceFontSize: "10",
        includeWatermark: false,
      };

      // Se vier no docData, prioriza
      if (docData.templateSettings) {
        templateSettings = {
          ...templateSettings,
          ...docData.templateSettings,
        };
      } else {
        try {
          if (typeof window !== "undefined") {
            const savedSettings = localStorage.getItem(
              "legalai_template_settings"
            );
            if (savedSettings) {
              templateSettings = {
                ...templateSettings,
                ...JSON.parse(savedSettings),
              };
            }
          }
        } catch (error) {
          console.error("Erro ao carregar configurações de template:", error);
        }
      }

      // Converter margens de cm para twips (1 cm = 567 twips)
      const marginTwips =
        templateSettings.margins === "2.0cm"
          ? 1134
          : templateSettings.margins === "2.5cm"
          ? 1417
          : templateSettings.margins === "3.0cm"
          ? 1701
          : 1417;
      const fontSize = parseInt(templateSettings.fontSize) || 12;
      const fontFamily = templateSettings.defaultFont || "Times New Roman";
      const lineSpacing = parseFloat(templateSettings.lineSpacing) || 1.5;
      const paragraphSpacing =
        parseFloat(templateSettings.paragraphSpacing) || 1.0;
      const jurisprudenceIndent =
        parseFloat(templateSettings.jurisprudenceIndent) || 4.0;

      // Função para limpar tags HTML para exportação
      function cleanHtmlTagsForExport(content: string): string {
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
      }

      // Função para processar marcações de negrito (**texto**) e centralização ([[center]])
      function processParagraph(paragraph: string) {
        if (!paragraph.trim()) {
          // Retornar parágrafo vazio para manter espaçamento
          return new Paragraph({
            children: [],
            spacing: {
              after:
                typeof paragraphSpacing !== "undefined"
                  ? paragraphSpacing * 240
                  : 120,
              line: lineSpacing * 240,
            },
          });
        }
        let alignment = AlignmentType.JUSTIFIED;
        let text = paragraph;
        let runs = [];

        // Detectar e tratar endereçamento (EXCELENTÍSSIMO...)
        if (text.match(/^##\s*EXCELENT[ÍI]SSIMO/i)) {
          // Remover ## e aplicar negrito e centralização
          text = text.replace(/^##\s*/, "");
          return new Paragraph({
            children: [
              new TextRun({
                text: text,
                bold: true,
                size: fontSize * 2,
                font: fontFamily,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after:
                typeof paragraphSpacing !== "undefined"
                  ? paragraphSpacing * 240
                  : 120,
              line: lineSpacing * 240,
            },
          });
        }

        // Centralizar se começar com [[center]]
        if (text.startsWith("[[center]]")) {
          alignment = AlignmentType.CENTER as any;
          text = text.replace("[[center]]", "").trim();
        }

        // Formatar jurisprudência se começar com >
        if (text.startsWith(">")) {
          text = text.replace(">", "").trim();
          // Converter cm para twips (1 cm = 567 twips)
          const indentTwips = jurisprudenceIndent * 567;
          return new Paragraph({
            children: [
              new TextRun({
                text: text,
                size: parseInt(templateSettings.jurisprudenceFontSize) * 2, // Tamanho configurável
                font: fontFamily,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after:
                typeof paragraphSpacing !== "undefined"
                  ? paragraphSpacing * 240
                  : 120,
              line: lineSpacing * 240,
            },
            indent: {
              left: indentTwips,
            },
          });
        }

        // Negrito: encontrar todos os trechos entre **
        const regex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
          // Adicionar texto antes do negrito
          if (match.index > lastIndex) {
            runs.push(
              new TextRun({
                text: text.substring(lastIndex, match.index),
                size: fontSize * 2,
                font: fontFamily,
              })
            );
          }
          // Adicionar texto em negrito
          runs.push(
            new TextRun({
              text: match[1],
              bold: true,
              size: fontSize * 2,
              font: fontFamily,
            })
          );
          lastIndex = match.index + match[0].length;
        }
        // Adicionar texto restante
        if (lastIndex < text.length) {
          runs.push(
            new TextRun({
              text: text.substring(lastIndex),
              size: fontSize * 2,
              font: fontFamily,
            })
          );
        }

        return new Paragraph({
          children: runs,
          alignment: alignment,
          spacing: {
            after:
              typeof paragraphSpacing !== "undefined"
                ? paragraphSpacing * 240
                : 120,
            line: lineSpacing * 240,
          },
        });
      }

      // Processar o conteúdo do documento
      const cleanedContent = cleanHtmlTagsForExport(docData.content);
      const paragraphs = cleanedContent.split("\n").filter((p) => p.trim());

      const docParagraphs = paragraphs.map((paragraph) =>
        processParagraph(paragraph)
      );

      // Criar o documento
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: marginTwips,
                  right: marginTwips,
                  bottom: marginTwips,
                  left: marginTwips,
                },
              },
            },
            children: docParagraphs,
          },
        ],
      });

      // Gerar o arquivo
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${docData.title || "documento"}.docx`);

      console.log("✅ Documento exportado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao exportar documento:", error);
      throw error;
    }
  }

  async exportToPDF(docData: LegalDocument): Promise<void> {
    // Implementação futura para PDF
    console.log("Exportação para PDF ainda não implementada");
  }

  async exportToTXT(docData: LegalDocument): Promise<void> {
    try {
      const content = docData.content;
      const blob = new Blob([content], { type: "text/plain" });
      saveAs(blob, `${docData.title || "documento"}.txt`);
      console.log("✅ Documento exportado como TXT!");
    } catch (error) {
      console.error("❌ Erro ao exportar TXT:", error);
      throw error;
    }
  }
}

export const exportService = ExportService.getInstance();
