// Arquivo de teste para verificar as variáveis do escritório
import {
  getOfficeConfig,
  replaceOfficeVariables,
  replaceClientVariables,
} from "./document-service";

// Função para testar as variáveis do escritório
export const testOfficeVariables = async () => {
  // Carregar configuração atual
  const config = getOfficeConfig();

  // Template de teste
  const testTemplate = `
PROCURAÇÃO

OUTORGANTE: {{cliente_nome}}, {{cliente_nacionalidade}}, {{cliente_estado_civil}}, {{cliente_profissao}}, inscrito no RG nº {{cliente_rg}}, inscrita no CPF sob o nº {{cliente_cpf}}, residente e domiciliada à {{cliente_endereco}}, constitui e nomeia seu bastante procurador:

OUTORGADO: {{advogado}}, inscrito na OAB/{{estado}} sob o n. {{oab}}, sócio do escritório de advocacia {{escritorio}}, pessoa jurídica de direito privado, inscrita no CNPJ n. {{cnpj}}, endereço eletrônico: {{email}}, localizada na {{endereco_escritorio}}.

OBJETO: representar o (s) Outorgante (s), promovendo a defesa dos seus direitos e interesses.

{{cliente_cidade}}/{{cliente_estado}}, {{data_extenso}}

Outorgante:

____________________________________
{{cliente_nome}}

____________________________________
{{assinatura_completa}}
  `;

  // Aplicar variáveis do escritório
  const resultWithOffice = await replaceOfficeVariables(testTemplate);

  // Cliente de teste
  const testClient = {
    name: "João Silva",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    nationality: "brasileiro",
    maritalStatus: "solteiro",
    profession: "empresário",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
  };

  // Aplicar variáveis do cliente
  const finalResult = replaceClientVariables(resultWithOffice, testClient);

  return {
    config,
    originalTemplate: testTemplate,
    withOfficeVariables: resultWithOffice,
    finalResult,
  };
};

// Função para testar configurações de template
export const testTemplateSettings = () => {
  const {
    getTemplateSettings,
    applyTemplateFormatting,
  } = require("./document-service");

  const settings = getTemplateSettings();

  const testContent = `
    <h1>Documento de Teste</h1>
    <p>Este é um parágrafo de teste para verificar a formatação.</p>
    <p>Outro parágrafo para testar o espaçamento de linha.</p>
  `;

  const formattedContent = applyTemplateFormatting(testContent);

  return {
    settings,
    originalContent: testContent,
    formattedContent,
  };
};
