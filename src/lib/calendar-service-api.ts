import { API_CONFIG } from "./config";

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  type: string;
  category: string;
  location?: string;
  client?: string;
  description?: string;
  reminder: boolean;
  reminderTime?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventData {
  title: string;
  date: string;
  time: string;
  type: string;
  category: string;
  location?: string;
  client?: string;
  description?: string;
  reminder?: boolean;
  reminderTime?: string;
  status?: string;
}

export interface UpdateCalendarEventData
  extends Partial<CreateCalendarEventData> {}

export class CalendarServiceAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  async getEvents(): Promise<CalendarEvent[]> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");
    const response = await fetch(`${this.baseURL}/api/calendar/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");
    const response = await fetch(`${this.baseURL}/api/calendar/events/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
  }

  async createEvent(data: CreateCalendarEventData): Promise<CalendarEvent> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");
    const response = await fetch(`${this.baseURL}/api/calendar/events`, {
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
    return await response.json();
  }

  async updateEvent(
    id: string,
    data: UpdateCalendarEventData
  ): Promise<CalendarEvent> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");
    const response = await fetch(`${this.baseURL}/api/calendar/events/${id}`, {
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
    return await response.json();
  }

  async deleteEvent(id: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");
    const response = await fetch(`${this.baseURL}/api/calendar/events/${id}`, {
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
  }

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
      return false;
    }
  }
}

export const calendarServiceAPI = new CalendarServiceAPI();
