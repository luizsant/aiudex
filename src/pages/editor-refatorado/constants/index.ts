import {
  Users,
  Gavel,
  FileText,
  Shield,
  BookOpen,
  Edit3,
  Briefcase,
  Building2,
  Heart,
  PiggyBank,
  Landmark,
  MonitorSmartphone,
  Leaf,
} from "lucide-react";

// Etapas do wizard
export const ETAPAS = [
  { id: "0", name: "Cliente", status: "pending" as const },
  { id: "1", name: "Área/Peça", status: "pending" as const },
  { id: "2", name: "Fatos", status: "pending" as const },
  { id: "3", name: "Dados do Processo", status: "pending" as const },
  { id: "4", name: "Teses/Jurisprudências", status: "pending" as const },
  { id: "5", name: "Edição Final", status: "pending" as const },
];

// Mapeamento dos ícones
export const ICON_MAP = {
  Users,
  Gavel,
  FileText,
  Shield,
  BookOpen,
  Edit3,
  Briefcase,
  Building2,
  Heart,
  PiggyBank,
  Landmark,
  MonitorSmartphone,
  Leaf,
};

// Áreas do Direito
export const AREAS_DIREITO = [
  "Geral",
  "Cível",
  "Penal",
  "Trabalhista",
  "Empresarial",
  "Família",
  "Previdenciário",
  "Tributário",
  "Digital",
  "Ambiental",
  "Direito Bancário",
];

// Ícones para as áreas do direito
export const ICONES_AREAS = {
  Cível: "Gavel",
  Penal: "Shield",
  Trabalhista: "Briefcase",
  Empresarial: "Building2",
  Família: "Users",
  Previdenciário: "PiggyBank",
  Tributário: "Landmark",
  Digital: "MonitorSmartphone",
  Ambiental: "Leaf",
};

// Tópicos Preliminares Comuns
export const TOPICOS_PRELIMINARES_COMUNS = [
  "Tutela de Urgência",
  "Tutela de Evidência",
  "Justiça Gratuita",
  "Idoso",
  "Pessoa com Deficiência",
  "Interesse em Conciliação",
  "Desinteresse em Conciliação",
  "Concessão da justiça gratuita",
  "Concessão de tutela de urgência (antecipada ou cautelar)",
  "Pedido de prioridade de tramitação (idoso, saúde grave, etc.)",
  "Pedido de sigilo ou segredo de justiça",
  "Pedido de liminar",
  "Pedido de citação da parte ré",
  "Pedido de intimação do MP",
  "Pedido de designação de audiência de conciliação",
  "Pedido de efeito suspensivo (para recursos ou execução)",
  "Pedido de indisponibilidade de bens (bloqueio via BacenJud/Sisbajud)",
  "Pedido de expedição de ofício para obtenção de documento/prova",
  "Pedido de chamamento ao processo / denunciação da lide",
  "Pedido de realização de perícia (e nomeação de perito)",
  "Pedido de produção de provas (testemunhal, documental, pericial)",
  "Pedido de expedição de carta precatória ou carta rogatória",
  "Pedido de destaque de valor incontroverso",
  "Pedido de redistribuição do feito (incompetência relativa)",
  "Pedido de habilitação de terceiro/intervenção de amicus curiae",
  "Pedido de audiência de justificação prévia",
  "Pedido de apresentação dos documentos pelo réu (exibição)",
];

// Tópicos Preliminares para Defesas
export const TOPICOS_PRELIMINARES_DEFESA = [
  "Preliminar de ilegitimidade ativa/passiva",
  "Preliminar de carência de ação (interesse ou possibilidade jurídica)",
  "Preliminar de inépcia da petição inicial",
  "Preliminar de incompetência do juízo",
  "Preliminar de prescrição ou decadência",
  "Preliminar de convenção de arbitragem",
  "Preliminar de conexão ou continência",
  "Preliminar de ausência de pressupostos processuais",
  "Preliminar de ausência de condições da ação",
  "Pedido de improcedência liminar do pedido",
  "Pedido de julgamento antecipado de improcedência (CPC art. 332)",
  "Pedido de extinção sem resolução de mérito",
  "Pedido de aplicação do art. 10 do CPC (não-surpresa)",
];

// Tópicos Preliminares Especiais
export const TOPICOS_PRELIMINARES_ESPECIAIS = [
  "Pedido de tramitação em segredo de justiça (ex: família, menores, sigilo bancário)",
  "Pedido de tutela da evidência",
  "Pedido de gratuidade retroativa (benefício indeferido anteriormente)",
  "Pedido de concessão de efeito ativo em recurso (caso de agravo)",
  "Pedido de exclusão de litisconsorte passivo/ativo",
  "Pedido de gratuidade para pessoa jurídica em recuperação judicial",
  "Pedido de suspensão do processo por prejudicialidade externa",
  "Pedido de inversão do ônus da prova (CDC)",
  "Pedido de destaque em precatórios/RPV",
];

// Peças Jurídicas Comuns
export const PECAS_COMUNS = [
  {
    nome: "Petição inicial",
    desc: "Peça inaugural do processo, apresentando os fatos, fundamentos e pedidos do autor.",
  },
  {
    nome: "Contestação",
    desc: "Defesa do réu, apresentando argumentos e provas contrários à petição inicial.",
  },
  {
    nome: "Réplica",
    desc: "Manifestação do autor sobre a contestação apresentada pelo réu.",
  },
  {
    nome: "Embargos de declaração",
    desc: "Instrumento para esclarecer obscuridade, omissão ou contradição em decisão judicial.",
  },
  {
    nome: "Recurso de apelação",
    desc: "Recurso contra sentença, visando sua reforma ou anulação.",
  },
  {
    nome: "Recurso inominado",
    desc: "Recurso cabível nos Juizados Especiais Cíveis contra sentença.",
  },
  {
    nome: "Agravo de instrumento",
    desc: "Recurso contra decisões interlocutórias que causem lesão grave ou de difícil reparação.",
  },
  {
    nome: "Agravo interno",
    desc: "Recurso dirigido ao próprio órgão julgador para reanálise de decisão monocrática.",
  },
  {
    nome: "Recurso especial",
    desc: "Recurso ao STJ para uniformização da interpretação da lei federal.",
  },
  {
    nome: "Recurso extraordinário",
    desc: "Recurso ao STF para questões constitucionais.",
  },
  {
    nome: "Habeas Corpus",
    desc: "Ação constitucional para proteger a liberdade de locomoção.",
  },
  {
    nome: "Mandado de Segurança",
    desc: "Ação constitucional para proteger direito líquido e certo.",
  },
  {
    nome: "Ação Rescisória",
    desc: "Ação para desconstituir sentença transitada em julgado.",
  },
  {
    nome: "Execução de Título Extrajudicial",
    desc: "Processo para cobrança de dívida com base em título executivo.",
  },
  {
    nome: "Execução de Sentença",
    desc: "Processo para cumprimento de decisão judicial.",
  },
  {
    nome: "Liquidação de Sentença",
    desc: "Procedimento para quantificar o valor devido em sentença ilíquida.",
  },
  {
    nome: "Usucapião",
    desc: "Ação para adquirir propriedade pela posse prolongada.",
  },
  {
    nome: "Reintegração de Posse",
    desc: "Ação para retomar a posse de bem esbulhado.",
  },
];

// Peças por área do direito
export const PECAS_POR_AREA = {
  Geral: PECAS_COMUNS,
  Cível: [
    ...PECAS_COMUNS,
    {
      nome: "Ação de Indenização",
      desc: "Ação para reparação de danos materiais e/ou morais.",
    },
    {
      nome: "Ação de Cobrança",
      desc: "Ação para cobrança de valores em dinheiro.",
    },
  ],
  Penal: [
    {
      nome: "Denúncia",
      desc: "Peça acusatória do Ministério Público em ação penal pública.",
    },
    {
      nome: "Queixa-Crime",
      desc: "Peça acusatória em ação penal privada.",
    },
    {
      nome: "Defesa Prévia",
      desc: "Defesa apresentada antes do recebimento da denúncia.",
    },
  ],
  Trabalhista: [
    {
      nome: "Reclamação Trabalhista",
      desc: "Petição inicial na Justiça do Trabalho.",
    },
    {
      nome: "Defesa Trabalhista",
      desc: "Contestação em processo trabalhista.",
    },
  ],
  Empresarial: [
    {
      nome: "Recuperação Judicial",
      desc: "Pedido de recuperação de empresa em crise.",
    },
    {
      nome: "Falência",
      desc: "Pedido de decretação de falência.",
    },
  ],
  Família: [
    {
      nome: "Divórcio",
      desc: "Ação para dissolução do casamento.",
    },
    {
      nome: "Alimentos",
      desc: "Ação para fixação de pensão alimentícia.",
    },
  ],
  Previdenciário: [
    {
      nome: "Aposentadoria",
      desc: "Ação para concessão de aposentadoria.",
    },
    {
      nome: "Auxílio-Doença",
      desc: "Ação para concessão de auxílio-doença.",
    },
  ],
  Tributário: [
    {
      nome: "Mandado de Segurança Tributário",
      desc: "Ação contra cobrança indevida de tributos.",
    },
    {
      nome: "Execução Fiscal",
      desc: "Defesa em execução fiscal.",
    },
  ],
  Digital: [
    {
      nome: "Direito ao Esquecimento",
      desc: "Ação para remoção de conteúdo da internet.",
    },
    {
      nome: "Proteção de Dados",
      desc: "Ação relacionada à LGPD.",
    },
  ],
  Ambiental: [
    {
      nome: "Ação Civil Pública Ambiental",
      desc: "Ação para proteção do meio ambiente.",
    },
    {
      nome: "Licenciamento Ambiental",
      desc: "Procedimento para obtenção de licenças.",
    },
  ],
  "Direito Bancário": [
    {
      nome: "Revisão de Contrato Bancário",
      desc: "Ação para revisão de cláusulas abusivas.",
    },
    {
      nome: "Consignado",
      desc: "Ação relacionada a empréstimo consignado.",
    },
  ],
};

// Exemplos e sugestões
export const EXEMPLO_FATOS =
  "Ex: O cliente adquiriu um produto defeituoso e não obteve solução administrativa, restando apenas a via judicial.";

export const SUGESTOES_TESES = [
  "Responsabilidade objetiva do fornecedor",
  "Dano moral em relações de consumo",
  "Inversão do ônus da prova",
];

export const SUGESTOES_JURISPRUDENCIAS = [
  "STJ, REsp 123456/DF: responsabilidade objetiva do fornecedor",
  "TJSP, Apelação 987654-32.2023.8.26.0000: dano moral em consumo",
];

// Estado inicial do editor
export const INITIAL_EDITOR_STATE = {
  etapa: 0,
  voltarParaRevisao: false,
  clientes: [],
  clientesDisponiveis: [],
  partesRe: [
    {
      nome: "",
      tipo: "Pessoa Física" as "Pessoa Física" | "Pessoa Jurídica",
      cpfCnpj: "",
      rg: "",
      endereco: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      email: "",
      phone: "",
      profissao: "",
      birthDate: "",
      maritalStatus: "",
      nationality: "Brasileira",
      observations: "",
    },
  ],
  poloClientes: {},
  sugestoesClientes: [],
  areaSelecionada: null,
  pecaSelecionada: null,
  fatos: "",
  pedidosEspecificos: "",
  topicos: [],
  teses: [],
  juris: [],
  numeroProcesso: "",
  varaJuizo: "",
  comarca: "",
  valorCausa: "",
  textoFinal: "",
  gerando: false,
  progresso: 0,
  logs: [],
  analisandoTeses: false,
  sugestoesTesesIA: [],
  sugestoesJurisIA: [],
  modeloIA: "gemini" as const,
  logoUrl: "",
  tituloDocumento: "",
  htmlPreview: "",
  showAddClient: false,
  novoCliente: {
    name: "",
    email: "",
    cpf: "",
    address: "",
  },
  showAddParteRe: false,
  novaParteRe: {
    nome: "",
    tipo: "Pessoa Física" as "Pessoa Física" | "Pessoa Jurídica",
    cpfCnpj: "",
    rg: "",
    endereco: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    email: "",
    phone: "",
    profissao: "",
    birthDate: "",
    maritalStatus: "",
    nationality: "Brasileira",
    observations: "",
  },
  buscaTopico: "",
  openClientesPopover: false,
  openPartesAccordion: ["parte-0"],
  novaTese: "",
  novaJurisprudencia: "",
};
