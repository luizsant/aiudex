import { API_CONFIG } from "./config";

export interface KanbanTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  client?: string;
  process?: string;
  dueDate?: string;
  tags: string[];
  status: string; // todo, doing, waiting, done
  priority: string; // low, medium, high
  time: number; // tempo em segundos
  running: boolean;
  createdAt: string;
  updatedAt: string;
  timer?: KanbanTimer;
  agenda?: KanbanAgenda[];
}

export interface KanbanTimer {
  id: string;
  taskId: string;
  startTime?: string;
  isRunning: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanAgenda {
  id: string;
  taskId: string;
  date: string;
  time: string;
  duration: number; // duração em minutos
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  client?: string;
  process?: string;
  dueDate?: string;
  tags?: string[];
  status?: string;
  priority?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  client?: string;
  process?: string;
  dueDate?: string;
  tags?: string[];
  status?: string;
  priority?: string;
  time?: number;
  running?: boolean;
}

export interface CreateAgendaData {
  date: string;
  time: string;
  duration?: number;
  location?: string;
  notes?: string;
}

export interface KanbanStats {
  total: number;
  todo: number;
  doing: number;
  waiting: number;
  done: number;
}

export class KanbanServiceAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // ======================
  // MÉTODOS DE TAREFAS
  // ======================

  // Buscar todas as tarefas do usuário
  async getTasks(): Promise<KanbanTask[]> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/kanban/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const tasks = await response.json();
      console.log("✅ Tarefas carregadas da API:", tasks.length);
      return tasks;
    } catch (error) {
      console.error("❌ Erro ao carregar tarefas da API:", error);
      throw error;
    }
  }

  // Criar nova tarefa
  async createTask(data: CreateTaskData): Promise<KanbanTask> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/kanban/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const task = await response.json();
      console.log("✅ Tarefa criada na API:", task.title);
      return task;
    } catch (error) {
      console.error("❌ Erro ao criar tarefa na API:", error);
      throw error;
    }
  }

  // Atualizar tarefa
  async updateTask(id: string, data: UpdateTaskData): Promise<KanbanTask> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/kanban/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const task = await response.json();
      console.log("✅ Tarefa atualizada na API:", task.title);
      return task;
    } catch (error) {
      console.error("❌ Erro ao atualizar tarefa na API:", error);
      throw error;
    }
  }

  // Excluir tarefa
  async deleteTask(id: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/kanban/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      console.log("✅ Tarefa excluída da API:", id);
    } catch (error) {
      console.error("❌ Erro ao excluir tarefa da API:", error);
      throw error;
    }
  }

  // ======================
  // MÉTODOS DE TIMERS
  // ======================

  // Iniciar timer
  async startTimer(taskId: string): Promise<KanbanTimer> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${this.baseURL}/api/kanban/tasks/${taskId}/timer/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const timer = await response.json();
      console.log("✅ Timer iniciado na API:", taskId);
      return timer;
    } catch (error) {
      console.error("❌ Erro ao iniciar timer na API:", error);
      throw error;
    }
  }

  // Parar timer
  async stopTimer(taskId: string, elapsedTime: number): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${this.baseURL}/api/kanban/tasks/${taskId}/timer/stop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ elapsedTime }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      console.log("✅ Timer parado na API:", taskId);
    } catch (error) {
      console.error("❌ Erro ao parar timer na API:", error);
      throw error;
    }
  }

  // Resetar timer
  async resetTimer(taskId: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${this.baseURL}/api/kanban/tasks/${taskId}/timer/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      console.log("✅ Timer resetado na API:", taskId);
    } catch (error) {
      console.error("❌ Erro ao resetar timer na API:", error);
      throw error;
    }
  }

  // ======================
  // MÉTODOS DE AGENDA
  // ======================

  // Criar evento na agenda
  async createAgendaEvent(
    taskId: string,
    data: CreateAgendaData
  ): Promise<KanbanAgenda> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${this.baseURL}/api/kanban/tasks/${taskId}/agenda`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const agenda = await response.json();
      console.log("✅ Evento na agenda criado na API:", agenda.id);
      return agenda;
    } catch (error) {
      console.error("❌ Erro ao criar evento na agenda na API:", error);
      throw error;
    }
  }

  // Buscar eventos da agenda
  async getAgendaEvents(): Promise<KanbanAgenda[]> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/kanban/agenda`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const agenda = await response.json();
      console.log("✅ Eventos da agenda carregados da API:", agenda.length);
      return agenda;
    } catch (error) {
      console.error("❌ Erro ao carregar eventos da agenda da API:", error);
      throw error;
    }
  }

  // Excluir evento da agenda
  async deleteAgendaEvent(eventId: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${this.baseURL}/api/kanban/agenda/${eventId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      console.log("✅ Evento da agenda excluído da API:", eventId);
    } catch (error) {
      console.error("❌ Erro ao excluir evento da agenda da API:", error);
      throw error;
    }
  }

  // ======================
  // MÉTODOS AUXILIARES
  // ======================

  // Obter estatísticas do Kanban
  async getStats(): Promise<KanbanStats> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/kanban/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const stats = await response.json();
      console.log("✅ Estatísticas do Kanban carregadas da API:", stats);
      return stats;
    } catch (error) {
      console.error(
        "❌ Erro ao carregar estatísticas do Kanban da API:",
        error
      );
      throw error;
    }
  }

  // Migrar dados do localStorage
  async migrateFromLocalStorage(
    tasks: KanbanTask[]
  ): Promise<{
    success: boolean;
    message: string;
    migratedTasks: KanbanTask[];
  }> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/kanban/migrate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tasks }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Migração do Kanban concluída na API:", result.message);
      return result;
    } catch (error) {
      console.error("❌ Erro na migração do Kanban na API:", error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  // Verificar se a API está disponível
  async checkAPIHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("❌ API não disponível:", error);
      return false;
    }
  }

  // Testar conexão com autenticação
  async testConnection(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.log("⚠️ Sem token de autenticação");
        return false;
      }

      const response = await fetch(`${this.baseURL}/api/kanban/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const isConnected = response.ok;
      console.log(
        "🔗 Teste de conexão com API do Kanban:",
        isConnected ? "✅ OK" : "❌ FALHOU"
      );
      return isConnected;
    } catch (error) {
      console.error("❌ Erro no teste de conexão:", error);
      return false;
    }
  }
}

// Instância singleton
export const kanbanServiceAPI = new KanbanServiceAPI();
