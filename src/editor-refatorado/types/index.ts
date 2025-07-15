// Tipos principais do Editor
export interface Cliente {
  id: number;
  name: string;
  nome?: string; // compatibilidade com dados existentes
  email?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  endereco?: string; // compatibilidade
  profissao?: string;
  estadoCivil?: string;
  maritalStatus?: string; // compatibilidade
  manual?: boolean;
  // Campos adicionais da página Clients
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  birthDate?: string;
  nationality?: string;
  observations?: string;
  status?: string;
  processes?: number;
  createdAt?: Date;
}

export interface ParteAdversa {
  nome: string;
  tipo: "Pessoa Física" | "Pessoa Jurídica";
  cpfCnpj: string;
  rg?: string;
  endereco: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  email: string;
  phone?: string;
  profissao?: string;
  birthDate?: string;
  maritalStatus?: string;
  nationality?: string;
  observations?: string;
}

export interface PecaJuridica {
  nome: string;
  desc: string;
}

export interface TemplateSettings {
  fontSize: string;
  fontFamily: string;
  lineHeight: string;
  pageMargins: string;
  headerFooter: boolean;
  watermark: boolean;
}

export interface DocumentoGerado {
  id: string;
  title: string;
  type: string;
  content: string;
  clientId: string;
  clientName: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  template: string;
  metadata: {
    causeValue: string;
    jurisdiction: string;
    theses: string[];
    jurisprudences: string[];
    blocks: any[];
    aiGenerated: boolean;
  };
  tags: string[];
  version: number;
}

export interface EditorState {
  // Navegação
  etapa: number;
  voltarParaRevisao: boolean;

  // Clientes e Partes
  clientes: Cliente[];
  clientesDisponiveis: Cliente[];
  partesRe: ParteAdversa[];
  poloClientes: { [id: number]: "autor" | "reu" };
  sugestoesClientes: Cliente[];

  // Área e Peça
  areaSelecionada: string | null;
  pecaSelecionada: PecaJuridica | null;

  // Conteúdo
  fatos: string;
  pedidosEspecificos: string;
  topicos: string[];
  teses: string[];
  juris: string[];

  // Processo
  numeroProcesso: string;
  varaJuizo: string;
  comarca: string;
  valorCausa: string;

  // Geração
  textoFinal: string;
  gerando: boolean;
  progresso: number;
  logs: string[];
  analisandoTeses: boolean;
  sugestoesTesesIA: string[];
  sugestoesJurisIA: string[];

  // Configurações
  modeloIA: "gemini" | "deepseek";
  logoUrl: string;
  tituloDocumento: string;
  htmlPreview: string;

  // UI State
  showAddClient: boolean;
  novoCliente: {
    name: string;
    email: string;
    cpf: string;
    address: string;
  };
  showAddParteRe: boolean;
  novaParteRe: ParteAdversa;
  buscaTopico: string;
  openClientesPopover: boolean;
  openPartesAccordion: string[];

  // Sugestões
  novaTese: string;
  novaJurisprudencia: string;
}

export interface EtapaConfig {
  label: string;
  icon: string;
  isValid: (state: EditorState) => boolean;
  isRequired: boolean;
}

export interface EditorActions {
  // Navegação
  setEtapa: (etapa: number) => void;
  nextEtapa: () => void;
  prevEtapa: () => void;

  // Clientes
  setClientes: (clientes: Cliente[]) => void;
  toggleCliente: (cliente: Cliente) => void;
  excluirCliente: (cliente: Cliente) => void;
  removerClienteDaPeca: (cliente: Cliente) => void;
  setPoloCliente: (id: number, polo: "autor" | "reu") => void;
  adicionarClienteManual: (cliente: Omit<Cliente, "id">) => void;
  setClientesDisponiveis: (clientes: Cliente[]) => void;

  // Partes Adversas
  adicionarParteAdversa: () => void;
  removerParteAdversa: (index: number) => void;
  atualizarParteAdversa: (index: number, parte: Partial<ParteAdversa>) => void;

  // Conteúdo
  setFatos: (fatos: string) => void;
  setPedidosEspecificos: (pedidos: string) => void;
  toggleTopico: (topico: string) => void;
  toggleTese: (tese: string) => void;
  toggleJurisprudencia: (juris: string) => void;

  // Área e Peça
  setAreaSelecionada: (area: string) => void;
  setPecaSelecionada: (peca: PecaJuridica) => void;

  // Processo
  setNumeroProcesso: (numeroProcesso: string) => void;
  setVaraJuizo: (varaJuizo: string) => void;
  setComarca: (comarca: string) => void;
  setValorCausa: (valorCausa: string) => void;

  // Configurações
  setTituloDocumento: (titulo: string) => void;

  // IA e Geração
  analisarFatosParaTeses: () => Promise<void>;
  gerarPecaIA: () => Promise<void>;
  setTextoFinal: (texto: string) => void;

  // Funções de sugestões IA
  setSugestoesTesesIA: (sugestoes: string[]) => void;
  setSugestoesJurisIA: (sugestoes: string[]) => void;

  // Utilidades
  getPoloOposto: (polo: "autor" | "reu") => "autor" | "reu";
  filtrarTopicos: (topicos: string[], busca: string) => string[];

  // Formatação
  gerarHtmlFormatado: (texto: string) => string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EtapaValidation {
  [etapa: number]: ValidationResult;
}

// Props dos componentes
export interface EtapaClienteProps {
  state: EditorState;
  actions: EditorActions;
  onNext: () => void;
}

export interface EtapaAreaProps {
  state: EditorState;
  actions: EditorActions;
  onNext: () => void;
  onPrev: () => void;
}

export interface EtapaFatosProps {
  state: EditorState;
  actions: EditorActions;
  onNext: () => void;
  onPrev: () => void;
}

export interface EtapaProcessoProps {
  state: EditorState;
  actions: EditorActions;
  onNext: () => void;
  onPrev: () => void;
}

export interface EtapaTesesProps {
  state: EditorState;
  actions: EditorActions;
  onNext: () => void;
  onPrev: () => void;
}

export interface EtapaRevisaoProps {
  state: EditorState;
  actions: EditorActions;
  onNext: () => void;
  onPrev: () => void;
  onEditEtapa: (etapa: number) => void;
}

export interface EtapaGeracaoProps {
  state: EditorState;
  actions: EditorActions;
  onPrev: () => void;
}

export interface EtapaFinalProps {
  state: EditorState;
  actions: EditorActions;
  onPrev: () => void;
}
