// Dados de teste para desenvolvimento
export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
  oabNumber: string;
  firm?: string;
  role: "admin" | "advogado" | "estagiario";
  createdAt: Date;
  lastLogin?: string;
}

export interface TestClient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf: string;
  address: string;
  createdAt: Date;
  status: "ativo" | "inativo" | "prospecto";
}

export interface TestDocument {
  id: string;
  title: string;
  content: string;
  type: "petition" | "contract" | "procuracao" | "recurso" | "parecer";
  client?: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "completed" | "exported";
  size: string;
}

export interface TestEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "audiencia" | "prazo" | "reuniao" | "outro";
  location?: string;
  client?: string;
  description?: string;
}

// Usuários de teste
export const testUsers: TestUser[] = [
  {
    id: "1",
    name: "Dr. João Silva",
    email: "joao.silva@teste.com",
    password: "123456",
    oabNumber: "123456/SP",
    firm: "Silva Advocacia",
    role: "advogado",
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "2",
    name: "Dra. Maria Santos",
    email: "maria.santos@teste.com",
    password: "123456",
    oabNumber: "234567/SP",
    firm: "Santos & Associados",
    role: "advogado",
    createdAt: new Date("2025-01-02"),
  },
  {
    id: "3",
    name: "Dr. Carlos Oliveira",
    email: "carlos.oliveira@teste.com",
    password: "123456",
    oabNumber: "345678/SP",
    firm: "Oliveira Law Firm",
    role: "advogado",
    createdAt: new Date("2025-01-03"),
  },
  {
    id: "4",
    name: "Admin Sistema",
    email: "admin@legalai.com",
    password: "admin123",
    oabNumber: "000001/SP",
    firm: "AIudex",
    role: "admin",
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "5",
    name: "Usuário Gratuito",
    email: "gratuito@teste.com",
    password: "123456",
    oabNumber: "999999/SP",
    firm: "Escritório Individual",
    role: "advogado",
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "6",
    name: "Dr. Pro Usuário",
    email: "pro@teste.com",
    password: "123456",
    oabNumber: "888888/SP",
    firm: "Escritório Pro",
    role: "advogado",
    createdAt: new Date("2025-01-01"),
  },
];

// Clientes de teste
export const testClients: TestClient[] = [
  {
    id: "1",
    name: "Pedro Almeida",
    email: "pedro.almeida@email.com",
    phone: "(11) 99999-1111",
    cpf: "123.456.789-01",
    address: "Rua das Flores, 123 - São Paulo/SP",
    createdAt: new Date("2024-01-01"),
    status: "ativo",
  },
  {
    id: "2",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(11) 99999-2222",
    cpf: "234.567.890-12",
    address: "Av. Paulista, 456 - São Paulo/SP",
    createdAt: new Date("2024-01-02"),
    status: "ativo",
  },
  {
    id: "3",
    name: "Roberto Lima",
    email: "roberto.lima@email.com",
    phone: "(11) 99999-3333",
    cpf: "345.678.901-23",
    address: "Rua Augusta, 789 - São Paulo/SP",
    createdAt: new Date("2024-01-03"),
    status: "prospecto",
  },
];

// Documentos de teste
export const testDocuments: TestDocument[] = [
  {
    id: "1",
    title: "Petição Inicial - Ação de Indenização",
    content: "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...",
    type: "petition",
    client: "Pedro Almeida",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    status: "completed",
    size: "2.5 KB",
  },
  {
    id: "2",
    title: "Contrato de Honorários",
    content: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS...",
    type: "contract",
    client: "Ana Costa",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
    status: "draft",
    size: "1.8 KB",
  },
  {
    id: "3",
    title: "Procuração Ad Judicia",
    content: "PROCURAÇÃO AD JUDICIA...",
    type: "procuracao",
    client: "Roberto Lima",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
    status: "exported",
    size: "1.2 KB",
  },
];

// Eventos de teste
export const testEvents: TestEvent[] = [
  {
    id: "1",
    title: "Audiência de Conciliação",
    date: new Date("2024-01-15"),
    time: "14:00",
    type: "audiencia",
    location: "Fórum Central - Sala 205",
    client: "Pedro Almeida",
    description:
      "Audiência de conciliação no processo 1001234-56.2024.8.26.0100",
  },
  {
    id: "2",
    title: "Prazo para Recurso",
    date: new Date("2024-01-20"),
    time: "23:59",
    type: "prazo",
    client: "Ana Costa",
    description: "Prazo final para interposição de recurso",
  },
  {
    id: "3",
    title: "Reunião com Cliente",
    date: new Date("2024-01-18"),
    time: "10:00",
    type: "reuniao",
    location: "Escritório",
    client: "Roberto Lima",
    description: "Reunião para discussão de estratégia processual",
  },
];

// Funções utilitárias para testes
export const getTestUser = (email: string): TestUser | undefined => {
  // Primeiro verificar nos dados de teste
  let user = testUsers.find((user) => user.email === email);

  // Se não encontrou, verificar nos usuários salvos no localStorage
  if (!user) {
    const savedUsers = localStorage.getItem("legalai_registered_users");
    if (savedUsers) {
      try {
        const users = JSON.parse(savedUsers);
        user = users.find((u: any) => u.email === email);
      } catch (error) {
        console.error("Erro ao verificar usuários salvos:", error);
      }
    }
  }

  return user;
};

export const getTestUserById = (id: string): TestUser | undefined => {
  return testUsers.find((user) => user.id === id);
};

export const getTestClient = (id: string): TestClient | undefined => {
  return testClients.find((client) => client.id === id);
};

export const getTestDocument = (id: string): TestDocument | undefined => {
  return testDocuments.find((doc) => doc.id === id);
};

export const getTestEvent = (id: string): TestEvent | undefined => {
  return testEvents.find((event) => event.id === id);
};

// Credenciais de teste para login
export const testCredentials = {
  admin: {
    email: "admin@legalai.com",
    password: "admin123",
  },
  advogado1: {
    email: "joao.silva@teste.com",
    password: "123456",
  },
  advogado2: {
    email: "maria.santos@teste.com",
    password: "123456",
  },
  advogado3: {
    email: "carlos.oliveira@teste.com",
    password: "123456",
  },
};
