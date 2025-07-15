// @ts-nocheck
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  FileText,
  Users,
  BookOpen,
  Edit3,
  CheckCircle,
  Save,
  Gavel,
  Shield,
  Briefcase,
  Building2,
  Heart,
  PiggyBank,
  Landmark,
  MonitorSmartphone,
  Leaf,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { askGemini, askDeepSeek } from "@/lib/ai-service";
import { Progress } from "@/components/ui/progress";
import { exportService } from "@/lib/export-service";
import { getOfficeConfig } from "@/lib/document-service";
import { MetricsService } from "@/lib/metrics-service";
import { AchievementsService } from "@/lib/achievements-service";
import {
  useAchievementNotifications,
  AchievementNotification,
} from "@/components/AchievementNotification";
import JuridicalDocumentPreview from "@/components/JuridicalDocumentPreview";
import MarkdownEditor from "@/components/MarkdownEditor";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Check, Copy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplateSettings } from "@/hooks/use-template-settings";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import MetricsDisplay from "@/components/MetricsDisplay";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { clientsService } from "@/lib/clients-service";
import type { Cliente, ParteAdversa } from "@/editor-refatorado/types";
import { documentService } from "@/lib/document-service";

const ETAPAS = [
  { label: "Cliente", icon: <Users className="w-4 h-4" /> },
  { label: "Área/Peça", icon: <Gavel className="w-4 h-4" /> },
  { label: "Fatos", icon: <FileText className="w-4 h-4" /> },
  { label: "Dados do Processo", icon: <Shield className="w-4 h-4" /> },
  { label: "Teses/Jurisprudências", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Edição Final", icon: <Edit3 className="w-4 h-4" /> },
];

const TOPICOS_PRELIMINARES_COMUNS = [
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

const TOPICOS_PRELIMINARES_DEFESA = [
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

const TOPICOS_PRELIMINARES_ESPECIAIS = [
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

// Áreas e peças de exemplo
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

const PECAS_COMUNS = [
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
    nome: "Mandado de segurança (quando cabível)",
    desc: "Ação constitucional para proteger direito líquido e certo não amparado por habeas corpus ou habeas data.",
  },
  {
    nome: "Pedido de tutela de urgência (antecipada ou cautelar)",
    desc: "Pedido para obtenção de medida urgente antes do julgamento final.",
  },
  {
    nome: "Pedido de cumprimento de sentença",
    desc: "Requerimento para execução da decisão judicial transitada em julgado.",
  },
  {
    nome: "Impugnação ao cumprimento",
    desc: "Meio de defesa do executado contra o cumprimento de sentença.",
  },
  {
    nome: "Embargos à execução",
    desc: "Defesa do executado em processo de execução.",
  },
  {
    nome: "Recurso adesivo",
    desc: "Recurso interposto pelo vencido em adesão ao recurso principal da parte contrária.",
  },
  {
    nome: "Exceções (suspeição, incompetência etc.)",
    desc: "Instrumentos para arguir impedimentos ou suspeições do juiz, ou incompetência do juízo.",
  },
];

const PECAS_POR_AREA: Record<string, { nome: string; desc: string }[]> = {
  Geral: [...PECAS_COMUNS],
  Cível: [
    {
      nome: "Apelação Cível",
      desc: "Recorra de sentença cível, buscando reexaminar provas e fundamentos para reverter ou modificar a decisão.",
    },
    {
      nome: "Ação Declaratória",
      desc: "Obtenha declaração judicial sobre a existência ou inexistência de uma relação jurídica, dissipando dúvidas legais.",
    },
    {
      nome: "Ação Monitória",
      desc: "Busque cobrar dívidas sem título executivo, valendo-se de documentos que comprovem o crédito existente.",
    },
    {
      nome: "Ação de Despejo",
      desc: "Retome seu imóvel de forma célere, fundamentando razões de despejo e assegurando cumprimento legal.",
    },
    {
      nome: "Ação de Execução de Título Extrajudicial",
      desc: "Exija judicialmente dívidas constantes em título extrajudicial, assegurando o cumprimento da obrigação.",
    },
    {
      nome: "Ação de Obrigação de Fazer",
      desc: "Exija a execução de atos ou serviços contratuais, compelindo o cumprimento do que foi pactuado.",
    },
    {
      nome: "Ação de Prestação de Contas",
      desc: "Requeira ou apresente esclarecimentos na administração de bens ou valores, assegurando transparência financeira.",
    },
    {
      nome: "Cobrança",
      desc: "Facilite a cobrança com ações bem fundamentadas, garantindo recuperação de valores de modo rápido e eficaz.",
    },
    {
      nome: "Consignação em Pagamento",
      desc: "Regularize pendências financeiras de forma judicial, evitando cobranças indevidas.",
    },
    {
      nome: "Contestação Cível",
      desc: "Defenda-se em ações cíveis com argumentos sólidos e fundamentação jurídica adequada.",
    },
    {
      nome: "Contrarrazões ao Agravo de Instrumento",
      desc: "Responda a recursos de agravo, defendendo a manutenção da decisão recorrida.",
    },
    {
      nome: "Contrarrazões ao Recurso Especial",
      desc: "Defenda a manutenção do julgado, apresentando argumentos técnicos e jurisprudenciais.",
    },
    {
      nome: "Contrarrazões ao Recurso Inominado",
      desc: "Responda a recursos inominados, defendendo a manutenção da decisão recorrida.",
    },
    {
      nome: "Contrarrazões aos Embargos de Declaração",
      desc: "Responda a embargos de declaração, esclarecendo pontos questionados.",
    },
    {
      nome: "Cumprimento de Sentença",
      desc: "Requeira a execução da sentença proferida no processo.",
    },
    {
      nome: "Embargos de Declaração",
      desc: "Instrumento para esclarecer obscuridade, omissão ou contradição em decisão judicial.",
    },
    {
      nome: "Embargos de Terceiro",
      desc: "Defenda direito de terceiro atingido por ato de constrição judicial.",
    },
    {
      nome: "Embargos à Execução",
      desc: "Defesa do executado em processo de execução.",
    },
    {
      nome: "Exceção de Pré-Executividade",
      desc: "Meio de defesa do executado para alegar matérias de ordem pública sem garantia do juízo.",
    },
    {
      nome: "Impugnação ao Cumprimento de Sentença",
      desc: "Meio de defesa do executado contra o cumprimento de sentença.",
    },
    {
      nome: "Indenização por Danos Morais",
      desc: "Aja para reparar danos morais sofridos.",
    },
    {
      nome: "Liquidação de Sentença",
      desc: "Procedimento para quantificar o valor devido em sentença ilíquida.",
    },
    {
      nome: "Mandado de Segurança",
      desc: "Ação constitucional para proteger direito líquido e certo.",
    },
    {
      nome: "Pedido de Citação por Edital",
      desc: "Solicite a citação do réu por edital quando não localizado.",
    },
    {
      nome: "Petição de Juntada de Documento",
      desc: "Requeira a juntada de documentos aos autos do processo.",
    },
    {
      nome: "Reintegração de Posse",
      desc: "Aja para retomar a posse de bem esbulhado.",
    },
    {
      nome: "Réplica à Contestação",
      desc: "Responda à contestação apresentada pelo réu.",
    },
    {
      nome: "Usucapião",
      desc: "Aja para adquirir propriedade pela posse prolongada.",
    },
  ],
  Penal: [
    {
      nome: "Recurso em Sentido Estrito",
      desc: "Conteste decisões penais que não admitem apelação, buscando sua reforma.",
    },
    {
      nome: "Apelação Criminal",
      desc: "Recorra de sentença penal condenatória ou absolutória.",
    },
    {
      nome: "Agravo em Execução Penal",
      desc: "Conteste decisões no curso da execução penal.",
    },
    {
      nome: "Alegações Finais",
      desc: "Apresente as alegações finais na ação penal.",
    },
    {
      nome: "Embargos Infringentes e de Nulidade",
      desc: "Questione decisões não unânimes em tribunais.",
    },
    {
      nome: "Habeas Corpus",
      desc: "Aja para proteger a liberdade de locomoção.",
    },
    {
      nome: "Medida Protetiva",
      desc: "Solicite medidas protetivas em casos de violência.",
    },
    {
      nome: "Pedido de Saída Temporária",
      desc: "Requeira saída temporária do apenado.",
    },
    { nome: "Queixa-Crime", desc: "Inicie ação penal privada." },
    {
      nome: "Resposta à Acusação",
      desc: "Apresente defesa prévia em ação penal.",
    },
    {
      nome: "Restituição de Coisas Apreendidas",
      desc: "Requeira devolução de bens apreendidos.",
    },
    {
      nome: "Revisão Criminal",
      desc: "Peça revisão de sentença penal condenatória.",
    },
    {
      nome: "Revogação de Medida Protetiva",
      desc: "Solicite a revogação de medidas protetivas.",
    },
  ],
  Trabalhista: [
    ...PECAS_COMUNS,
    {
      nome: "Agravo de Instrumento Trabalhista",
      desc: "Recurso contra decisões interlocutórias na Justiça do Trabalho.",
    },
    {
      nome: "Agravo de Petição",
      desc: "Recurso cabível em fase de execução trabalhista.",
    },
    {
      nome: "Ação de Equiparação Salarial",
      desc: "Aja para equiparar salários entre empregados.",
    },
    {
      nome: "Contestação Trabalhista",
      desc: "Defesa do réu em ação trabalhista.",
    },
    {
      nome: "Embargos de Declaração Trabalhista",
      desc: "Esclareça obscuridade, omissão ou contradição em decisão trabalhista.",
    },
    {
      nome: "Indenização por Acidente de Trabalho",
      desc: "Aja para reparar danos decorrentes de acidente de trabalho.",
    },
    {
      nome: "Nulidade de Justa Causa",
      desc: "Questione a justa causa aplicada ao empregado.",
    },
    {
      nome: "Reclamação Trabalhista",
      desc: "Aja para reivindicar direitos trabalhistas.",
    },
    {
      nome: "Reconhecimento de Vínculo Empregatício",
      desc: "Peça reconhecimento de vínculo de emprego.",
    },
    {
      nome: "Recurso Ordinário Trabalhista",
      desc: "Recurso contra decisões em processos trabalhistas.",
    },
    {
      nome: "Recurso de Revista",
      desc: "Recurso ao TST para uniformização da jurisprudência.",
    },
    {
      nome: "Rescisão Indireta do Contrato de Trabalho",
      desc: "Peça rescisão indireta por falta grave do empregador.",
    },
    {
      nome: "Réplica à Contestação Trabalhista",
      desc: "Responda à contestação em ação trabalhista.",
    },
  ],
  Empresarial: [
    ...PECAS_COMUNS,
    {
      nome: "Cobrança de Títulos de Crédito",
      desc: "Aja para cobrar títulos de crédito inadimplidos.",
    },
    {
      nome: "Execução de Título Extrajudicial Empresarial",
      desc: "Execute títulos extrajudiciais empresariais.",
    },
    { nome: "Falência", desc: "Peça a falência de empresa inadimplente." },
    {
      nome: "Recuperação Judicial",
      desc: "Solicite recuperação judicial de empresa em crise.",
    },
  ],
  Família: [
    ...PECAS_COMUNS,
    { nome: "Ação de Adoção", desc: "Aja para adotar menor ou incapaz." },
    {
      nome: "Ação de Alimentos",
      desc: "Peça alimentos para si ou para terceiro.",
    },
    { nome: "Ação de Curatela", desc: "Peça curatela para incapaz." },
    {
      nome: "Ação de Divórcio",
      desc: "Aja para dissolver vínculo matrimonial.",
    },
    {
      nome: "Ação de Exoneração de Alimentos",
      desc: "Peça exoneração da obrigação alimentar.",
    },
    { nome: "Ação de Guarda de Menor", desc: "Peça guarda judicial de menor." },
    { nome: "Ação de Interdição", desc: "Peça interdição de pessoa incapaz." },
    {
      nome: "Ação de Inventário",
      desc: "Peça abertura de inventário para partilha de bens.",
    },
    {
      nome: "Dissolução de União Estável",
      desc: "Aja para dissolver união estável.",
    },
    {
      nome: "Investigação de Paternidade",
      desc: "Peça investigação de paternidade.",
    },
    {
      nome: "Reconhecimento de Paternidade",
      desc: "Peça reconhecimento de paternidade.",
    },
    {
      nome: "Revisão de Alimentos",
      desc: "Peça revisão do valor dos alimentos.",
    },
  ],
  Previdenciário: [
    ...PECAS_COMUNS,
    {
      nome: "Concessão de Aposentadoria Especial",
      desc: "Peça aposentadoria especial por exposição a agentes nocivos.",
    },
    {
      nome: "Concessão de Aposentadoria por Incapacidade Permanente",
      desc: "Peça aposentadoria por incapacidade permanente.",
    },
    {
      nome: "Concessão de Auxílio-Doença",
      desc: "Peça auxílio-doença por incapacidade temporária.",
    },
    {
      nome: "Revisão de Benefício Previdenciário",
      desc: "Peça revisão de benefício previdenciário.",
    },
  ],
  Tributário: [
    ...PECAS_COMUNS,
    {
      nome: "Ação de Isenção de Imposto de Renda",
      desc: "Peça isenção de imposto de renda.",
    },
    {
      nome: "Contestação de Multas por Erro na Classificação Tributária de Startups",
      desc: "Defenda-se de multas por erro de classificação tributária.",
    },
    {
      nome: "Incentivo Fiscal para Empresas de Base Tecnológica",
      desc: "Solicite incentivos fiscais para empresas inovadoras.",
    },
    {
      nome: "Recuperação de Créditos Fiscais para Empresas de Inovação",
      desc: "Recupere créditos fiscais de inovação.",
    },
    {
      nome: "Revisão de Tributação para Startups (Simples Nacional)",
      desc: "Peça revisão da tributação de startups no Simples Nacional.",
    },
  ],
  Ambiental: [
    ...PECAS_COMUNS,
    {
      nome: "Ação Popular",
      desc: "Aja para proteger interesses difusos por meio de ação popular.",
    },
    {
      nome: "Ação de Responsabilidade por Danos Ambientais",
      desc: "Responsabilize causadores de danos ambientais.",
    },
  ],
  Administrativo: [
    {
      nome: "Abertura de Processo Administrativo",
      desc: "Solicite abertura de processo administrativo.",
    },
    {
      nome: "Pedido de Informações",
      desc: "Solicite informações a órgãos públicos.",
    },
    {
      nome: "Pedido de Reconsideração",
      desc: "Peça reconsideração de ato administrativo.",
    },
    {
      nome: "Prorrogação de Prazo",
      desc: "Solicite prorrogação de prazo em processo administrativo.",
    },
    {
      nome: "Revisão de Ato Administrativo",
      desc: "Peça revisão de ato administrativo.",
    },
  ],
  Consumidor: [
    {
      nome: "Ação de Produto Não Entregue",
      desc: "Aja contra fornecedor por produto não entregue.",
    },
    { nome: "Cobrança Indevida", desc: "Conteste cobranças indevidas." },
    { nome: "Insolvência Civil", desc: "Peça insolvência civil por dívidas." },
    {
      nome: "Insolvência Familiar",
      desc: "Peça insolvência familiar por dívidas.",
    },
    {
      nome: "Pedido de Moratória de Dívida",
      desc: "Solicite moratória de dívida.",
    },
    {
      nome: "Proteção Contra Superendividamento",
      desc: "Peça proteção contra superendividamento.",
    },
    {
      nome: "Reestruturação de Dívidas",
      desc: "Solicite reestruturação de dívidas.",
    },
    {
      nome: "Renegociação de Dívida",
      desc: "Solicite renegociação de dívida.",
    },
    {
      nome: "Restituição de Valor Pago Indevidamente",
      desc: "Peça restituição de valores pagos indevidamente.",
    },
    {
      nome: "Revisão de Cláusulas Abusivas em Contratos de Crédito",
      desc: "Peça revisão de cláusulas abusivas em contratos de crédito.",
    },
    {
      nome: "Revisão de Contrato de Financiamento",
      desc: "Peça revisão de contrato de financiamento.",
    },
  ],
  Digital: [
    ...PECAS_COMUNS,
    {
      nome: "Bloqueio e Exclusão de Dados Pessoais (LGPD)",
      desc: "Peça bloqueio/exclusão de dados pessoais com base na LGPD.",
    },
    { nome: "Habeas Data", desc: "Aja para garantir acesso a dados pessoais." },
    {
      nome: "Indenização por Uso Indevido de Imagem na Internet",
      desc: "Peça indenização por uso indevido de imagem online.",
    },
    {
      nome: "Reparação por Vazamento de Dados (LGPD)",
      desc: "Peça reparação por vazamento de dados pessoais.",
    },
  ],
  Diversos: [
    {
      nome: "Outros (documentos personalizados)",
      desc: "Crie documentos personalizados para situações não previstas.",
    },
  ],
  Eleitoral: [
    {
      nome: "Ação de Impugnação de Mandato Eletivo",
      desc: "Conteste mandato eletivo por irregularidades.",
    },
    {
      nome: "Ação de Impugnação de Registro de Candidatura",
      desc: "Conteste registro de candidatura.",
    },
    {
      nome: "Ação de Investigação Judicial Eleitoral",
      desc: "Investigue irregularidades eleitorais.",
    },
    {
      nome: "Mandado de Segurança Eleitoral",
      desc: "Aja para proteger direito líquido e certo eleitoral.",
    },
    {
      nome: "Recurso Eleitoral",
      desc: "Recorra de decisões da Justiça Eleitoral.",
    },
    {
      nome: "Representação Eleitoral",
      desc: "Represente interesses perante a Justiça Eleitoral.",
    },
  ],
  Extrajudicial: [
    {
      nome: "Notificação Extrajudicial",
      desc: "Notifique extrajudicialmente partes interessadas.",
    },
    {
      nome: "Requerimento Administrativo",
      desc: "Requeira providências administrativas.",
    },
  ],
  Pareceres: [
    {
      nome: "Parecer Jurídico - CAC",
      desc: "Elabore parecer jurídico para CAC.",
    },
    {
      nome: "Parecer Jurídico - Licitações",
      desc: "Elabore parecer jurídico sobre licitações.",
    },
    {
      nome: "Parecer Jurídico - Princípios",
      desc: "Elabore parecer jurídico sobre princípios jurídicos.",
    },
  ],
  ProcessoPenal: [
    {
      nome: "Alegações Finais por Memoriais",
      desc: "Apresente alegações finais por memoriais em processo penal.",
    },
  ],
  PropriedadeIntelectual: [
    {
      nome: "Cumprimento de Acordo de Licenciamento de Tecnologia",
      desc: "Exija cumprimento de acordo de licenciamento.",
    },
    {
      nome: "Indenização por Uso Indevido de Software",
      desc: "Peça indenização por uso indevido de software.",
    },
    {
      nome: "Proteção de Segredos Industriais",
      desc: "Proteja segredos industriais.",
    },
    {
      nome: "Violação de Direitos Autorais sobre Software",
      desc: "Aja contra violação de direitos autorais de software.",
    },
    {
      nome: "Violação de Patente Tecnológica",
      desc: "Aja contra violação de patente tecnológica.",
    },
  ],
  Recursos: [
    {
      nome: "Agravo Interno",
      desc: "Recurso dirigido ao próprio órgão julgador para reanálise de decisão monocrática.",
    },
    {
      nome: "Agravo de Instrumento",
      desc: "Recurso contra decisões interlocutórias que causem lesão grave ou de difícil reparação.",
    },
    {
      nome: "Apelação",
      desc: "Recurso contra sentença, visando sua reforma ou anulação.",
    },
    {
      nome: "Ação Rescisória",
      desc: "Peça rescisão de decisão transitada em julgado.",
    },
    {
      nome: "Contrarrazões ao Recurso Ordinário",
      desc: "Responda a recurso ordinário.",
    },
    { nome: "Contrarrazões de Apelação", desc: "Responda a apelação." },
    {
      nome: "Embargos de Declaração",
      desc: "Instrumento para esclarecer obscuridade, omissão ou contradição em decisão judicial.",
    },
    {
      nome: "Embargos de Divergência",
      desc: "Questione divergência jurisprudencial.",
    },
    {
      nome: "Reclamação Constitucional",
      desc: "Aja para garantir autoridade de decisão do STF/STJ.",
    },
    {
      nome: "Recurso Adesivo",
      desc: "Recurso interposto pelo vencido em adesão ao recurso principal da parte contrária.",
    },
    {
      nome: "Recurso Especial",
      desc: "Recurso ao STJ para uniformização da interpretação da lei federal.",
    },
    {
      nome: "Recurso Extraordinário",
      desc: "Recurso ao STF para questões constitucionais.",
    },
    {
      nome: "Recurso Inominado",
      desc: "Recurso cabível nos Juizados Especiais Cíveis contra sentença.",
    },
    {
      nome: "Recurso Ordinário Constitucional",
      desc: "Recurso ordinário em matéria constitucional.",
    },
  ],
  Startups: [
    {
      nome: "Conflito de Interesses entre Sócios",
      desc: "Solucione conflitos societários em startups.",
    },
    {
      nome: "Cumprimento de Acordo de Vesting de Sócios",
      desc: "Exija cumprimento de acordo de vesting.",
    },
    {
      nome: "Incorporação, Fusão ou Cisão de Startups",
      desc: "Aja em operações societárias de startups.",
    },
    {
      nome: "Quebra de Acordo de Confidencialidade (NDA)",
      desc: "Aja contra quebra de NDA.",
    },
    {
      nome: "Reconhecimento de Direito de Propriedade Intelectual",
      desc: "Peça reconhecimento de direito de PI.",
    },
    {
      nome: "Restituição de Investimentos Iniciais (Seed Money)",
      desc: "Peça restituição de seed money.",
    },
    {
      nome: "Revisão de Contratos de Investimento-Anjo",
      desc: "Peça revisão de contratos de investimento-anjo.",
    },
  ],
  "Direito Bancário": [
    {
      nome: "Ação Revisional de Contrato Bancário",
      desc: "Revise cláusulas e valores em contratos bancários para adequação legal.",
    },
    {
      nome: "Ação Declaratória de Inexistência de Débito",
      desc: "Declare judicialmente a inexistência de débito bancário indevido.",
    },
    {
      nome: "Ação de Indenização por Dano Moral por Cobrança Indevida",
      desc: "Peça indenização por cobranças bancárias indevidas que geraram dano moral.",
    },
    {
      nome: "Ação de Sustação de Protesto",
      desc: "Solicite a suspensão de protesto de título bancário.",
    },
    {
      nome: "Ação Anulatória de Cláusula Abusiva",
      desc: "Anule cláusulas abusivas em contratos bancários.",
    },
    {
      nome: "Ação de Repetição do Indébito (em dobro)",
      desc: "Peça devolução em dobro de valores pagos indevidamente ao banco.",
    },
    {
      nome: "Ação de Busca e Apreensão (bem alienado fiduciariamente)",
      desc: "Aja para buscar e apreender bem alienado fiduciariamente.",
    },
    {
      nome: "Defesa em Ação de Busca e Apreensão",
      desc: "Defenda-se em ação de busca e apreensão de bem bancário.",
    },
    {
      nome: "Ação de Consignação em Pagamento",
      desc: "Deposite judicialmente valores devidos ao banco para evitar mora.",
    },
    {
      nome: "Ação de Exibição de Documentos Bancários",
      desc: "Requeira apresentação de documentos bancários pelo banco.",
    },
    {
      nome: "Ação para Levantamento de Valores de Conta Encerrada",
      desc: "Solicite levantamento de valores remanescentes em conta encerrada.",
    },
    {
      nome: "Ação para Cancelamento de Débito Automático",
      desc: "Peça o cancelamento de débito automático não autorizado.",
    },
    {
      nome: "Defesa em Execução de Cédula de Crédito Bancário",
      desc: "Defenda-se em execução de cédula de crédito bancário.",
    },
    {
      nome: "Ação de Cancelamento de Cláusula de Capitalização de Juros",
      desc: "Peça cancelamento de cláusula de capitalização de juros abusiva.",
    },
    {
      nome: "Ação de Nulidade de Contrato com Assinatura Fraudulenta",
      desc: "Anule contrato bancário assinado fraudulentamente.",
    },
    {
      nome: "Ação de Cessação de Ligações de Cobrança Abusivas",
      desc: "Cesse ligações de cobrança abusivas realizadas por bancos.",
    },
    {
      nome: "Ação de Restituição de Encargos Cobrados Indevidamente",
      desc: "Peça restituição de encargos bancários cobrados indevidamente.",
    },
    {
      nome: "Defesa em Ação de Execução Bancária",
      desc: "Defenda-se em ação de execução movida por banco.",
    },
    {
      nome: "Ação de Responsabilidade Objetiva por Fraude Bancária (ex: golpe do Pix)",
      desc: "Peça responsabilização do banco por fraudes como golpes do Pix.",
    },
    {
      nome: "Pedido de Exibição de Extratos e Contratos",
      desc: "Solicite judicialmente extratos e contratos bancários.",
    },
    {
      nome: "Contestação em Ação de Cobrança Bancária",
      desc: "Defenda-se em ação de cobrança movida por banco.",
    },
  ],
};

const ICONES_AREAS: Record<string, React.ReactElement> = {
  Cível: <Gavel className="w-4 h-4 mr-1" />,
  Penal: <Shield className="w-4 h-4 mr-1" />,
  Trabalhista: <Briefcase className="w-4 h-4 mr-1" />,
  Empresarial: <Building2 className="w-4 h-4 mr-1" />,
  Família: <Users className="w-4 h-4 mr-1" />,
  Previdenciário: <PiggyBank className="w-4 h-4 mr-1" />,
  Tributário: <Landmark className="w-4 h-4 mr-1" />,
  Digital: <MonitorSmartphone className="w-4 h-4 mr-1" />,
  Ambiental: <Leaf className="w-4 h-4 mr-1" />,
};

export default function Editor() {
  const [etapa, setEtapa] = useState(0);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState<any[]>([]);
  const [fatos, setFatos] = useState("");
  const [teses, setTeses] = useState<string[]>([]);
  const [juris, setJuris] = useState<string[]>([]);
  const [textoFinal, setTextoFinal] = useState("");
  const [gerando, setGerando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [partesRe, setPartesRe] = useState([
    {
      nome: "",
      tipo: "Pessoa Física",
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
  ]);
  const [topicos, setTopicos] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [tituloDocumento, setTituloDocumento] = useState("");
  const [poloClientes, setPoloClientes] = useState<{
    [id: number]: "autor" | "reu";
  }>({});
  const [sugestoesClientes, setSugestoesClientes] = useState<any[]>([]);
  const [modeloIA, setModeloIA] = useState<"gemini" | "deepseek">("gemini");
  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null);
  const [pecaSelecionada, setPecaSelecionada] = useState<{
    nome: string;
    desc: string;
  } | null>(null);
  const [pedidosEspecificos, setPedidosEspecificos] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    name: "",
    email: "",
    cpf: "",
    address: "",
    rg: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    birthDate: "",
    maritalStatus: "",
    nationality: "Brasileira",
    observations: "",
    profissao: "",
  });
  const [showAddParteRe, setShowAddParteRe] = useState(false);
  const [novaParteRe, setNovaParteRe] = useState({
    nome: "",
    tipo: "Pessoa Física",
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
  });
  const { settings: templateSettings, updateSetting } = useTemplateSettings();
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [buscaTopico, setBuscaTopico] = useState("");
  // 1. Adicione o estado local para controlar o Popover
  const [openClientesPopover, setOpenClientesPopover] = useState(false);
  // 1. Estado para controlar quais Accordions estão abertos
  const [openPartesAccordion, setOpenPartesAccordion] = useState(["parte-0"]);
  const [voltarParaRevisao, setVoltarParaRevisao] = useState(false);
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [varaJuizo, setVaraJuizo] = useState("");
  const [comarca, setComarca] = useState("");
  const [valorCausa, setValorCausa] = useState("");
  const [novaTese, setNovaTese] = useState("");
  const [novaJurisprudencia, setNovaJurisprudencia] = useState("");
  const [analisandoTeses, setAnalisandoTeses] = useState(false);
  const [sugestoesTesesIA, setSugestoesTesesIA] = useState<string[]>([]);
  const [sugestoesJurisIA, setSugestoesJurisIA] = useState<string[]>([]);

  // Hook para notificações de conquistas
  const { notifications, addNotification, removeNotification } =
    useAchievementNotifications();

  // Função para analisar fatos e gerar sugestões de teses
  async function analisarFatosParaTeses() {
    if (!fatos.trim() && !pedidosEspecificos.trim()) {
      setSugestoesTesesIA([]);
      setSugestoesJurisIA([]);
      return;
    }

    setAnalisandoTeses(true);

    try {
      const prompt = `Analise os seguintes fatos e pedidos de um processo jurídico e sugira 5-8 teses jurídicas específicas e 3-5 jurisprudências importantes.

IMPORTANTE: Cada tese sugerida deve ser específica o suficiente para permitir o desenvolvimento de pelo menos 5 parágrafos, incluindo:
- Fundamentação legal (artigos, leis)
- Aplicação dos fatos à norma
- Jurisprudência aplicável
- Conclusão da tese

FATOS DO CASO:
${fatos}

PEDIDOS ESPECÍFICOS:
${pedidosEspecificos}

ÁREA DO DIREITO: ${areaSelecionada}
TIPO DE PEÇA: ${pecaSelecionada?.nome || "Não especificado"}

INSTRUÇÕES PARA AS TESES:
- Seja específico e detalhado
- Inclua referências a artigos de lei quando possível
- Foque em teses que possam ser desenvolvidas com argumentação robusta
- Considere aspectos processuais e materiais
- Inclua teses de preliminares se aplicável

INSTRUÇÕES PARA JURISPRUDÊNCIAS:
- Inclua referência completa (tribunal, processo, relator, data)
- Seja específico sobre o tema abordado
- Priorize jurisprudências recentes e relevantes

Por favor, retorne apenas um JSON válido com a seguinte estrutura:
{
  "teses": [
    "Tese jurídica específica com referência legal (ex: Responsabilidade objetiva do fornecedor - CDC art. 14)",
    "Tese jurídica específica com referência legal (ex: Dano moral em relações de consumo - CDC art. 6º, VI)",
    "Tese jurídica específica com referência legal (ex: Inversão do ônus da prova - CDC art. 6º, VIII)"
  ],
  "jurisprudencias": [
    "STJ, REsp 1234567/DF, Rel. Min. João Silva, 3ª Turma, DJe 15/03/2024: Responsabilidade objetiva do fornecedor",
    "STJ, REsp 9876543/SP, Rel. Min. Maria Santos, 2ª Turma, DJe 20/02/2024: Dano moral em relações de consumo",
    "TJSP, Apelação 123456-32.2023.8.26.0000, Rel. Des. José Oliveira, 15ª Câmara, DJ 10/01/2024: Inversão do ônus da prova"
  ]
}

Seja específico, relevante para o caso apresentado e adequado para desenvolvimento argumentativo robusto.`;

      // Substituir fetch por askGemini
      const result = await askGemini(prompt);
      try {
        // Tentar extrair JSON da resposta
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setSugestoesTesesIA(parsed.teses || []);
          setSugestoesJurisIA(parsed.jurisprudencias || []);
        } else {
          // Fallback: extrair teses e jurisprudências do texto
          const lines = result.split("\n").filter((line) => line.trim());
          const teses = lines
            .filter(
              (line) =>
                line.includes("Tese") ||
                line.includes("princípio") ||
                line.includes("direito") ||
                line.includes("aplicação") ||
                line.includes("responsabilidade") ||
                line.includes("dano") ||
                line.includes("art.") ||
                line.includes("CDC") ||
                line.includes("CC") ||
                line.includes("CPC")
            )
            .slice(0, 8);
          const juris = lines
            .filter(
              (line) =>
                line.includes("STJ") ||
                line.includes("STF") ||
                line.includes("TJ") ||
                line.includes("REsp") ||
                line.includes("RE") ||
                line.includes("Apelação") ||
                line.includes("Agravo")
            )
            .slice(0, 5);
          setSugestoesTesesIA(teses);
          setSugestoesJurisIA(juris);
        }
      } catch (parseError) {
        console.error("Erro ao analisar resposta da IA:", parseError);
        setSugestoesTesesIA([]);
        setSugestoesJurisIA([]);
      }
    } catch (error) {
      console.error("Erro ao analisar fatos:", error);
      setSugestoesTesesIA([]);
      setSugestoesJurisIA([]);
    } finally {
      setAnalisandoTeses(false);
    }
  }

  // Efeito para seleção automática de clientes manuais
  useEffect(() => {
    const clientesManuais = clientesDisponiveis.filter(
      (c) => c.manual && (c.name || c.nome || "").trim()
    );

    clientesManuais.forEach((cliente) => {
      if (!clientes.some((c) => c.id === cliente.id)) {
        // Adicionar cliente manual automaticamente se não estiver selecionado
        const clienteComNomeCorreto = {
          ...cliente,
          name: cliente.name || cliente.nome || "",
          nome: cliente.nome || cliente.name || "",
        };
        setClientes((prev) => [...prev, clienteComNomeCorreto]);
        // Definir polo como autor se for o primeiro, ou manter o mesmo dos outros
        if (clientes.length === 0) {
          setPoloClientes((prev) => ({ ...prev, [cliente.id]: "autor" }));
        } else {
          const poloAtual = poloClientes[clientes[0]?.id] || "autor";
          setPoloClientes((prev) => ({ ...prev, [cliente.id]: poloAtual }));
        }
      }
    });
  }, [clientesDisponiveis]);

  // Efeito para seleção automática de partes adversas
  useEffect(() => {
    const partesComDados = partesRe.filter((p) => p.nome.trim());

    // Não adicionar partes adversas aos clientes selecionados
    // Elas serão tratadas separadamente na seção de partes adversas
  }, [partesRe]);

  // Salvamento local (simples)
  // ... pode ser expandido para localStorage/backend

  // Exemplo de sugestões
  const exemploFatos =
    "Ex: O cliente adquiriu um produto defeituoso e não obteve solução administrativa, restando apenas a via judicial.";
  const sugestoesTeses = [
    "Responsabilidade objetiva do fornecedor",
    "Dano moral em relações de consumo",
    "Inversão do ônus da prova",
  ];
  const sugestoesJuris = [
    "STJ, REsp 123456/DF: responsabilidade objetiva do fornecedor",
    "TJSP, Apelação 987654-32.2023.8.26.0000: dano moral em consumo",
  ];

  // Carregar clientes do banco de dados com fallback para localStorage
  useEffect(() => {
    const loadClients = async () => {
      try {
        console.log("🔄 Carregando clientes do banco de dados...");
        const apiClients = await clientsService.getClients();

        if (apiClients && apiClients.length > 0) {
          console.log(`✅ ${apiClients.length} clientes carregados do banco`);

          // Normalizar os dados dos clientes para garantir consistência
          const clientesNormalizados = apiClients.map((cliente) => ({
            ...cliente,
            name: cliente.name || "",
            nome: cliente.name || "",
          }));
          setClientesDisponiveis(clientesNormalizados);
        } else {
          console.log(
            "⚠️ Nenhum cliente encontrado no banco, tentando localStorage..."
          );
          // Fallback para localStorage se não há clientes no banco
          const salvos = JSON.parse(localStorage.getItem("clientes") || "[]");
          if (
            Array.isArray(salvos) &&
            salvos.every((c) => typeof c === "object")
          ) {
            console.log(
              `📦 ${salvos.length} clientes carregados do localStorage`
            );
            const clientesNormalizados = salvos.map((cliente) => ({
              ...cliente,
              name: cliente.name || cliente.nome || "",
              nome: cliente.nome || cliente.name || "",
            }));
            setClientesDisponiveis(clientesNormalizados);
          } else {
            console.log("📭 Nenhum cliente válido no localStorage");
            setClientesDisponiveis([]);
          }
        }
      } catch (error) {
        console.error("❌ Erro ao carregar clientes do banco:", error);
        console.log("🔄 Tentando fallback para localStorage...");

        // Fallback para localStorage em caso de erro na API
        try {
          const salvos = JSON.parse(localStorage.getItem("clientes") || "[]");
          if (
            Array.isArray(salvos) &&
            salvos.every((c) => typeof c === "object")
          ) {
            console.log(
              `📦 ${salvos.length} clientes carregados do localStorage (fallback)`
            );
            const clientesNormalizados = salvos.map((cliente) => ({
              ...cliente,
              name: cliente.name || cliente.nome || "",
              nome: cliente.nome || cliente.name || "",
            }));
            setClientesDisponiveis(clientesNormalizados);
          } else {
            setClientesDisponiveis([]);
          }
        } catch {
          setClientesDisponiveis([]);
        }
      }
    };

    loadClients();
  }, []);

  // Limpar seleção de clientes ao entrar na página
  useEffect(() => {
    setClientes([]);
  }, []);

  // Salvar clientes no localStorage quando modificados
  useEffect(() => {
    if (clientesDisponiveis.length > 0) {
      localStorage.setItem("clientes", JSON.stringify(clientesDisponiveis));
    }
  }, [clientesDisponiveis]);

  // Analisar fatos automaticamente quando chegar na etapa de teses
  useEffect(() => {
    if (
      etapa === 4 &&
      fatos.trim() &&
      !analisandoTeses &&
      sugestoesTesesIA.length === 0
    ) {
      analisarFatosParaTeses();
    }
  }, [etapa, fatos, analisandoTeses]);

  // Selecionar/deselecionar cliente
  function toggleCliente(cliente: any) {
    setClientes((c) => {
      if (c.some((x) => x.id === cliente.id)) {
        // Remover cliente da peça (não excluir permanentemente)
        removerClienteDaPeca(cliente);
        return c.filter((x) => x.id !== cliente.id);
      } else {
        // Adicionar cliente - garantir que o nome está correto
        const clienteComNomeCorreto = {
          ...cliente,
          name: cliente.name || cliente.nome || "",
          nome: cliente.nome || cliente.name || "",
        };
        const novos = [...c, clienteComNomeCorreto];
        // SEMPRE definir como autor por padrão
        if (novos.length === 1) {
          // Primeiro cliente sempre como autor
          setPoloClientes({ [cliente.id]: "autor" });
        } else if (novos.length > 1) {
          // Manter polos existentes e adicionar novo como autor
          const novosPolos: { [id: number]: "autor" | "reu" } = {
            ...poloClientes,
          };
          novosPolos[cliente.id] = "autor"; // Novo cliente sempre como autor
          setPoloClientes(novosPolos);
        }
        return novos;
      }
    });
  }

  // Alterar polo do cliente
  function setPoloCliente(id: number, polo: "autor" | "reu") {
    // Definir polo individual para o cliente específico
    const novosPolos: { [id: number]: "autor" | "reu" } = { ...poloClientes };
    novosPolos[id] = polo;
    setPoloClientes(novosPolos);
  }

  // Função para obter o polo oposto (para parte adversa)
  function getPoloOposto(polo: "autor" | "reu"): "autor" | "reu" {
    return polo === "autor" ? "reu" : "autor";
  }

  // Excluir cliente completamente (da lista de clientes disponíveis)
  function excluirCliente(cliente: any) {
    const nomeCliente = cliente.name || cliente.nome || "Cliente";
    if (!window.confirm(`Excluir cliente ${nomeCliente} permanentemente?`))
      return;
    const atualizados = clientesDisponiveis.filter((c) => c.id !== cliente.id);
    setClientesDisponiveis(atualizados);
    setClientes((cs) => cs.filter((c) => c.id !== cliente.id));
    toast({ title: "Cliente excluído", description: nomeCliente });
  }

  // Remover cliente da seleção (apenas da peça atual)
  function removerClienteDaPeca(cliente: any) {
    setClientes((cs) => cs.filter((c) => c.id !== cliente.id));
    // Remove também o polo do cliente
    const novoPolo = { ...poloClientes };
    delete novoPolo[cliente.id];
    setPoloClientes(novoPolo);
    toast({
      title: "Cliente removido",
      description: "Cliente removido da peça atual",
    });
  }

  // Toolbar do Quill
  const toolbarOptions = [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ];

  // Montagem do prompt detalhado (parte adversa opcional)
  function montarPromptIA() {
    // Obter dados do advogado das configurações
    const [officeConfig, setOfficeConfig] = useState<any>({});

    // Carregar configurações do escritório
    useEffect(() => {
      const loadOfficeConfig = async () => {
        try {
          const config = await getOfficeConfig();
          setOfficeConfig(config);
        } catch (error) {
          console.error("Erro ao carregar configurações do escritório:", error);
          // Fallback para configurações padrão
          setOfficeConfig({
            lawyerName: "Advogado",
            oabNumber: "000000",
            oabState: "SP",
            officeAddress: "Endereço do Escritório",
            officePhone: "(11) 0000-0000",
            officeEmail: "advogado@escritorio.com",
            officeName: "Escritório de Advocacia",
          });
        }
      };
      loadOfficeConfig();
    }, []);

    let parteAdversaCampos = "";
    if (
      partesRe.length > 0 &&
      partesRe.some(
        (p) =>
          p.nome || p.tipo || p.cpfCnpj || p.endereco || p.email || p.profissao
      )
    ) {
      parteAdversaCampos = partesRe
        .map((parte, idx) =>
          [
            parte.nome && `Nome: ${parte.nome}`,
            parte.tipo && `Tipo: ${parte.tipo}`,
            parte.cpfCnpj && `CPF/CNPJ: ${parte.cpfCnpj}`,
            parte.rg && `RG: ${parte.rg}`,
            parte.birthDate && `Data de Nascimento: ${parte.birthDate}`,
            parte.maritalStatus && `Estado Civil: ${parte.maritalStatus}`,
            parte.nationality && `Nacionalidade: ${parte.nationality}`,
            parte.profissao && `Profissão: ${parte.profissao}`,
            parte.phone && `Telefone: ${parte.phone}`,
            parte.email && `E-mail: ${parte.email}`,
            parte.cep && `CEP: ${parte.cep}`,
            parte.street &&
              `Endereço Completo: ${parte.street}, ${parte.number || ""} - ${
                parte.complement || ""
              }`,
            parte.neighborhood && `Bairro: ${parte.neighborhood}`,
            parte.city && `Cidade: ${parte.city}`,
            parte.state && `Estado: ${parte.state}`,
            parte.observations && `Observações: ${parte.observations}`,
          ]
            .filter(Boolean)
            .join("\n")
        )
        .join("\n---\n");
    } else {
      parteAdversaCampos =
        "(Se não informado, gere um texto genérico para a parte adversa ou infira dos fatos)";
    }

    return `# PROMPT NIVELADOR - GERADOR DE PETIÇÕES JURÍDICAS

## INSTRUÇÃO PRINCIPAL
Você é um advogado especialista em redação de petições jurídicas. Sua função é gerar petições completas, tecnicamente corretas e bem fundamentadas, utilizando storytelling persuasivo e linguagem formal moderada como um advogado especialista.

## DADOS DO ADVOGADO (OBRIGATÓRIO - USE NA ASSINATURA)
Nome do Advogado: ${officeConfig.lawyerName}
Número OAB: ${officeConfig.oabNumber}
Estado OAB: ${officeConfig.oabState}
Endereço do Escritório: ${officeConfig.officeAddress}
Telefone do Escritório: ${officeConfig.officePhone}
E-mail do Escritório: ${officeConfig.officeEmail}
Nome do Escritório: ${officeConfig.officeName || officeConfig.officeAddress}

## DADOS DO CASO (USE OBRIGATORIAMENTE TODOS PARA QUALIFICAR AS PARTES)

Área do Direito: ${areaSelecionada || "(não informada)"}
Tipo de Peça: ${pecaSelecionada?.nome || "(não informada)"}
Descrição da Peça: ${pecaSelecionada?.desc || "(não informada)"}

Partes do processo:
${clientes
  .map(
    (c, i) =>
      `Parte ${i + 1}:
Nome: ${c.name}
CPF: ${c.cpf || ""}
RG: ${c.rg || ""}
Data de Nascimento: ${c.birthDate || ""}
Estado Civil: ${c.estadoCivil || c.maritalStatus || ""}
Nacionalidade: ${c.nationality || "Brasileira"}
Profissão: ${c.profissao || ""}
Telefone: ${c.phone || ""}
E-mail: ${c.email || ""}
CEP: ${c.cep || ""}
Endereço Completo: ${c.street || ""}, ${c.number || ""} - ${c.complement || ""}
Bairro: ${c.neighborhood || ""}
Cidade: ${c.city || ""}
Estado: ${c.state || ""}
Observações: ${c.observations || ""}
Polo: ${poloClientes[c.id] === "reu" ? "Réu" : "Autor"}`
  )
  .join("\n---\n")}

Parte adversa:
${parteAdversaCampos}

Tópicos Preliminares Selecionados: ${
      topicos && topicos.length ? topicos.join(", ") : "(nenhum)"
    }

Fatos do caso (cronológicos e objetivos):
${fatos || "(não informado)"}

Teses jurídicas selecionadas:
${teses && teses.length ? teses.join(", ") : "(nenhuma)"}

Jurisprudências selecionadas:
${juris && juris.length ? juris.join(", ") : "(nenhuma)"}

**ATENÇÃO: As teses e jurisprudências acima DEVEM ser usadas obrigatoriamente na fundamentação da petição. NÃO ignore estas informações.**

Pedidos Específicos:
${pedidosEspecificos || "(nenhum)"}

Atenção: utilize obrigatoriamente todos os dados fornecidos acima para qualificar as partes na petição, sem omitir nenhum campo disponível.

**IMPORTANTE:**
- Não utilize títulos em Markdown (como #, ##, ###) em nenhuma parte da petição.
- Não inicie a petição com o tipo da ação como título isolado.
- A petição deve começar diretamente pelo endereçamento tradicional ("EXCELENTÍSSIMO(A) SENHOR(A)..."), com títulos e endereçamento em negrito e caixa alta, conforme o exemplo.
- **NÃO inclua observações, recomendações, notas finais, comentários extras ou instruções ao final da resposta. A resposta deve ser apenas a petição pronta para protocolo, sem qualquer texto adicional.**
- **OBRIGATORIAMENTE use os dados do advogado fornecidos acima na assinatura da petição.**
- **Use TODOS os dados do processo fornecidos (número, vara, comarca, valor da causa)**
- **Se algum dado estiver marcado como "(não informado)", use um valor razoável ou deixe em branco**
- **OBRIGATORIAMENTE use TODAS as teses e jurisprudências fornecidas na fundamentação**
- **NÃO deixe a seção "DO DIREITO" vazia ou com observações**
- **CRÍTICO: Se houver teses e jurisprudências fornecidas, USE-AS OBRIGATORIAMENTE na seção "DO DIREITO"**
- **CRÍTICO: NÃO deixe a seção "DO DIREITO" vazia ou com observações sobre falta de teses**

## ELEMENTOS OBRIGATÓRIOS DA PETIÇÃO

### 1. CABEÇALHO
- Nome completo da autoridade judiciária (Juiz, Desembargador, etc.)
- Vara/Tribunal competente
- Comarca/Cidade

### 2. QUALIFICAÇÃO DAS PARTES
**REQUERENTE/AUTOR:**
- Nome completo
- Nacionalidade, estado civil, profissão
- RG e CPF
- Endereço completo
- Representação por advogado (OAB)

**REQUERIDO/RÉU (quando aplicável):**
- Qualificação completa conforme dados disponíveis

### 3. ESTRUTURA FORMAL
1. **PREÂMBULO** - Identificação das partes e pedido de citação
2. **DOS FATOS** - Narrativa cronológica e objetiva com storytelling persuasivo
3. **DO DIREITO** - Fundamentação jurídica com citação de leis e jurisprudência
4. **DOS PEDIDOS** - Pedidos específicos e claros
5. **VALOR DA CAUSA** - Quando aplicável
6. **REQUERIMENTOS FINAIS** - Citação, procedência, custas
7. **PROTESTA** - Por todos os meios de prova
8. **LOCAL E DATA**
9. **ASSINATURA** - **OBRIGATORIAMENTE usar os dados do advogado fornecidos**

## REGRAS DE REDAÇÃO E STORYTELLING

### LINGUAGEM JURÍDICA PERSUASIVA
- Use linguagem técnica apropriada, mas clara e persuasiva
- Evite arcaísmos desnecessários
- Mantenha formalidade adequada ao contexto judicial
- Use terceira pessoa do singular
- **Coloque todos os títulos e o endereçamento da petição em negrito e caixa alta**
- **Utilize storytelling persuasivo para conectar fatos e argumentos**

### NARRATIVA DOS FATOS (STORYTELLING)
- **Transforme os fatos em uma narrativa cronológica e persuasiva**
- **Conecte os fatos de forma lógica, criando uma história coerente**
- **Destaque os pontos favoráveis ao seu cliente**
- **Use transições suaves entre os eventos**
- **Mantenha objetividade, mas com tom persuasivo**

### ESTRUTURAÇÃO DE TESES E PRELIMINARES
**REGRAS OBRIGATÓRIAS:**
1. **Para cada tese jurídica ou preliminar, crie um subtítulo específico**
2. **Cada subtítulo deve ter pelo menos 5 parágrafos de desenvolvimento**
3. **Estrutura de cada tese/preliminar:**
   - **1º parágrafo:** Introdução da tese e sua relevância
   - **2º parágrafo:** Fundamentação legal (artigos, leis)
   - **3º parágrafo:** Aplicação dos fatos à norma
   - **4º parágrafo:** Jurisprudência aplicável (se houver) - **INTEGRE NATURALMENTE**
   - **5º parágrafo:** Conclusão da tese e sua importância para o caso

4. **INTEGRAÇÃO DE JURISPRUDÊNCIAS:**
   - **NÃO crie tópico separado para jurisprudências**
   - **Incorpore as jurisprudências naturalmente dentro das teses relevantes**
   - **Cite a jurisprudência completa quando aplicável ao argumento**
   - **Após cada citação, explique como ela se aplica ao caso concreto**
   - **Use transições naturais para conectar jurisprudência e argumento**

### FUNDAMENTAÇÃO LEGAL
- Cite artigos específicos das leis aplicáveis
- Referencie jurisprudência quando relevante
- Mencione súmulas aplicáveis
- Inclua doutrina quando necessário
- **SEMPRE explique a aplicação da norma ao caso concreto**

### FORMATAÇÃO DE TÍTULOS E SUBTÍTULOS
- **Todos os títulos principais (DOS FATOS, DO DIREITO, DOS PEDIDOS) devem estar em NEGRITO e CAIXA ALTA**
- **Todos os subtítulos de teses/preliminares devem estar numerados e em NEGRITO**
- **Exemplo de formatação:**
  '**1. RESPONSABILIDADE OBJETIVA DO FORNECEDOR**'
  '**2. DANO MORAL EM RELAÇÕES DE CONSUMO**'
  '**3. INVERSÃO DO ÔNUS DA PROVA**'
- **Use numeração sequencial (1, 2, 3...) para todas as teses/preliminares**
- **Mantenha consistência na numeração em toda a petição**

### FORMATAÇÃO DE JURISPRUDÊNCIA E CITAÇÕES
- **Toda citação de jurisprudência ou citação doutrinária deve ser iniciada por > (sinal de maior) SEM espaço, diretamente seguido do texto.**
- **Exemplo de jurisprudência:**
  '>STJ, REsp 1234567/DF, Rel. Min. João Silva, 3ª Turma, DJe 15/03/2024: "Texto da jurisprudência aqui."'
- **Exemplo de citação doutrinária:**
  '>Maria Helena Diniz, Curso de Direito Civil Brasileiro, 2020, p. 123: "A responsabilidade civil é..."'
- **Sempre inclua tribunal, número do processo, relator, turma/câmara e data nas jurisprudências.**
- **Use aspas duplas para destacar o texto citado.**
- **Todas as linhas iniciadas por > serão formatadas com recuo e tamanho de fonte próprios para citações/jurisprudências no documento final.**
- **OBRIGATORIAMENTE, após cada jurisprudência, inclua um parágrafo de fechamento explicando sua aplicação ao caso.**

### PEDIDOS
- Formule pedidos de forma clara e específica
- Inclua pedido principal e subsidiários quando aplicável
- Especifique valores quando monetários
- Inclua pedidos de tutela de urgência se necessário

## TIPOS DE PETIÇÃO SUPORTADOS
- Petição Inicial (Ação)
- Contestação
- Tréplica
- Recursos (Apelação, Agravo, etc.)
- Embargos
- Petições intermediárias
- Execução
- Cumprimento de sentença

## FORMATAÇÃO DE SAÍDA

EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [VARA] DE [COMARCA]

[NOME DO REQUERENTE], [qualificação completa], por seu advogado que ao final subscreve (procuração anexa), vem, respeitosamente, à presença de Vossa Excelência, propor

[TIPO DA AÇÃO]

contra [NOME DO REQUERIDO], [qualificação], pelos fatos e fundamentos jurídicos a seguir expostos:

DOS FATOS
[Narrativa cronológica e persuasiva dos fatos, utilizando storytelling para conectar os eventos de forma lógica e favorável ao cliente]

DO DIREITO

[Para cada tese ou preliminar, criar subtítulo numerado e desenvolver com pelo menos 5 parágrafos]

**1. [SUBTÍTULO DA PRIMEIRA TESE]**
[1º parágrafo: Introdução da tese e sua relevância]
[2º parágrafo: Fundamentação legal com artigos e leis]
[3º parágrafo: Aplicação dos fatos à norma]
[4º parágrafo: Jurisprudência aplicável (se houver)]
[5º parágrafo: Conclusão da tese e sua importância]

[Se houver jurisprudência no 4º parágrafo, incluir parágrafo de fechamento explicando sua aplicação ao caso]

**2. [SUBTÍTULO DA SEGUNDA TESE]**
[Desenvolver com a mesma estrutura de 5 parágrafos + fechamento se houver jurisprudência]

[Continuar para todas as teses selecionadas com numeração sequencial]

DOS PEDIDOS
[Pedidos específicos e claros]

Dá-se à causa o valor de R$ [valor].

Nestes termos,
Pede deferimento.

[Local], [data].

_______________________
${officeConfig.lawyerName}
OAB/${officeConfig.oabState} nº ${officeConfig.oabNumber}

## INSTRUÇÕES ESPECÍFICAS

### QUANDO RECEBER OS DADOS DO CLIENTE:
1. Analise cuidadosamente todas as informações fornecidas
2. Identifique o tipo de ação mais adequado
3. Verifique a competência do juízo
4. Determine os fundamentos legais aplicáveis
5. **Transforme os fatos em narrativa persuasiva com storytelling**
6. **Estruture cada tese com subtítulo e pelo menos 5 parágrafos**
7. **Garanta parágrafos de fechamento após cada jurisprudência**
8. Formule pedidos compatíveis com os fatos e direito
9. Calcule ou estime o valor da causa quando aplicável

### VERIFICAÇÕES OBRIGATÓRIAS:
- ✅ Todos os dados pessoais estão completos
- ✅ Fundamentação legal está correta e atualizada
- ✅ **Cada tese tem subtítulo numerado e pelo menos 5 parágrafos**
- ✅ **Todos os títulos principais estão em NEGRITO e CAIXA ALTA**
- ✅ **Todos os subtítulos de teses estão numerados e em NEGRITO**
- ✅ **Após cada jurisprudência há parágrafo de fechamento**
- ✅ **Narrativa dos fatos usa storytelling persuasivo**
- ✅ Pedidos são juridicamente possíveis
- ✅ Competência do juízo está adequada
- ✅ Valor da causa está correto
- ✅ Linguagem está apropriada e persuasiva
- ✅ Estrutura formal está completa
- ✅ **Dados do advogado estão incluídos na assinatura**

### EM CASO DE DADOS INSUFICIENTES:
Solicite as informações faltantes especificando:
- Qual informação é necessária
- Por que é obrigatória para a petição
- Como isso afetará o resultado final

## OBSERVAÇÕES IMPORTANTES

1. **SEMPRE** verifique a legislação aplicável
2. **NUNCA** invente fatos não fornecidos
3. **SEMPRE** mantenha coerência entre fatos, direito e pedidos
4. **CONSIDERE** prazos processuais nas orientações
5. **INCLUA** todos os elementos formais obrigatórios
6. **ADAPTE** a linguagem ao tipo de ação e instância
7. **OBRIGATORIAMENTE** use os dados do advogado na assinatura
8. **GARANTA** storytelling persuasivo na narrativa dos fatos
9. **ESTRUTURE** cada tese com subtítulo numerado e pelo menos 5 parágrafos
10. **INCLUA** parágrafo de fechamento após cada jurisprudência
11. **FORMATE** todos os títulos principais em NEGRITO e CAIXA ALTA
12. **NUMERE** todos os subtítulos de teses em sequência (1, 2, 3...)

## EXEMPLO DE RESPOSTA ESPERADA

Ao receber os dados do cliente, você deve:
1. Confirmar o recebimento das informações
2. Identificar o tipo de petição necessária
3. **Criar narrativa persuasiva dos fatos com storytelling**
4. **Estruturar cada tese com subtítulo e desenvolvimento adequado**
5. **Garantir parágrafos de fechamento após jurisprudências**
6. Gerar a petição completa seguindo a estrutura formal
7. Incluir observações sobre documentos necessários
8. Alertar sobre prazos se aplicável

**LEMBRE-SE:** Sua resposta deve ser uma petição juridicamente sólida, tecnicamente correta, formalmente adequada para protocolo em juízo, com storytelling persuasivo, estruturação adequada de teses e parágrafos de fechamento, com a assinatura do advogado corretamente incluída.`;
  }

  async function gerarPecaIA() {
    const prompt = montarPromptIA();
    const startTime = Date.now(); // Registrar tempo de início
    setGerando(true);
    setProgresso(5);
    setLogs(["Iniciando geração..."]);

    // Função para atualizar progresso de forma suave
    const updateProgress = (target: number, duration: number = 1000) => {
      const start = progresso;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (target - start) * progress;

        setProgresso(Math.round(current));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    try {
      // Fase 1: Preparação (5% -> 15%)
      updateProgress(15, 800);
      setLogs((l) => [...l, "Preparando dados do caso..."]);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Fase 2: Análise (15% -> 35%)
      updateProgress(35, 1200);
      setLogs((l) => [...l, "Analisando fatos e fundamentos..."]);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Fase 3: Envio para IA (35% -> 60%)
      updateProgress(60, 1000);
      setLogs((l) => [...l, "Enviando para IA..."]);

      let resposta = "";
      if (modeloIA === "gemini") {
        resposta = await askGemini(prompt);
        // Pós-processamento para remover Markdown
        resposta = resposta
          .replace(/\*\*(.*?)\*\*/g, "$1") // remove **negrito**
          .replace(/\*(.*?)\*/g, "$1") // remove *itálico*
          .replace(/__(.*?)__/g, "$1") // remove __sublinhado__
          .replace(/^#+\s?(.*)$/gm, "$1") // remove # títulos
          .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // remove links markdown
          .replace(/`([^`]+)`/g, "$1") // remove `código`
          .replace(/^-\s+/gm, "") // remove bullets
          .replace(/\s+$/gm, "") // remove espaços à direita
          .replace(/\n{3,}/g, "\n\n"); // normaliza múltiplas quebras de linha
      } else {
        resposta = await askDeepSeek(prompt);
      }

      // Fase 4: Processamento da resposta (60% -> 85%)
      updateProgress(85, 800);
      setLogs((l) => [...l, "Processando resposta da IA..."]);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Fase 5: Finalização (85% -> 100%)
      updateProgress(100, 600);
      setLogs((l) => [...l, "Finalizando documento..."]);
      await new Promise((resolve) => setTimeout(resolve, 600));

      setLogs((l) => [...l, "Peça gerada com sucesso! ✨"]);
      setTextoFinal(resposta);

      // Registrar métricas de uso
      const tempoCriacao = Math.round((Date.now() - startTime) / 1000 / 60); // em minutos
      const tipoPeca = pecaSelecionada?.nome || "Peça Jurídica";
      const areaDireito = areaSelecionada || "Geral";

      MetricsService.registerPecaGerada(tipoPeca, tempoCriacao, areaDireito);

      // Registrar atividade para gamificação
      const newAchievements = AchievementsService.registerActivity(
        "piece_generated",
        {
          tipo: tipoPeca,
          area: areaDireito,
          tempo: tempoCriacao,
        }
      );

      // Mostrar notificações de conquistas desbloqueadas
      newAchievements.forEach((achievement) => {
        addNotification(achievement);
        // Auto-remover após 5 segundos
        setTimeout(() => removeNotification(achievement.id), 5000);
      });

      // Efeito de confete visual
      toast({
        title: "🎉 Peça gerada com sucesso!",
        description: "Sua petição jurídica está pronta para uso.",
      });
    } catch (err) {
      setProgresso(100);
      setLogs((l) => [...l, "❌ Erro ao gerar peça com IA."]);
      toast({ title: "Erro", description: "Não foi possível gerar a peça." });
    } finally {
      setGerando(false);
      setTimeout(() => setProgresso(0), 2000);
    }
  }

  // Função para converter textoFinal em HTML formatado
  function gerarHtmlFormatado(texto: string) {
    if (!texto) return "";
    const lines = texto.split("\n");
    let html = [];
    let chapterCount = 0;
    let subChapterCount = 0;
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
      if (!line) continue;
      // Endereçamento
      if (line.match(/^EXCELENT[ÍI]SSIMO/i)) {
        html.push(
          `<p style='text-align:center;margin:0;font-weight:bold;text-indent:0;'>${line}</p>`
        );
        continue;
      }
      // Nome da ação (após qualificação, geralmente em maiúsculas, centralizado)
      if (
        line.match(/^[A-ZÇÃÕÁÉÍÓÚÂÊÎÔÛ ]{8,}$/) &&
        i > enderecamentoIndex &&
        (dosFatosIndex === -1 || i < dosFatosIndex)
      ) {
        html.push(
          `<p style='text-align:center;margin:0;font-weight:bold;text-indent:0;'>${line}</p>`
        );
        continue;
      }
      // Títulos de seção
      const isTitleSection =
        line.match(/^[IVX]+\s*–\s*[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) ||
        line.match(/^DOS?\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) ||
        (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) &&
          line.length > 3 &&
          line.length < 50);
      if (isTitleSection) {
        chapterCount++;
        subChapterCount = 0;
        const cleanLine = line.replace(/^[IVX]+\s*–\s*/, "");
        html.push(
          `<p style='margin:0;font-weight:bold;text-indent:0;'>${cleanLine}</p>`
        );
        continue;
      }
      // Citações
      if (line.startsWith(">")) {
        html.push(
          `<p style='margin:0.5em 0;text-align:justify;padding-left:4cm;font-size:10pt;'>${line
            .substring(1)
            .trim()}</p>`
        );
        continue;
      }
      // Qualificação (entre endereçamento e DOS FATOS)
      if (
        enderecamentoIndex !== -1 &&
        dosFatosIndex !== -1 &&
        i > enderecamentoIndex &&
        i < dosFatosIndex
      ) {
        html.push(`<p style='margin:0;text-indent:0;'>${line}</p>`);
        continue;
      }
      // Parágrafos normais
      html.push(
        `<p style='margin:0.5em 0;text-align:justify;text-indent:1.25cm;'>${line}</p>`
      );
    }
    return html.join("\n");
  }

  // @ts-ignore
  function filtrarTopicos(arr) {
    return arr.filter((t) =>
      t.toLowerCase().includes(buscaTopico.toLowerCase())
    );
  }

  return (
    <>
      {/* Overlay de loading global */}
      {analisandoTeses && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(245, 247, 255, 0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}>
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: "18px",
              boxShadow: "0 0 24px 2px #7ef9ff55",
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "320px",
            }}>
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4 shadow-neon" />
            <span className="text-blue-700 font-semibold text-lg text-center">
              Analisando fatos e gerando sugestões...
            </span>
          </div>
        </div>
      )}
      {/* Conteúdo original do Editor */}
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <PageHeader
          title="Peças Jurídicas AI"
          subtitle="Crie peças jurídicas inteligentes em etapas, com apoio de IA e sugestões contextuais."
          icon={<FileText className="w-7 h-7 text-white" />}
        />
        {/* Seletor de modelo de IA */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-aiudex border-2 border-blue-200/30">
              <label className="font-semibold text-sm text-blue-700">
                Modelo de IA:
              </label>
              <select
                value={modeloIA}
                onChange={(e) =>
                  setModeloIA(e.target.value as "gemini" | "deepseek")
                }
                className="border-0 bg-transparent text-sm font-bold text-gradient-aiudex focus:outline-none focus:ring-0 cursor-pointer">
                <option value="gemini">🤖 Gemini (Google)</option>
                <option value="deepseek">⚡ DeepSeek (Local)</option>
              </select>
            </div>
          </div>
        </div>
        {/* Abas de etapas */}
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-aiudex border-2 border-blue-200/30">
            <div className="flex items-center justify-center gap-0">
              {ETAPAS.map((e, idx) => (
                <div key={e.label} className="flex items-center">
                  <button
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 relative min-h-[48px] whitespace-nowrap
                  ${
                    Number(idx) <= Number(etapa)
                      ? "bg-gradient-aiudex text-white shadow-aiudex-lg transform scale-105"
                      : "bg-transparent text-blue-600 hover:text-blue-800 hover:bg-blue-50/50"
                  }
                  ${
                    Number(idx) > Number(etapa)
                      ? "opacity-50 pointer-events-none"
                      : "cursor-pointer"
                  }
                `}
                    onClick={() =>
                      Number(idx) <= Number(etapa) && setEtapa(idx)
                    }
                    tabIndex={Number(idx) > Number(etapa) ? -1 : 0}
                    aria-current={
                      Number(etapa) === Number(idx) ? "step" : undefined
                    }>
                    <div
                      className={`p-1 rounded-full ${
                        Number(idx) <= Number(etapa)
                          ? "bg-white/30"
                          : "bg-blue-100"
                      }`}>
                      {e.icon}
                    </div>
                    <span className="font-semibold whitespace-nowrap">
                      {e.label}
                    </span>
                    {Number(idx) === Number(etapa) && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-aiudex rounded-full shadow-aiudex"></div>
                    )}
                  </button>
                  {idx < ETAPAS.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                        Number(idx) < Number(etapa)
                          ? "bg-gradient-aiudex"
                          : "bg-blue-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-1 w-full mx-auto py-8">
          {/* Bloco principal da etapa */}
          <div className="flex-1 flex flex-col items-center justify-start px-4">
            <div className="w-full max-w-[1200px] bg-white/95 backdrop-blur-md rounded-3xl shadow-aiudex-xl border-2 border-blue-200/30 p-8 min-h-[700px] transition-all mx-auto hover:shadow-aiudex-xl">
              {/* Etapa 1: Cliente */}
              {etapa === 0 && (
                <div className="relative">
                  <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-aiudex-lg border-2 border-blue-200/30 hover:border-blue-400 transition-all duration-300 group mb-8">
                    <CardHeader className="flex items-center gap-4 pb-4">
                      <div className="w-14 h-14 bg-gradient-aiudex rounded-2xl flex items-center justify-center shadow-aiudex">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gradient-aiudex">
                          Cliente e Partes
                        </CardTitle>
                        <p className="text-blue-700 text-sm font-medium">
                          Selecione o cliente e adicione partes adversas
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Seção de seleção de clientes cadastrados - agora com Select de busca e múltipla seleção */}
                      <div className="mb-6">
                        <h3 className="font-bold text-blue-800 mb-3 text-lg">
                          Clientes cadastrados
                        </h3>
                        <Popover
                          open={openClientesPopover}
                          onOpenChange={setOpenClientesPopover}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-12 bg-blue-50/50 border-2 border-blue-200/50 hover:bg-white hover:border-blue-400 transition-all duration-300">
                              <span
                                className={
                                  clientes.length > 0
                                    ? "text-blue-900 font-semibold"
                                    : "text-blue-600"
                                }>
                                {clientes.length > 0
                                  ? `${clientes.length} cliente(s) selecionado(s)`
                                  : "Selecione clientes..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-blue-600" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[500px] p-0">
                            <div className="p-4">
                              <Command>
                                <CommandInput placeholder="Buscar cliente..." />
                                <CommandList>
                                  <CommandEmpty>
                                    Nenhum cliente encontrado.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {clientesDisponiveis.map((cliente) => (
                                      <CommandItem
                                        key={cliente.id}
                                        onSelect={() => {
                                          toggleCliente(cliente);
                                          setOpenClientesPopover(false); // Fecha o dropdown após selecionar
                                        }}
                                        className={
                                          clientes.some(
                                            (c) => c.id === cliente.id
                                          )
                                            ? "bg-blue-100 text-blue-800"
                                            : ""
                                        }>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div>
                                            <div className="font-medium text-sm">
                                              {cliente.name ||
                                                cliente.nome ||
                                                "Cliente sem nome"}
                                            </div>
                                            {cliente.email && (
                                              <div className="text-xs text-gray-500">
                                                {cliente.email}
                                              </div>
                                            )}
                                          </div>
                                          {clientes.some(
                                            (c) => c.id === cliente.id
                                          ) && (
                                            <Check className="w-4 h-4 text-green-600 ml-2" />
                                          )}
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {/* Seção de clientes manuais como Accordion - agora acima das partes adversas */}
                      <div className="mb-6">
                        <h3 className="font-bold text-blue-800 mb-3 text-lg">
                          Clientes cadastrados manualmente
                        </h3>
                        <Accordion
                          type="multiple"
                          className="mb-2"
                          value={clientesDisponiveis
                            .filter((c) => c.manual)
                            .map((c, idx) => `cliente-${c.id}`)}
                          onValueChange={() => {}}>
                          {clientesDisponiveis
                            .filter((c) => c.manual)
                            .map((cliente, idx, arr) => (
                              <AccordionItem
                                key={cliente.id}
                                value={`cliente-${cliente.id}`}
                                className="border-2 border-blue-200/50 rounded-xl mb-2 shadow-aiudex">
                                <AccordionTrigger className="flex items-center gap-2 px-4 py-3">
                                  <span className="font-bold text-gradient-aiudex">
                                    Cliente manual {idx + 1}
                                  </span>
                                  <span className="text-blue-600 ml-2 font-medium">
                                    {cliente.name || cliente.nome || "Sem nome"}
                                  </span>
                                  {(
                                    cliente.name ||
                                    cliente.nome ||
                                    ""
                                  ).trim() &&
                                    clientes.some(
                                      (c) => c.id === cliente.id
                                    ) && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-gradient-aiudex text-white text-xs shadow-aiudex">
                                        ✓ Usado na peça
                                      </Badge>
                                    )}
                                  <Button
                                    variant="ghost"
                                    className="ml-auto text-red-500 hover:bg-red-50 transition-all duration-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      excluirCliente(cliente);
                                    }}>
                                    Remover
                                  </Button>
                                </AccordionTrigger>
                                <AccordionContent className="animate-accordion-down">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                                    <Input
                                      placeholder="Nome"
                                      value={cliente.name || cliente.nome || ""}
                                      onChange={(e) => {
                                        const valor = e.target.value;
                                        const novos = [...clientesDisponiveis];
                                        const idx =
                                          clientesDisponiveis.findIndex(
                                            (c) => c.id === cliente.id
                                          );
                                        novos[idx] = {
                                          ...cliente,
                                          name: valor,
                                          nome: valor,
                                        };
                                        setClientesDisponiveis(novos);
                                        // Atualizar também o array de clientes selecionados, se necessário
                                        setClientes((prev) =>
                                          prev.map((c) =>
                                            c.id === cliente.id
                                              ? {
                                                  ...c,
                                                  name: valor,
                                                  nome: valor,
                                                }
                                              : c
                                          )
                                        );
                                      }}
                                    />
                                    <Input
                                      placeholder="E-mail"
                                      value={cliente.email || ""}
                                      onChange={(e) => {
                                        const novos = [...clientesDisponiveis];
                                        novos[
                                          clientesDisponiveis.findIndex(
                                            (c) => c.id === cliente.id
                                          )
                                        ] = {
                                          ...cliente,
                                          email: e.target.value,
                                        };
                                        setClientesDisponiveis(novos);
                                      }}
                                    />
                                    <Input
                                      placeholder="CPF"
                                      value={cliente.cpf || ""}
                                      onChange={(e) => {
                                        const novos = [...clientesDisponiveis];
                                        novos[
                                          clientesDisponiveis.findIndex(
                                            (c) => c.id === cliente.id
                                          )
                                        ] = { ...cliente, cpf: e.target.value };
                                        setClientesDisponiveis(novos);
                                      }}
                                    />
                                    <Input
                                      placeholder="Endereço"
                                      value={
                                        cliente.address ||
                                        cliente.endereco ||
                                        ""
                                      }
                                      onChange={(e) => {
                                        const novos = [...clientesDisponiveis];
                                        const valor = e.target.value;
                                        novos[
                                          clientesDisponiveis.findIndex(
                                            (c) => c.id === cliente.id
                                          )
                                        ] = {
                                          ...cliente,
                                          address: valor,
                                          endereco: valor,
                                        };
                                        setClientesDisponiveis(novos);
                                      }}
                                    />
                                  </div>
                                  {idx ===
                                    clientesDisponiveis.filter((c) => c.manual)
                                      .length -
                                      1 && (
                                    <Button
                                      className="mt-4 ml-4 rounded-full border border-green-300 text-green-700 bg-white hover:bg-green-50 transition-all"
                                      variant="outline"
                                      onClick={() => {
                                        const novo = {
                                          name: "",
                                          email: "",
                                          cpf: "",
                                          address: "",
                                          id: Date.now(),
                                          manual: true,
                                        };
                                        setClientesDisponiveis([
                                          ...clientesDisponiveis,
                                          novo,
                                        ]);
                                      }}>
                                      <span className="font-bold mr-2">+</span>
                                      Adicionar cliente manualmente
                                    </Button>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                        </Accordion>
                        {/* Botão de adicionar cliente manualmente - aparece apenas se não houver clientes manuais */}
                        {clientesDisponiveis.filter((c) => c.manual).length ===
                          0 && (
                          <div className="flex justify-center">
                            <Button
                              className="rounded-full border border-green-300 text-green-700 bg-white hover:bg-green-50 transition-all mt-2"
                              variant="outline"
                              onClick={() => {
                                const novo = {
                                  name: "",
                                  email: "",
                                  cpf: "",
                                  address: "",
                                  id: Date.now(),
                                  manual: true,
                                };
                                setClientesDisponiveis([
                                  ...clientesDisponiveis,
                                  novo,
                                ]);
                              }}>
                              <span className="font-bold mr-2">+</span>Adicionar
                              cliente manualmente
                            </Button>
                          </div>
                        )}
                      </div>
                      {/* Seção de clientes selecionados e polo */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Clientes selecionados
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {clientes
                            .filter(
                              (c) => !c.id.toString().startsWith("adverso-")
                            )
                            .map((cliente) => (
                              <div
                                key={cliente.id}
                                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 min-w-[120px]">
                                <span className="flex items-center gap-1 font-medium text-green-800 w-full justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  {cliente.name ||
                                    cliente.nome ||
                                    "Cliente sem nome"}
                                </span>
                                <Select
                                  value={poloClientes[cliente.id] || "autor"}
                                  onValueChange={(v) =>
                                    setPoloCliente(
                                      cliente.id,
                                      v as "autor" | "reu"
                                    )
                                  }>
                                  <SelectTrigger className="w-24 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="autor">Autor</SelectItem>
                                    <SelectItem value="reu">Réu</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-400"
                                  onClick={() => removerClienteDaPeca(cliente)}>
                                  ✕
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                      {/* Seção de partes adversas selecionadas */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Partes adversas selecionadas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {partesRe
                            .filter((p) => p.nome.trim())
                            .map((parte, idx) => {
                              // Determinar o polo da parte adversa baseado no polo do cliente
                              const poloCliente =
                                clientes.length > 0
                                  ? poloClientes[clientes[0]?.id] || "autor"
                                  : "autor";
                              const poloParteAdversa =
                                getPoloOposto(poloCliente);

                              return (
                                <div
                                  key={`parte-${idx}`}
                                  className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2">
                                  <span className="font-medium text-orange-800">
                                    {parte.nome}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      poloParteAdversa === "autor"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}>
                                    {poloParteAdversa === "autor"
                                      ? "Autor"
                                      : "Réu"}
                                  </Badge>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-400"
                                    onClick={() => {
                                      const novas = [...partesRe];
                                      novas[idx] = {
                                        nome: "",
                                        tipo: "Pessoa Física",
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
                                        nationality: "",
                                        observations: "",
                                      };
                                      setPartesRe(novas);
                                    }}>
                                    ✕
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      {/* Seção de partes adversas como Accordion */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Partes adversas
                        </h3>
                        <Accordion
                          type="multiple"
                          className="mb-2"
                          value={openPartesAccordion}
                          onValueChange={setOpenPartesAccordion}>
                          {partesRe.map((parte, idx) => (
                            <AccordionItem
                              key={idx}
                              value={`parte-${idx}`}
                              className="border border-orange-200 rounded-xl mb-2 bg-orange-50">
                              <AccordionTrigger className="font-semibold text-orange-700 ml-4 mr-4">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {`Parte adversa ${idx + 1}`}
                                    {parte.nome ? `: ${parte.nome}` : ""}
                                  </span>
                                  {parte.nome.trim() && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-orange-100 text-orange-700 text-xs">
                                      ✓ Usado na peça
                                    </Badge>
                                  )}
                                </div>
                                {partesRe.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    className="text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPartesRe(
                                        partesRe.filter((_, i) => i !== idx)
                                      );
                                      setOpenPartesAccordion((prev) =>
                                        prev.filter((v) => v !== `parte-${idx}`)
                                      );
                                    }}>
                                    Remover
                                  </Button>
                                )}
                              </AccordionTrigger>
                              <AccordionContent className="transition-all duration-300 ease-in-out">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                                  <Input
                                    placeholder="Nome"
                                    value={parte.nome}
                                    onChange={(e) => {
                                      const novas = [...partesRe];
                                      novas[idx].nome = e.target.value;
                                      setPartesRe(novas);
                                    }}
                                  />
                                  <Input
                                    placeholder="Tipo"
                                    value={parte.tipo}
                                    onChange={(e) => {
                                      const novas = [...partesRe];
                                      novas[idx].tipo = e.target.value;
                                      setPartesRe(novas);
                                    }}
                                  />
                                  <Input
                                    placeholder="CPF/CNPJ"
                                    value={parte.cpfCnpj}
                                    onChange={(e) => {
                                      const novas = [...partesRe];
                                      novas[idx].cpfCnpj = e.target.value;
                                      setPartesRe(novas);
                                    }}
                                  />
                                  <Input
                                    placeholder="Endereço"
                                    value={parte.endereco}
                                    onChange={(e) => {
                                      const novas = [...partesRe];
                                      novas[idx].endereco = e.target.value;
                                      setPartesRe(novas);
                                    }}
                                  />
                                  <Input
                                    placeholder="E-mail"
                                    value={parte.email}
                                    onChange={(e) => {
                                      const novas = [...partesRe];
                                      novas[idx].email = e.target.value;
                                      setPartesRe(novas);
                                    }}
                                  />
                                  <Input
                                    placeholder="Profissão"
                                    value={parte.profissao}
                                    onChange={(e) => {
                                      const novas = [...partesRe];
                                      novas[idx].profissao = e.target.value;
                                      setPartesRe(novas);
                                    }}
                                  />
                                </div>
                                {idx === partesRe.length - 1 && (
                                  <Button
                                    className="mt-4 ml-4 rounded-full border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-all"
                                    variant="outline"
                                    onClick={() => {
                                      setPartesRe([
                                        ...partesRe,
                                        {
                                          nome: "",
                                          tipo: "Pessoa Física",
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
                                          nationality: "",
                                          observations: "",
                                        },
                                      ]);
                                      setOpenPartesAccordion((prev) => [
                                        ...prev,
                                        `parte-${partesRe.length}`,
                                      ]);
                                    }}>
                                    <span className="font-bold mr-2">+</span>Há
                                    outra parte adversa?
                                  </Button>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                      {/* Botão principal premium */}
                      <Button
                        className="mt-6 w-full h-12 bg-gradient-aiudex text-white font-bold rounded-xl shadow-aiudex hover:shadow-aiudex-lg hover:scale-105 transition-all transform"
                        disabled={clientes.length === 0}
                        onClick={() => setEtapa(1)}>
                        Próximo
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Etapa 2: Área da Peça */}
              {etapa === 1 && (
                <div className="relative">
                  <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 hover:border-blue-300 transition-all duration-300 group mb-8">
                    <CardHeader className="flex items-center gap-4 pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <Gavel className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          Área e Tipo de Peça
                        </CardTitle>
                        <p className="text-gray-600 text-sm">
                          Escolha a área do direito e o tipo de peça jurídica
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Seção de seleção de áreas */}
                      <div className="flex flex-wrap gap-3 mb-8">
                        {AREAS_DIREITO.map((area) => (
                          <button
                            key={area}
                            type="button"
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition shadow-none border
                              ${
                                areaSelecionada === area
                                  ? "bg-gradient-to-br from-green-100 to-blue-100 text-blue-700 border-blue-200"
                                  : "bg-white text-gray-500 border border-gray-200 hover:text-blue-600 hover:bg-blue-50"
                              }
                              hover:scale-100 active:scale-100
                            `}
                            style={{ minWidth: 0 }}
                            onClick={() => {
                              setAreaSelecionada(area);
                              setPecaSelecionada(null);
                            }}>
                            {ICONES_AREAS[area]} {area}
                          </button>
                        ))}
                      </div>
                      {/* Seção de seleção de tipo de peça */}
                      {areaSelecionada && (
                        <>
                          <h3 className="text-lg font-semibold mb-2">
                            Tipo de Peça
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {pecaSelecionada ? (
                              <Card
                                key={pecaSelecionada.nome}
                                className="cursor-pointer border rounded-2xl bg-white text-blue-700 border-gray-200 transition-all duration-300 transform bg-gradient-to-br from-[#e6f7f4] to-[#eafaf1] text-blue-600 shadow">
                                <CardHeader className="pb-2 flex flex-row items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/40">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <CardTitle className="text-base font-bold break-words whitespace-normal text-blue-600">
                                    {pecaSelecionada.nome}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4">
                                  <p className="text-sm mb-4 min-h-[48px] text-blue-600">
                                    {pecaSelecionada.desc}
                                  </p>
                                  <Button
                                    className="w-full mt-2 rounded-lg border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-all"
                                    variant="outline"
                                    onClick={() => setPecaSelecionada(null)}>
                                    Desfazer seleção
                                  </Button>
                                </CardContent>
                              </Card>
                            ) : (
                              (PECAS_POR_AREA[areaSelecionada] || []).map(
                                (peca) => (
                                  <Card
                                    key={peca.nome}
                                    className="cursor-pointer border rounded-2xl bg-white text-blue-700 border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:-translate-y-1"
                                    onClick={() => setPecaSelecionada(peca)}>
                                    <CardHeader className="pb-2 flex flex-row items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                      </div>
                                      <CardTitle className="text-base font-bold break-words whitespace-normal text-blue-700">
                                        {peca.nome}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 pb-4">
                                      <p className="text-sm mb-4 min-h-[48px] text-gray-600">
                                        {peca.desc}
                                      </p>
                                      <Button
                                        className="w-full mt-2 rounded-lg bg-gradient-aiudex text-white font-bold shadow-aiudex border-0 py-3 text-base hover:shadow-aiudex-lg transition-all transform hover:scale-105"
                                        style={{ marginTop: "1rem" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPecaSelecionada(peca);
                                        }}>
                                        Selecionar
                                      </Button>
                                    </CardContent>
                                  </Card>
                                )
                              )
                            )}
                          </div>
                        </>
                      )}
                      {/* Botões de navegação */}
                      <div className="flex gap-4 mt-8">
                        <Button
                          className="rounded-full border-2 border-blue-300 text-blue-700 bg-white/90 backdrop-blur-sm hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1 shadow-aiudex transform hover:scale-105"
                          variant="outline"
                          onClick={() => setEtapa(0)}>
                          Voltar
                        </Button>
                        <Button
                          className="rounded-full bg-gradient-aiudex text-white font-bold shadow-aiudex hover:shadow-aiudex-lg transition-all text-lg py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1 transform hover:scale-105"
                          disabled={!areaSelecionada || !pecaSelecionada}
                          onClick={() => setEtapa(2)}>
                          Próximo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Etapa 3: Fatos e Tópicos Preliminares */}
              {etapa === 2 && (
                <div className="relative">
                  <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 hover:border-blue-300 transition-all duration-300 group mb-8">
                    <CardHeader className="flex items-center gap-4 pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <FileText className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          Fatos e Tópicos Preliminares
                        </CardTitle>
                        <p className="text-gray-600 text-sm">
                          Descreva os fatos do caso, pedidos específicos e
                          selecione tópicos preliminares
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <label className="block font-semibold text-gray-700 mb-2">
                        Descrição dos Fatos
                      </label>
                      <textarea
                        className="w-full min-h-[120px] max-h-60 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        maxLength={2000}
                        value={fatos}
                        onChange={(e) => setFatos(e.target.value)}
                        placeholder={exemploFatos}
                        autoFocus
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>
                          Dica: Seja objetivo e claro.{" "}
                          <span
                            className="underline cursor-pointer"
                            title="Exemplo de preenchimento">
                            Exemplo
                          </span>
                        </span>
                        <span>{fatos.length} / 2000</span>
                      </div>
                      {/* Caixa de Pedidos Específicos */}
                      <label className="block font-semibold text-gray-700 mb-2 mt-6">
                        Pedidos Específicos
                      </label>
                      <textarea
                        className="w-full min-h-[80px] max-h-40 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        maxLength={1000}
                        value={pedidosEspecificos}
                        onChange={(e) => setPedidosEspecificos(e.target.value)}
                        placeholder="Ex: Pedido de tutela de urgência, pedido de indenização, pedido de liminar, etc."
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1 mb-4">
                        <span>
                          Dica: Liste os pedidos principais e subsidiários, se
                          houver.
                        </span>
                        <span>{pedidosEspecificos.length} / 1000</span>
                      </div>
                      <Input
                        placeholder="Buscar tópico preliminar..."
                        value={buscaTopico}
                        onChange={(e) => setBuscaTopico(e.target.value)}
                        className="mb-4 w-full max-w-md"
                      />
                      <Accordion
                        type="single"
                        collapsible
                        defaultValue="comuns">
                        <AccordionItem value="comuns">
                          <AccordionTrigger className="font-semibold text-blue-700">
                            Pedidos Preliminares Comuns
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {filtrarTopicos(TOPICOS_PRELIMINARES_COMUNS).map(
                                (t) => (
                                  <Button
                                    key={t}
                                    size="sm"
                                    variant={
                                      topicos.includes(t)
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      setTopicos(
                                        topicos.includes(t)
                                          ? topicos.filter((x) => x !== t)
                                          : [...topicos, t]
                                      )
                                    }
                                    className={`rounded-full text-xs px-3 py-1 font-semibold border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${
                                      topicos.includes(t)
                                        ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow"
                                        : ""
                                    }`}>
                                    {t}{" "}
                                    {topicos.includes(t) && (
                                      <CheckCircle className="w-4 h-4 ml-1 text-green-200 inline" />
                                    )}
                                  </Button>
                                )
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="defesa">
                          <AccordionTrigger className="font-semibold text-orange-700">
                            Pedidos Preliminares em Defesas
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {filtrarTopicos(TOPICOS_PRELIMINARES_DEFESA).map(
                                (t) => (
                                  <Button
                                    key={t}
                                    size="sm"
                                    variant={
                                      topicos.includes(t)
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      setTopicos(
                                        topicos.includes(t)
                                          ? topicos.filter((x) => x !== t)
                                          : [...topicos, t]
                                      )
                                    }
                                    className={`rounded-full text-xs px-3 py-1 font-semibold border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
                                      topicos.includes(t)
                                        ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow"
                                        : ""
                                    }`}>
                                    {t}{" "}
                                    {topicos.includes(t) && (
                                      <CheckCircle className="w-4 h-4 ml-1 text-green-200 inline" />
                                    )}
                                  </Button>
                                )
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="especiais">
                          <AccordionTrigger className="font-semibold text-purple-700">
                            Pedidos Especiais / Casos Específicos
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {filtrarTopicos(
                                TOPICOS_PRELIMINARES_ESPECIAIS
                              ).map((t) => (
                                <Button
                                  key={t}
                                  size="sm"
                                  variant={
                                    topicos.includes(t) ? "default" : "outline"
                                  }
                                  onClick={() =>
                                    setTopicos(
                                      topicos.includes(t)
                                        ? topicos.filter((x) => x !== t)
                                        : [...topicos, t]
                                    )
                                  }
                                  className={`rounded-full text-xs px-3 py-1 font-semibold border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 ${
                                    topicos.includes(t)
                                      ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow"
                                      : ""
                                  }`}>
                                  {t}{" "}
                                  {topicos.includes(t) && (
                                    <CheckCircle className="w-4 h-4 ml-1 text-green-200 inline" />
                                  )}
                                </Button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      {/* Botões de navegação */}
                      <div className="flex gap-4 mt-8">
                        <Button
                          className="rounded-full border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1"
                          variant="outline"
                          onClick={() => setEtapa(1)}>
                          Voltar
                        </Button>
                        <Button
                          className="rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold shadow hover:from-blue-600 hover:to-green-600 transition-all text-lg py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1"
                          disabled={!fatos.trim() || topicos.length === 0}
                          onClick={() => setEtapa(3)}>
                          Próximo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Etapa 3: Dados do Processo */}
              {etapa === 3 && (
                <div className="relative">
                  <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 hover:border-blue-300 transition-all duration-300 group mb-8">
                    <CardHeader className="flex items-center gap-4 pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <FileText className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          Dados do Processo
                        </CardTitle>
                        <p className="text-gray-600 text-sm">
                          Preencha os dados do processo. Apenas o valor da causa
                          é obrigatório.
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Campos do processo */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                            Informações do Processo
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block font-medium text-gray-700 mb-2">
                                Número do Processo (CNJ)
                              </label>
                              <Input
                                placeholder="0000000-00.0000.0.00.0000"
                                value={numeroProcesso}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, "");
                                  if (value.length <= 20) {
                                    let formatted = "";
                                    for (let i = 0; i < value.length; i++) {
                                      if (i === 7) formatted += "-";
                                      else if (i === 9) formatted += ".";
                                      else if (i === 13) formatted += ".";
                                      else if (i === 14) formatted += ".";
                                      else if (i === 16) formatted += ".";
                                      else if (i === 20) formatted += ".";
                                      formatted += value[i];
                                    }
                                    setNumeroProcesso(formatted);
                                  }
                                }}
                                maxLength={25}
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-gray-700 mb-2">
                                Vara/Juízo
                              </label>
                              <Input
                                placeholder="Ex: 1ª Vara Cível de São Paulo"
                                value={varaJuizo}
                                onChange={(e) => setVaraJuizo(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-gray-700 mb-2">
                                Comarca/Seção Judiciária
                              </label>
                              <Input
                                placeholder="Ex: São Paulo/SP"
                                value={comarca}
                                onChange={(e) => setComarca(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-gray-700 mb-2">
                                Valor da Causa *
                              </label>
                              <Input
                                placeholder="R$ 0,00"
                                value={valorCausa}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, "");
                                  if (value.length <= 12) {
                                    const number = parseInt(value) / 100;
                                    const formatted = new Intl.NumberFormat(
                                      "pt-BR",
                                      {
                                        style: "currency",
                                        currency: "BRL",
                                      }
                                    ).format(number);
                                    setValorCausa(formatted);
                                  }
                                }}
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Apenas números (será formatado automaticamente)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <Button
                          className="rounded-full border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1"
                          variant="outline"
                          onClick={() => setEtapa(2)}>
                          Voltar
                        </Button>
                        <Button
                          className="rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold shadow hover:from-blue-600 hover:to-green-600 transition-all text-lg py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1"
                          disabled={!valorCausa.trim()}
                          onClick={() => setEtapa(4)}>
                          Próximo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Etapa 4: Teses/Jurisprudências */}
              {etapa === 4 && (
                <div className="relative">
                  <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 hover:border-blue-300 transition-all duration-300 group mb-8">
                    <CardHeader className="flex items-center gap-4 pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          Teses e Jurisprudências
                        </CardTitle>
                        <p className="text-gray-600 text-sm">
                          Selecione as teses jurídicas e jurisprudências
                          relevantes para o caso
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Seção de Teses */}
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800 text-lg">
                              Teses Jurídicas
                            </h3>
                            {fatos.trim() && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                onClick={analisarFatosParaTeses}
                                disabled={analisandoTeses}>
                                {analisandoTeses ? (
                                  <>
                                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Analisando...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-2" />
                                    Reanalisar
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          {/* Campo para adicionar tese manualmente */}
                          <div className="mb-4">
                            <label className="block font-medium text-gray-700 mb-2">
                              Adicionar Tese Personalizada
                            </label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Ex: Aplicação do princípio da boa-fé objetiva..."
                                value={novaTese}
                                onChange={(e) => setNovaTese(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600"
                                onClick={() => {
                                  if (novaTese.trim()) {
                                    setTeses([...teses, novaTese.trim()]);
                                    setNovaTese("");
                                  }
                                }}
                                disabled={!novaTese.trim()}>
                                Adicionar
                              </Button>
                            </div>
                          </div>

                          {/* Teses adicionadas */}
                          {teses.length > 0 && (
                            <div className="mb-4">
                              <label className="block font-medium text-gray-700 mb-2">
                                Teses Selecionadas ({teses.length})
                              </label>
                              <div className="space-y-2">
                                {teses.map((tese, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-blue-800 flex-1">
                                      {tese}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:bg-red-50"
                                      onClick={() =>
                                        setTeses(
                                          teses.filter((_, i) => i !== index)
                                        )
                                      }>
                                      ✕
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sugestões da IA */}
                          {analisandoTeses && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-blue-600 font-medium">
                                  Analisando fatos e gerando sugestões...
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Sugestões da IA */}
                          {sugestoesTesesIA.length > 0 && (
                            <div className="mb-4">
                              <label className="block font-medium text-gray-700 mb-2">
                                Sugestões da IA ({sugestoesTesesIA.length})
                              </label>
                              <div
                                className="flex gap-2 mb-4 flex-wrap overflow-x-auto"
                                style={{ maxWidth: "100%", width: "100%" }}>
                                <TooltipProvider>
                                  {sugestoesTesesIA.map((t) => (
                                    <Tooltip key={t}>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 max-w-full truncate ${
                                            teses.includes(t)
                                              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow hover:from-purple-600 hover:to-blue-600"
                                              : "border border-purple-300 text-purple-700 bg-white hover:bg-purple-50"
                                          }`}
                                          style={{ maxWidth: "100%" }}
                                          onClick={() =>
                                            teses.includes(t)
                                              ? setTeses(
                                                  teses.filter((x) => x !== t)
                                                )
                                              : setTeses([...teses, t])
                                          }>
                                          <span className="truncate max-w-[220px] block">
                                            {t}
                                          </span>
                                          {teses.includes(t) && (
                                            <CheckCircle className="w-4 h-4 ml-1 text-purple-200 inline" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="max-w-xs break-words">
                                        {t}
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                </TooltipProvider>
                              </div>
                            </div>
                          )}

                          {/* Sugestões padrão */}
                          <div>
                            <label className="block font-medium text-gray-700 mb-2">
                              Sugestões Gerais
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {sugestoesTeses.map((t) => (
                                <Button
                                  key={t}
                                  size="sm"
                                  className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${
                                    teses.includes(t)
                                      ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow hover:from-blue-600 hover:to-green-600"
                                      : "border border-blue-300 text-blue-700 bg-white hover:bg-blue-50"
                                  }`}
                                  onClick={() =>
                                    teses.includes(t)
                                      ? setTeses(teses.filter((x) => x !== t))
                                      : setTeses([...teses, t])
                                  }>
                                  {t}
                                  {teses.includes(t) && (
                                    <CheckCircle className="w-4 h-4 ml-1 text-green-200 inline" />
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Seção de Exemplo/Template */}
                        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-800 text-lg">
                              Estrutura da Petição (Exemplo)
                            </h4>
                          </div>
                          <div className="text-sm text-blue-700 space-y-3">
                            <div className="bg-white/70 p-3 rounded-lg border border-blue-100">
                              <strong className="text-blue-800">
                                📖 DOS FATOS
                              </strong>
                              <p className="mt-1 text-blue-600">
                                Narrativa cronológica e persuasiva dos fatos,
                                utilizando storytelling para conectar os eventos
                                de forma lógica e favorável ao cliente.
                              </p>
                            </div>
                            <div className="bg-white/70 p-3 rounded-lg border border-blue-100">
                              <strong className="text-blue-800">
                                ⚖️ DO DIREITO
                              </strong>
                              <div className="mt-1 text-blue-600 space-y-2">
                                <p>
                                  <strong>Para cada tese:</strong>
                                </p>
                                <div className="bg-blue-100/50 p-2 rounded border border-blue-200 mb-2">
                                  <p className="text-blue-800 font-semibold text-xs">
                                    Exemplo de formatação:
                                  </p>
                                  <p className="text-blue-700 text-xs">
                                    **1. RESPONSABILIDADE OBJETIVA DO
                                    FORNECEDOR**
                                  </p>
                                  <p className="text-blue-700 text-xs">
                                    **2. DANO MORAL EM RELAÇÕES DE CONSUMO**
                                  </p>
                                </div>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                  <li>
                                    <strong>1º parágrafo:</strong> Introdução da
                                    tese e sua relevância
                                  </li>
                                  <li>
                                    <strong>2º parágrafo:</strong> Fundamentação
                                    legal (artigos, leis)
                                  </li>
                                  <li>
                                    <strong>3º parágrafo:</strong> Aplicação dos
                                    fatos à norma
                                  </li>
                                  <li>
                                    <strong>4º parágrafo:</strong>{" "}
                                    Jurisprudência aplicável (se houver)
                                  </li>
                                  <li>
                                    <strong>5º parágrafo:</strong> Conclusão da
                                    tese e sua importância
                                  </li>
                                </ul>
                                <p className="mt-2 text-orange-600 font-medium">
                                  ⚠️ <strong>Importante:</strong> Após cada
                                  jurisprudência, sempre incluir um parágrafo de
                                  fechamento explicando sua aplicação ao caso.
                                </p>
                              </div>
                            </div>
                            <div className="bg-white/70 p-3 rounded-lg border border-blue-100">
                              <strong className="text-blue-800">
                                🎯 DOS PEDIDOS
                              </strong>
                              <p className="mt-1 text-blue-600">
                                Pedidos específicos e claros, formulados de
                                forma persuasiva e juridicamente adequada.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Seção de Jurisprudências */}
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                            Jurisprudências
                          </h3>

                          {/* Campo para adicionar jurisprudência manualmente */}
                          <div className="mb-4">
                            <label className="block font-medium text-gray-700 mb-2">
                              Adicionar Jurisprudência Personalizada
                            </label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Ex: STJ, REsp 123456/SP, Rel. Min. Fulano..."
                                value={novaJurisprudencia}
                                onChange={(e) =>
                                  setNovaJurisprudencia(e.target.value)
                                }
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600"
                                onClick={() => {
                                  if (novaJurisprudencia.trim()) {
                                    setJuris([
                                      ...juris,
                                      novaJurisprudencia.trim(),
                                    ]);
                                    setNovaJurisprudencia("");
                                  }
                                }}
                                disabled={!novaJurisprudencia.trim()}>
                                Adicionar
                              </Button>
                            </div>
                          </div>

                          {/* Jurisprudências adicionadas */}
                          {juris.length > 0 && (
                            <div className="mb-4">
                              <label className="block font-medium text-gray-700 mb-2">
                                Jurisprudências Selecionadas ({juris.length})
                              </label>
                              <div className="space-y-2">
                                {juris.map((jurisprudencia, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="text-blue-800 flex-1">
                                      {jurisprudencia}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:bg-red-50"
                                      onClick={() =>
                                        setJuris(
                                          juris.filter((_, i) => i !== index)
                                        )
                                      }>
                                      ✕
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sugestões de jurisprudências da IA */}
                          {sugestoesJurisIA.length > 0 && (
                            <div className="mb-4">
                              <label className="block font-medium text-gray-700 mb-2">
                                Jurisprudências sugeridas pela IA (
                                {sugestoesJurisIA.length})
                              </label>
                              <div
                                className="flex gap-2 mb-4 flex-wrap overflow-x-auto"
                                style={{ maxWidth: "100%", width: "100%" }}>
                                <TooltipProvider>
                                  {sugestoesJurisIA.map((j) => (
                                    <Tooltip key={j}>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 max-w-full truncate ${
                                            juris.includes(j)
                                              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow hover:from-blue-600 hover:to-green-600"
                                              : "border border-blue-300 text-blue-700 bg-white hover:bg-blue-50"
                                          }`}
                                          style={{ maxWidth: "100%" }}
                                          onClick={() =>
                                            juris.includes(j)
                                              ? setJuris(
                                                  juris.filter((x) => x !== j)
                                                )
                                              : setJuris([...juris, j])
                                          }>
                                          <span className="truncate max-w-[220px] block">
                                            {j}
                                          </span>
                                          {juris.includes(j) && (
                                            <CheckCircle className="w-4 h-4 ml-1 text-green-200 inline" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="max-w-xs break-words">
                                        {j}
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                </TooltipProvider>
                              </div>
                            </div>
                          )}

                          {/* Sugestões padrão de jurisprudências */}
                          <div>
                            <label className="block font-medium text-gray-700 mb-2">
                              Sugestões Gerais de Jurisprudências
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {sugestoesJuris.map((j) => (
                                <Button
                                  key={j}
                                  size="sm"
                                  className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${
                                    juris.includes(j)
                                      ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow hover:from-blue-500 hover:to-blue-600"
                                      : "border border-blue-200 text-blue-600 bg-white hover:bg-blue-50"
                                  }`}
                                  onClick={() =>
                                    juris.includes(j)
                                      ? setJuris(juris.filter((x) => x !== j))
                                      : setJuris([...juris, j])
                                  }>
                                  {j}
                                  {juris.includes(j) && (
                                    <CheckCircle className="w-4 h-4 ml-1 text-blue-200 inline" />
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Botões de navegação */}
                      <div className="flex gap-4 mt-8">
                        <Button
                          className="rounded-full border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1"
                          variant="outline"
                          onClick={() => setEtapa(2)}>
                          Voltar
                        </Button>
                        <Button
                          className="rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold shadow hover:from-blue-600 hover:to-green-600 transition-all text-lg py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1"
                          disabled={teses.length === 0}
                          onClick={() => setEtapa(5)}>
                          Próximo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Etapa 5: Revisão dos Dados */}
              {etapa === 5 && (
                <div className="relative">
                  <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 hover:border-blue-300 transition-all duration-300 group mb-8">
                    <CardHeader className="flex items-center gap-4 pb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow">
                        <Edit3 className="w-7 h-7" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                          Revisão dos Dados
                        </CardTitle>
                        <p className="text-gray-600 text-base">
                          Revise todos os dados antes de gerar sua peça
                          jurídica.
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6 flex flex-col items-center justify-center">
                        {/* Clientes */}
                        <div className="bg-gray-50 rounded-xl shadow p-4 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-3xl mb-4">
                          <div className="w-full">
                            <div className="font-semibold text-gray-700 mb-1">
                              Cliente(s)
                            </div>
                            <div className="text-gray-800">
                              {clientes.length > 0 ? (
                                <div className="space-y-2">
                                  {clientes.map((c, idx) => (
                                    <div
                                      key={c.id}
                                      className="mb-1 border border-gray-100 rounded-lg p-3 bg-gray-100 flex flex-wrap items-center gap-2"
                                      style={{
                                        textAlign: "justify",
                                        lineHeight: "1.6",
                                      }}>
                                      <span className="font-bold text-blue-900">
                                        {c.name}
                                      </span>
                                      {c.email && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                          {c.email}
                                        </span>
                                      )}
                                      {c.cpf && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                                          CPF: {c.cpf}
                                        </span>
                                      )}
                                      {(c.address || c.endereco) && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-100">
                                          {c.address || c.endereco}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="italic text-gray-400">
                                  Nenhum selecionado
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 md:mt-0 md:ml-6"
                            onClick={() => {
                              setEtapa(0);
                              setVoltarParaRevisao(true);
                            }}>
                            Editar
                          </Button>
                        </div>
                        {/* Partes adversas */}
                        <div className="bg-gray-50 rounded-xl shadow p-4 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-3xl mb-4">
                          <div className="w-full">
                            <div className="font-semibold text-gray-700 mb-1">
                              Partes adversas
                            </div>
                            <div className="text-gray-800">
                              {partesRe.filter((p) => p.nome.trim()).length >
                              0 ? (
                                <div className="space-y-2">
                                  {partesRe
                                    .filter((p) => p.nome.trim())
                                    .map((p, idx) => {
                                      // Determinar o polo da parte adversa baseado no polo do cliente
                                      const poloCliente =
                                        clientes.length > 0
                                          ? poloClientes[clientes[0]?.id] ||
                                            "autor"
                                          : "autor";
                                      const poloParteAdversa =
                                        getPoloOposto(poloCliente);

                                      return (
                                        <div
                                          key={idx}
                                          className="mb-1 border border-gray-100 rounded-lg p-3 bg-gray-100 flex flex-wrap items-center gap-2"
                                          style={{
                                            textAlign: "justify",
                                            lineHeight: "1.6",
                                          }}>
                                          <span className="font-bold text-blue-900">
                                            {p.nome}
                                          </span>
                                          <span
                                            className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                                              poloParteAdversa === "autor"
                                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                                : "bg-orange-50 text-orange-700 border-orange-100"
                                            }`}>
                                            {poloParteAdversa === "autor"
                                              ? "Autor"
                                              : "Réu"}
                                          </span>
                                          {p.tipo && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                                              {p.tipo}
                                            </span>
                                          )}
                                          {p.cpfCnpj && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                                              CPF/CNPJ: {p.cpfCnpj}
                                            </span>
                                          )}
                                          {p.endereco && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-100">
                                              {p.endereco}
                                            </span>
                                          )}
                                          {p.email && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                              {p.email}
                                            </span>
                                          )}
                                          {p.profissao && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-100">
                                              {p.profissao}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                </div>
                              ) : (
                                <span className="italic text-gray-400">
                                  Nenhuma parte adversa informada
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 md:mt-0 md:ml-6"
                            onClick={() => {
                              setEtapa(0);
                              setVoltarParaRevisao(true);
                            }}>
                            Editar
                          </Button>
                        </div>
                        {/* Área e Peça */}
                        <div className="bg-gray-50 rounded-xl shadow p-4 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-3xl mb-4">
                          <div className="w-full">
                            <div className="font-semibold text-gray-700 mb-1">
                              Área do Direito
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {areaSelecionada ? (
                                <span className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
                                  {areaSelecionada}
                                </span>
                              ) : (
                                <span className="italic text-gray-400">
                                  Não selecionada
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-gray-700 mb-1">
                              Tipo de Peça
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {pecaSelecionada?.nome ? (
                                <span className="text-xs px-3 py-1 rounded bg-purple-50 text-purple-700 border border-purple-100 font-semibold">
                                  {pecaSelecionada.nome}
                                </span>
                              ) : (
                                <span className="italic text-gray-400">
                                  Não selecionada
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 md:mt-0 md:ml-6"
                            onClick={() => {
                              setEtapa(1);
                              setVoltarParaRevisao(true);
                            }}>
                            Editar
                          </Button>
                        </div>
                        {/* Fatos */}
                        <div className="bg-gray-50 rounded-xl shadow p-4 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-3xl mb-4">
                          <div className="w-full">
                            <div className="font-semibold text-gray-700 mb-1">
                              Fatos
                            </div>
                            <div
                              className="text-gray-800 whitespace-pre-line"
                              style={{
                                textAlign: "justify",
                                lineHeight: "1.6",
                              }}>
                              {fatos ? (
                                <span className="bg-white border border-gray-100 rounded px-3 py-2 block text-gray-700">
                                  {fatos}
                                </span>
                              ) : (
                                <span className="italic text-gray-400">
                                  Não preenchido
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 md:mt-0 md:ml-6"
                            onClick={() => {
                              setEtapa(2);
                              setVoltarParaRevisao(true);
                            }}>
                            Editar
                          </Button>
                        </div>
                        {/* Pedidos Específicos */}
                        <div className="bg-gray-50 rounded-xl shadow p-4 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-3xl mb-4">
                          <div className="w-full">
                            <div className="font-semibold text-gray-700 mb-1">
                              Pedidos Específicos
                            </div>
                            <div
                              className="text-gray-800 whitespace-pre-line"
                              style={{
                                textAlign: "justify",
                                lineHeight: "1.6",
                              }}>
                              {pedidosEspecificos ? (
                                <span className="bg-white border border-gray-100 rounded px-3 py-2 block text-gray-700">
                                  {pedidosEspecificos}
                                </span>
                              ) : (
                                <span className="italic text-gray-400">
                                  Não preenchido
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 md:mt-0 md:ml-6"
                            onClick={() => {
                              setEtapa(2);
                              setVoltarParaRevisao(true);
                            }}>
                            Editar
                          </Button>
                        </div>
                        {/* Tópicos Preliminares */}
                        <div className="bg-gray-50 rounded-xl shadow p-4 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-3xl mb-4">
                          <div className="w-full">
                            <div className="font-semibold text-gray-700 mb-1">
                              Tópicos Preliminares
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {topicos.length > 0 ? (
                                topicos.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-3 py-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-100 font-semibold">
                                    {t}
                                  </span>
                                ))
                              ) : (
                                <span className="italic text-gray-400">
                                  Nenhum selecionado
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 md:mt-0 md:ml-6"
                            onClick={() => {
                              setEtapa(2);
                              setVoltarParaRevisao(true);
                            }}>
                            Editar
                          </Button>
                        </div>
                        {/* Teses Jurídicas */}
                        <div className="bg-gray-50 rounded-xl shadow p-4 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-3xl mb-4">
                          <div className="w-full">
                            <div className="font-semibold text-gray-700 mb-1">
                              Teses Jurídicas
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {teses.length > 0 ? (
                                teses.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-3 py-1 rounded bg-purple-50 text-purple-700 border border-purple-100 font-semibold">
                                    {t}
                                  </span>
                                ))
                              ) : (
                                <span className="italic text-gray-400">
                                  Nenhuma selecionada
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 md:mt-0 md:ml-6"
                            onClick={() => {
                              setEtapa(4);
                              setVoltarParaRevisao(true);
                            }}>
                            Editar
                          </Button>
                        </div>
                        {/* Jurisprudências */}
                        <div className="bg-gray-50 rounded-xl shadow p-4 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-3xl mb-4">
                          <div className="w-full">
                            <div className="font-semibold text-gray-700 mb-1">
                              Jurisprudências
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {juris.length > 0 ? (
                                juris.map((j, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-3 py-1 rounded bg-pink-50 text-pink-700 border border-pink-100 font-semibold">
                                    {j}
                                  </span>
                                ))
                              ) : (
                                <span className="italic text-gray-400">
                                  Nenhuma selecionada
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 md:mt-0 md:ml-6"
                            onClick={() => {
                              setEtapa(4);
                              setVoltarParaRevisao(true);
                            }}>
                            Editar
                          </Button>
                        </div>
                      </div>
                      {/* Botão principal premium */}
                      <div className="flex justify-end mt-8">
                        <Button
                          className="rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold shadow hover:from-blue-600 hover:to-green-600 transition-all text-base px-6 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          onClick={() => setEtapa(6)}>
                          Próximo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Etapa 6: Edição Final */}
              {etapa === 6 && (
                <div className="relative">
                  <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 hover:border-blue-300 transition-all duration-300 group mb-8">
                    <CardHeader className="flex items-center gap-4 pb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow">
                        <Edit3 className="w-7 h-7" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                          Edição Final e Geração de Documento
                        </CardTitle>
                        <p className="text-gray-600 text-base">
                          Gere, edite e exporte sua peça jurídica com IA e
                          formatação premium.
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="mb-4 rounded-full bg-gradient-aiudex text-white font-bold shadow-aiudex hover:shadow-aiudex-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transform hover:scale-105"
                        onClick={gerarPecaIA}
                        disabled={
                          gerando ||
                          !clientes.length ||
                          !fatos.trim() ||
                          !teses.length
                        }>
                        {gerando ? "Gerando..." : "Gerar Peça com IA"}
                      </Button>
                      {gerando && (
                        <div className="w-full max-w-4xl mx-auto mb-4">
                          {/* Barra de progresso com animação suave */}
                          <div className="relative mb-4">
                            <Progress
                              value={progresso}
                              className="h-3 rounded-full bg-blue-50 animate-progress-glow [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-green-500 [&>div]:transition-all [&>div]:duration-300 [&>div]:ease-out [&>div]:shadow-lg [&>div]:rounded-full"
                            />
                            {/* Indicador de progresso flutuante */}
                            <div
                              className="absolute -top-8 transition-all duration-500 ease-out opacity-90 animate-cloud-float"
                              style={{
                                left: `${Math.min(
                                  Math.max(progresso, 5),
                                  95
                                )}%`,
                                transform: "translateX(-50%)",
                              }}>
                              <div className="bg-gradient-aiudex text-white text-xs px-3 py-1 rounded-full shadow-aiudex font-medium">
                                {progresso}%
                              </div>
                              <div className="w-3 h-3 bg-gradient-aiudex transform rotate-45 mx-auto -mt-1 shadow-aiudex"></div>
                            </div>
                          </div>
                          {/* Logs com animação de digitação */}
                          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 border-2 border-blue-200/50 shadow-aiudex">
                            <div className="flex items-center mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                              <span className="text-sm font-medium text-blue-700">
                                Gerando peça jurídica...
                              </span>
                            </div>
                            <div className="space-y-1">
                              {logs.map((l, i) => (
                                <div
                                  key={i}
                                  className="text-sm text-gray-600 animate-fade-in-up"
                                  style={{
                                    animationDelay: `${i * 200}ms`,
                                    animationFillMode: "both",
                                  }}>
                                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                  {l}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {textoFinal && (
                        <div className="mb-6 space-y-4 animate-fade-in-up">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-green-700">
                              ✨ Documento Gerado com Sucesso!
                            </h3>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                onClick={() => {
                                  navigator.clipboard.writeText(textoFinal);
                                  toast({
                                    title: "Texto copiado!",
                                    description:
                                      "O texto foi copiado para a área de transferência.",
                                  });
                                }}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                                onClick={() => setTextoFinal("")}>
                                Limpar
                              </Button>
                            </div>
                          </div>
                          <Tabs defaultValue="preview" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="preview">
                                Visualizar
                              </TabsTrigger>
                              <TabsTrigger value="edit">Editar</TabsTrigger>
                            </TabsList>
                            <TabsContent value="preview">
                              <JuridicalDocumentPreview
                                content={textoFinal}
                                title={tituloDocumento}
                                clientName={
                                  clientes.length > 0
                                    ? clientes.map((c) => c.name).join(", ")
                                    : undefined
                                }
                                logoUrl={logoUrl}
                                showHeader={true}
                                showQualityIndicators={true}
                                className="w-full"
                              />
                            </TabsContent>
                            <TabsContent value="edit">
                              <MarkdownEditor
                                value={textoFinal}
                                onChange={setTextoFinal}
                                title={tituloDocumento}
                                clientName={
                                  clientes.length > 0
                                    ? clientes.map((c) => c.name).join(", ")
                                    : undefined
                                }
                                logoUrl={logoUrl}
                                showPreview={true}
                                showToolbar={true}
                                placeholder="Edite o documento gerado pela IA..."
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                      {textoFinal && (
                        <div className="flex gap-2">
                          <Button
                            className="rounded-full bg-gradient-aiudex text-white font-bold shadow-aiudex hover:shadow-aiudex-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transform hover:scale-105"
                            onClick={async () => {
                              const doc = {
                                id: Date.now().toString(),
                                title: tituloDocumento || "Peça Jurídica",
                                type: "petition",
                                content: textoFinal
                                  .replace(/\n{2,}/g, "\n")
                                  .replace(/[ \t]+\n/g, "\n")
                                  .replace(/\n[ \t]+/g, "\n")
                                  .replace(
                                    /(EXCELENT[ÍI]SSIMO\(A\)[^\n]+\n)([^\n]+)/i,
                                    "$1\n\n\n\n$2"
                                  )
                                  .trim(),
                                clientId: "",
                                clientName: clientes
                                  .map((c) => c.name)
                                  .join(", "),
                                createdAt: new Date(),
                                updatedAt: new Date(),
                                status: "finalized",
                                template: "",
                                metadata: {
                                  causeValue: "",
                                  jurisdiction: "",
                                  theses: teses,
                                  jurisprudences: juris,
                                  blocks: [],
                                  aiGenerated: true,
                                },
                                tags: [],
                                version: 1,
                              };
                              try {
                                console.log("Tentando salvar documento:", doc);
                                const result =
                                  await documentService.createDocument(doc);
                                console.log(
                                  "Documento salvo com sucesso:",
                                  result
                                );
                                toast({
                                  title: "Documento salvo!",
                                  description:
                                    "O documento foi salvo com sucesso no seu histórico.",
                                });
                              } catch (error) {
                                console.error("Erro ao salvar:", error);
                                toast({
                                  title: "Erro ao salvar",
                                  description:
                                    "Não foi possível salvar o documento.",
                                  variant: "destructive",
                                });
                              }
                            }}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                          <Button
                            className="rounded-full bg-gradient-aiudex-secondary text-white font-bold shadow-aiudex hover:shadow-aiudex-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transform hover:scale-105"
                            onClick={async () => {
                              const doc = {
                                id: Date.now().toString(),
                                title: tituloDocumento || "Peça Jurídica",
                                type: "petition",
                                content: textoFinal
                                  .replace(/\n{2,}/g, "\n")
                                  .replace(/[ \t]+\n/g, "\n")
                                  .replace(/\n[ \t]+/g, "\n")
                                  .replace(
                                    /(EXCELENT[ÍI]SSIMO\(A\)[^\n]+\n)([^\n]+)/i,
                                    "$1\n\n\n\n$2"
                                  )
                                  .trim(),
                                clientId: "",
                                clientName: clientes
                                  .map((c) => c.name)
                                  .join(", "),
                                createdAt: new Date(),
                                updatedAt: new Date(),
                                status: "finalized",
                                template: "",
                                metadata: {
                                  causeValue: "",
                                  jurisdiction: "",
                                  theses: teses,
                                  jurisprudences: juris,
                                  blocks: [],
                                  aiGenerated: true,
                                },
                                tags: [],
                                version: 1,
                              };
                              await exportService.exportToDOCX({
                                ...doc,
                                templateSettings,
                              } as import("@/lib/document-service").LegalDocument & {
                                templateSettings?: any;
                              });
                            }}>
                            Exportar para DOCX
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full border-2 border-blue-300 text-blue-700 bg-white/90 backdrop-blur-sm hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-aiudex transform hover:scale-105"
                            onClick={() => {
                              navigator.clipboard.writeText(textoFinal);
                              toast({
                                title: "Texto copiado!",
                                description:
                                  "O texto foi copiado para a área de transferência.",
                              });
                            }}>
                            Copiar texto
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Após o <PageHeader /> */}
        {voltarParaRevisao && etapa >= 0 && etapa < 4 && (
          <button
            style={{ position: "fixed", top: 32, right: 48, zIndex: 50 }}
            className="rounded-full bg-gradient-aiudex text-white font-bold shadow-aiudex-xl px-8 py-4 text-lg flex items-center gap-2 border-2 border-white/30 animate-pulse transition-all transform hover:scale-105"
            onClick={() => {
              setEtapa(4);
              setVoltarParaRevisao(false);
            }}>
            Voltar para revisão
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Notificações de Conquistas */}
        {notifications.map((achievement) => (
          <AchievementNotification
            key={achievement.id}
            achievement={achievement}
            onClose={() => removeNotification(achievement.id)}
          />
        ))}
      </div>
    </>
  );
}
