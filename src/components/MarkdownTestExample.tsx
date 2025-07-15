"use client";

import React, { useState } from "react";
import JuridicalDocumentPreview from "./JuridicalDocumentPreview";
import MarkdownEditor from "./MarkdownEditor";

const MarkdownTestExample = () => {
  const [content, setContent] = useState(`# PETIÇÃO INICIAL

EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 1ª VARA CÍVEL

**JOÃO SILVA**, brasileiro, solteiro, CPF 123.456.789-00, vem, respeitosamente, à presença de Vossa Excelência, propor a presente

## AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS

### DOS FATOS

O requerente adquiriu um produto *defeituoso* da empresa **XYZ Ltda**, conforme demonstrado pelos seguintes fatos:

- O produto apresentou defeito logo após a compra
- A empresa se recusou a trocar o produto
- O consumidor sofreu danos morais

### DO DIREITO

Fundamenta-se nos seguintes dispositivos legais:

1. **Art. 186 do Código Civil** - Teoria da responsabilidade civil
2. **Art. 927 do Código Civil** - Responsabilidade objetiva
3. **Art. 6º do CDC** - Direitos básicos do consumidor

> "A responsabilidade civil independe de culpa quando a atividade normalmente desenvolvida pelo autor do dano implicar, por sua natureza, risco para os direitos de outrem."

### DOS PEDIDOS

Ante o exposto, requer:

- A citação da parte ré
- A procedência do pedido
- A condenação em danos morais no valor de R$ 10.000,00

**DR. JOÃO SILVA**
OAB/SP nº 123456`);

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          Teste de Formatação Markdown
        </h1>
        <p className="text-gray-600">
          Teste como o sistema processa markdown em documentos jurídicos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Editor com Markdown</h2>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            title="Petição Inicial"
            showPreview={true}
            showToolbar={true}
            placeholder="Digite o conteúdo com markdown..."
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Preview Formatado</h2>
          <JuridicalDocumentPreview
            content={content}
            title="Petição Inicial"
            showHeader={true}
            showQualityIndicators={true}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Sintaxe Markdown Suportada:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Negrito:</strong> <code>**texto**</code> ou{" "}
              <code>__texto__</code>
            </p>
            <p>
              <em>Itálico:</em> <code>*texto*</code> ou <code>_texto_</code>
            </p>
            <p>
              <strong>Títulos:</strong> <code># Título 1</code>,{" "}
              <code>## Título 2</code>, <code>### Título 3</code>
            </p>
          </div>
          <div>
            <p>
              <strong>Listas:</strong> <code>- item</code> ou{" "}
              <code>1. item</code>
            </p>
            <p>
              <strong>Citações:</strong> <code>&gt; texto</code>
            </p>
            <p>
              <strong>Endereçamentos:</strong> Detectados automaticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownTestExample;
