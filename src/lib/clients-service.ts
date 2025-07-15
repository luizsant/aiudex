import { buildApiUrl } from "./config";

export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  address?: string;
  birthDate?: string;
  maritalStatus?: string;
  nationality?: string;
  profession?: string;
  observations?: string;
  processes: number;
  processNumber?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  address?: string;
  birthDate?: string;
  maritalStatus?: string;
  nationality?: string;
  profession?: string;
  observations?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  address?: string;
  birthDate?: string;
  maritalStatus?: string;
  nationality?: string;
  profession?: string;
  observations?: string;
  processes?: number;
  status?: string;
}

class ClientsService {
  private getStorageKey(): string {
    return "clients";
  }

  private getClientsFromStorage(): Client[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(this.getStorageKey());
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Erro ao parsear clientes do localStorage:", error);
      return [];
    }
  }

  private saveClientsToStorage(clients: Client[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(clients));
  }

  // Listar todos os clientes
  async getClients(): Promise<Client[]> {
    try {
      console.log("📋 Buscando clientes do localStorage...");
      const clients = this.getClientsFromStorage();
      console.log(`✅ ${clients.length} clientes encontrados`);
      return clients;
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }
  }

  // Buscar cliente específico
  async getClient(id: string): Promise<Client> {
    try {
      const clients = this.getClientsFromStorage();
      const client = clients.find((c) => c.id === id);

      if (!client) {
        throw new Error("Cliente não encontrado");
      }

      return client;
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      throw error;
    }
  }

  // Criar novo cliente
  async createClient(clientData: CreateClientData): Promise<Client> {
    try {
      const clients = this.getClientsFromStorage();

      // Validações básicas
      if (!clientData.name || !clientData.name.trim()) {
        throw new Error("Nome do cliente é obrigatório");
      }

      // Verificar se já existe cliente com mesmo CPF
      if (clientData.cpf) {
        const existingClient = clients.find((c) => c.cpf === clientData.cpf);
        if (existingClient) {
          throw new Error("Já existe um cliente com este CPF");
        }
      }

      // Criar endereço formatado se não fornecido
      let formattedAddress = clientData.address;
      if (
        !formattedAddress &&
        clientData.street &&
        clientData.number &&
        clientData.city &&
        clientData.state
      ) {
        formattedAddress = `${clientData.street}, ${clientData.number}${
          clientData.complement ? `, ${clientData.complement}` : ""
        } - ${clientData.neighborhood}, ${clientData.city}/${
          clientData.state
        } - CEP: ${clientData.cep}`;
      }

      const newClient: Client = {
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: "dev-user",
        name: clientData.name.trim(),
        email: clientData.email?.trim() || undefined,
        phone: clientData.phone?.trim() || undefined,
        cpf: clientData.cpf?.trim() || undefined,
        rg: clientData.rg?.trim() || undefined,
        cep: clientData.cep?.trim() || undefined,
        street: clientData.street?.trim() || undefined,
        number: clientData.number?.trim() || undefined,
        complement: clientData.complement?.trim() || undefined,
        neighborhood: clientData.neighborhood?.trim() || undefined,
        city: clientData.city?.trim() || undefined,
        state: clientData.state?.trim() || undefined,
        address: formattedAddress,
        birthDate: clientData.birthDate?.trim() || undefined,
        maritalStatus: clientData.maritalStatus?.trim() || undefined,
        nationality: clientData.nationality || "Brasileira",
        profession: clientData.profession?.trim() || undefined,
        observations: clientData.observations?.trim() || undefined,
        processes: 0,
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clients.push(newClient);
      this.saveClientsToStorage(clients);

      console.log("✅ Cliente criado com sucesso:", newClient.name);
      return newClient;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  }

  // Atualizar cliente
  async updateClient(
    clientId: string,
    clientData: Partial<Client>
  ): Promise<Client> {
    try {
      const clients = this.getClientsFromStorage();
      const clientIndex = clients.findIndex((c) => c.id === clientId);

      if (clientIndex === -1) {
        throw new Error("Cliente não encontrado");
      }

      const existingClient = clients[clientIndex];

      // Verificar se CPF já existe em outro cliente
      if (clientData.cpf && clientData.cpf !== existingClient.cpf) {
        const duplicateClient = clients.find(
          (c) => c.cpf === clientData.cpf && c.id !== clientId
        );
        if (duplicateClient) {
          throw new Error("Já existe outro cliente com este CPF");
        }
      }

      // Criar endereço formatado se não fornecido
      let formattedAddress = clientData.address;
      if (
        !formattedAddress &&
        clientData.street &&
        clientData.number &&
        clientData.city &&
        clientData.state
      ) {
        formattedAddress = `${clientData.street}, ${clientData.number}${
          clientData.complement ? `, ${clientData.complement}` : ""
        } - ${clientData.neighborhood}, ${clientData.city}/${
          clientData.state
        } - CEP: ${clientData.cep}`;
      }

      const updatedClient: Client = {
        ...existingClient,
        ...clientData,
        address: formattedAddress,
        updatedAt: new Date().toISOString(),
      };

      clients[clientIndex] = updatedClient;
      this.saveClientsToStorage(clients);

      console.log("✅ Cliente atualizado com sucesso:", updatedClient.name);
      return updatedClient;
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
  }

  // Deletar cliente
  async deleteClient(clientId: string): Promise<void> {
    try {
      const clients = this.getClientsFromStorage();
      const clientIndex = clients.findIndex((c) => c.id === clientId);

      if (clientIndex === -1) {
        throw new Error("Cliente não encontrado");
      }

      const deletedClient = clients[clientIndex];
      clients.splice(clientIndex, 1);
      this.saveClientsToStorage(clients);

      console.log("✅ Cliente deletado com sucesso:", deletedClient.name);
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      throw error;
    }
  }

  // Buscar clientes por termo
  async searchClients(query: string): Promise<Client[]> {
    try {
      const clients = this.getClientsFromStorage();
      const searchTerm = query.toLowerCase();

      const filteredClients = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm) ||
          (client.email && client.email.toLowerCase().includes(searchTerm)) ||
          (client.cpf && client.cpf.includes(searchTerm))
      );

      console.log(
        `🔍 Busca por "${query}": ${filteredClients.length} resultados`
      );
      return filteredClients;
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }
  }

  // Verificar se há clientes no localStorage
  hasLocalStorageClients(): boolean {
    if (typeof window === "undefined") return false;

    const storedClients = localStorage.getItem(this.getStorageKey());
    if (!storedClients) return false;

    try {
      const clients = JSON.parse(storedClients);
      return Array.isArray(clients) && clients.length > 0;
    } catch {
      return false;
    }
  }
}

export const clientsService = new ClientsService();
