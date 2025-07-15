import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  FileText,
  Building,
  Mail,
  AlertCircle,
  CheckCircle,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  calendarServiceAPI,
  CalendarEvent,
  CreateCalendarEventData,
  UpdateCalendarEventData,
} from "@/lib/calendar-service-api";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "audiencia" | "reuniao" | "consulta" | "documento" | "outro";
  category: "urgente" | "importante" | "normal" | "lembrete";
  location?: string;
  client?: string;
  description?: string;
  reminder?: boolean;
  reminderTime?: string;
  status: "agendado" | "confirmado" | "realizado" | "cancelado";
}

const Calendar = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [formData, setFormData] = useState<CreateCalendarEventData>({
    title: "",
    date: "",
    time: "",
    type: "",
    category: "",
    client: "",
    location: "",
    description: "",
    reminder: false,
    reminderTime: "",
    status: "AGENDADO",
  });
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);

  // Carregar eventos da API ou localStorage
  useEffect(() => {
    const loadEvents = async () => {
      // Primeiro, carregar dados do localStorage imediatamente
      const savedEvents = localStorage.getItem("calendar_events");
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(parsedEvents);
        setLoading(false); // Dados já disponíveis
      } else {
        // Só mostrar loading se não há dados salvos
        setLoading(true);
      }

      // Depois, tentar sincronizar com a API em background
      try {
        const apiOk = await calendarServiceAPI.checkAPIHealth();
        setApiAvailable(apiOk);
        if (apiOk) {
          const apiEvents = await calendarServiceAPI.getEvents();
          setEvents(apiEvents);
          localStorage.setItem("calendar_events", JSON.stringify(apiEvents));
        } else {
          throw new Error("API offline");
        }
      } catch (err) {
        // Se não há dados salvos, usar array vazio
        if (!savedEvents) {
          setEvents([]);
        }
        setApiAvailable(false);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  // Sincronizar eventos do Kanban
  useEffect(() => {
    const kanbanAgenda = localStorage.getItem("kanban_agenda");
    if (kanbanAgenda) {
      const kanbanEvents = JSON.parse(kanbanAgenda);
      const convertedEvents: CalendarEvent[] = kanbanEvents.map(
        (item: any) => ({
          id: `kanban-${item.id}`,
          userId: "",
          title: item.taskTitle,
          date: item.date,
          time: item.time,
          type: "DOCUMENTO",
          category: "IMPORTANTE",
          client: item.taskClient,
          location: item.location || undefined,
          description: item.notes || undefined,
          reminder: true,
          reminderTime: "1h",
          status: "AGENDADO",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        })
      );
      setEvents((prev) => {
        const nonKanban = prev.filter((e) => !e.id.startsWith("kanban-"));
        return [...nonKanban, ...convertedEvents];
      });
    }
  }, []);

  // CRUD de eventos
  const handleAddEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !formData.title ||
      !formData.date ||
      !formData.time ||
      !formData.type ||
      !formData.category
    ) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }
    setLoading(true);
    try {
      let newEvent: CalendarEvent;
      if (apiAvailable) {
        newEvent = await calendarServiceAPI.createEvent(formData);
        const updated = await calendarServiceAPI.getEvents();
        setEvents(updated);
        localStorage.setItem("calendar_events", JSON.stringify(updated));
      } else {
        // Fallback local
        newEvent = {
          ...formData,
          id: Date.now().toString(),
          userId: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as CalendarEvent;
        setEvents((prev) => {
          const updated = [...prev, newEvent];
          localStorage.setItem("calendar_events", JSON.stringify(updated));
          return updated;
        });
      }
      setFormData({
        title: "",
        date: "",
        time: "",
        type: "",
        category: "",
        client: "",
        location: "",
        description: "",
        reminder: false,
        reminderTime: "",
        status: "AGENDADO",
      });
      setIsDialogOpen(false);
      toast.success("Evento adicionado com sucesso!");
    } catch (err) {
      toast.error("Erro ao adicionar evento!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEventStatus = async (eventId: string, status: string) => {
    setLoading(true);
    try {
      if (apiAvailable) {
        await calendarServiceAPI.updateEvent(eventId, { status });
        const updated = await calendarServiceAPI.getEvents();
        setEvents(updated);
        localStorage.setItem("calendar_events", JSON.stringify(updated));
      } else {
        setEvents((prev) => {
          const updated = prev.map((e) =>
            e.id === eventId ? { ...e, status } : e
          );
          localStorage.setItem("calendar_events", JSON.stringify(updated));
          return updated;
        });
      }
      toast.success("Status do evento atualizado!");
    } catch (err) {
      toast.error("Erro ao atualizar status!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setLoading(true);
    try {
      if (apiAvailable) {
        await calendarServiceAPI.deleteEvent(eventId);
        const updated = await calendarServiceAPI.getEvents();
        setEvents(updated);
        localStorage.setItem("calendar_events", JSON.stringify(updated));
      } else {
        setEvents((prev) => {
          const updated = prev.filter((e) => e.id !== eventId);
          localStorage.setItem("calendar_events", JSON.stringify(updated));
          return updated;
        });
      }
      toast.success("Evento removido!");
    } catch (err) {
      toast.error("Erro ao remover evento!");
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "audiencia":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200 shadow-sm";
      case "reuniao":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-sm";
      case "consulta":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200 shadow-sm";
      case "documento":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200 shadow-sm";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200 shadow-sm";
    }
  };

  const getEventCategoryColor = (category: string) => {
    switch (category) {
      case "urgente":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
      case "importante":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg";
      case "normal":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg";
      case "lembrete":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "audiencia":
        return <Building className="w-3 h-3" />;
      case "reuniao":
        return <Users className="w-3 h-3" />;
      case "consulta":
        return <User className="w-3 h-3" />;
      case "documento":
        return <FileText className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmado":
        return "bg-green-100 text-green-800 border-green-200";
      case "realizado":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    return formData.title && formData.date && formData.time && formData.type;
  };

  // Salvar eventos no localStorage sempre que mudarem
  useEffect(() => {
    const eventsToSave = events.filter(
      (event) => !event.id.startsWith("kanban-")
    );
    localStorage.setItem("calendar_events", JSON.stringify(eventsToSave));
  }, [events]);

  // Sincronizar com eventos do Kanban
  useEffect(() => {
    const syncKanbanEvents = () => {
      const kanbanAgenda = localStorage.getItem("kanban_agenda");
      if (kanbanAgenda) {
        const kanbanEvents = JSON.parse(kanbanAgenda);
        const convertedEvents: CalendarEvent[] = kanbanEvents.map(
          (item: any) => ({
            id: `kanban-${item.id}`,
            title: item.taskTitle,
            date: new Date(item.date),
            time: item.time,
            type: "documento" as CalendarEvent["type"],
            category: "importante" as CalendarEvent["category"],
            client: item.taskClient,
            location: item.location || undefined,
            description: item.notes || undefined,
            reminder: true,
            reminderTime: "1h",
            status: "agendado" as CalendarEvent["status"],
          })
        );

        // Remover eventos antigos do Kanban e adicionar os novos
        setEvents((prev) => {
          const nonKanbanEvents = prev.filter(
            (event) => !event.id.startsWith("kanban-")
          );
          return [...nonKanbanEvents, ...convertedEvents];
        });
      }
    };

    // Sincronizar a cada 5 segundos
    const interval = setInterval(syncKanbanEvents, 5000);
    syncKanbanEvents(); // Sincronizar imediatamente

    return () => clearInterval(interval);
  }, []);

  const navigateMonth = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction * 30));
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  // Funções de exportação
  const exportToOutlook = (event: CalendarEvent) => {
    const startDate = new Date(event.date);
    const [hours, minutes] = event.time.split(":");
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      event.title
    )}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(
      event.description || ""
    )}&location=${encodeURIComponent(event.location || "")}`;

    window.open(outlookUrl, "_blank");
    toast.success("Abrindo Outlook Calendar...");
  };

  const exportToGoogleCalendar = (event: CalendarEvent) => {
    const startDate = new Date(event.date);
    const [hours, minutes] = event.time.split(":");
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${startDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}/${endDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}&details=${encodeURIComponent(
      event.description || ""
    )}&location=${encodeURIComponent(event.location || "")}`;

    window.open(googleUrl, "_blank");
    toast.success("Abrindo Google Calendar...");
  };

  const exportAllToICS = () => {
    let icsContent =
      "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AIudex//Calendar//PT\n";

    events.forEach((event) => {
      const startDate = new Date(event.date);
      const [hours, minutes] = event.time.split(":");
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `UID:${event.id}@legalai.com\n`;
      icsContent += `DTSTART:${startDate
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}\n`;
      icsContent += `DTEND:${endDate
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}\n`;
      icsContent += `SUMMARY:${event.title}\n`;
      if (event.description) {
        icsContent += `DESCRIPTION:${event.description}\n`;
      }
      if (event.location) {
        icsContent += `LOCATION:${event.location}\n`;
      }
      icsContent += `END:VEVENT\n`;
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `calendario-legalai-${format(
      new Date(),
      "yyyy-MM-dd"
    )}.ics`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Calendário exportado com sucesso!");
  };

  const getStats = () => {
    const total = events.length;
    const thisMonth = events.filter((event) =>
      isSameMonth(event.date, currentDate)
    ).length;
    const urgent = events.filter(
      (event) => event.category === "urgente"
    ).length;
    const completed = events.filter(
      (event) => event.status === "realizado"
    ).length;

    return { total, thisMonth, urgent, completed };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <PageHeader
          title="Calendário"
          subtitle="Gerencie seus compromissos e prazos jurídicos"
          icon={<CalendarIcon className="w-5 h-5 md:w-6 md:h-6" />}
        />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Skeleton dos cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-aiudex">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Skeleton dos próximos eventos */}
            <div className="lg:col-span-1">
              <Card className="shadow-aiudex">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </CardContent>
              </Card>
            </div>
            {/* Skeleton do calendário principal */}
            <div className="lg:col-span-3">
              <Card className="shadow-aiudex">
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(7)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-lg" />
                    ))}
                    {[...Array(35)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PageHeader
        title="Calendário"
        subtitle="Gerencie seus compromissos e prazos jurídicos"
        icon={<CalendarIcon className="w-5 h-5 md:w-6 md:h-6" />}
        actions={
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push("/kanban")}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Ver Kanban
            </Button>
            <Button
              onClick={exportAllToICS}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Total de Eventos</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-aiudex-secondary text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Este Mês</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.thisMonth}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Urgentes</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.urgent}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Concluídos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Eventos do Kanban */}
        {events.some((event) => event.id.startsWith("kanban-")) && (
          <Card className="mb-8 border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <span>Eventos do Kanban</span>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {
                    events.filter((event) => event.id.startsWith("kanban-"))
                      .length
                  }
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events
                  .filter((event) => event.id.startsWith("kanban-"))
                  .slice(0, 6)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsDialogOpen(true);
                      }}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 min-w-0">
                          {event.title}
                        </h4>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs flex-shrink-0 ml-2">
                          Kanban
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{format(event.date, "dd/MM/yyyy")}</span>
                        </p>
                        <p className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </p>
                        {event.client && (
                          <p className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{event.client}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              {events.filter((event) => event.id.startsWith("kanban-")).length >
                6 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    +
                    {events.filter((event) => event.id.startsWith("kanban-"))
                      .length - 6}{" "}
                    eventos do Kanban
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Próximos Eventos */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader className="bg-gradient-aiudex text-white border-b-0">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span>Próximos Eventos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {getUpcomingEvents().map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                    onClick={() => setSelectedEvent(event)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-gray-900 flex-1 min-w-0 truncate">
                            {event.title}
                          </h4>
                          <Badge
                            className={`text-xs flex-shrink-0 ml-2 ${getEventCategoryColor(
                              event.category
                            )}`}>
                            {event.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 flex items-center mb-1">
                          <CalendarIcon className="w-3 h-3 mr-2 text-blue-600" />
                          {format(event.date, "dd/MM", {
                            locale: ptBR,
                          })}{" "}
                          às {event.time}
                        </p>
                        {event.client && (
                          <p className="text-xs text-gray-600 flex items-center mb-1">
                            <User className="w-3 h-3 mr-2 text-green-600" />
                            {event.client}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-xs text-gray-600 flex items-center mb-1">
                            <MapPin className="w-3 h-3 mr-2 text-purple-600" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {getUpcomingEvents().length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-aiudex rounded-full flex items-center justify-center mx-auto mb-4 shadow-aiudex">
                      <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum evento agendado
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Adicione eventos para começar a organizar sua agenda
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      size="sm"
                      className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Evento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calendário Principal */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader className="bg-gradient-aiudex text-white border-b-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-white" />
                    </div>
                    <span>Calendário</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(-1)}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium text-white px-4 text-lg">
                      {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(1)}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-3 text-center text-sm font-medium text-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        {day}
                      </div>
                    )
                  )}
                  {dateRange.map((date) => {
                    const dayEvents = getEventsForDate(date);
                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const isCurrentDay = isToday(date);

                    return (
                      <div
                        key={date.toString()}
                        className={`min-h-[140px] p-3 border border-gray-200 rounded-lg transition-all duration-300 ${
                          isCurrentMonth
                            ? "bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md"
                            : "bg-gray-50/50"
                        } ${
                          isCurrentDay
                            ? "ring-2 ring-blue-500 bg-blue-50 shadow-lg"
                            : ""
                        }`}
                        onClick={() => setSelectedDate(date)}>
                        <div
                          className={`text-sm font-bold mb-3 ${
                            isCurrentDay ? "text-blue-600" : "text-gray-900"
                          }`}>
                          {format(date, "d")}
                        </div>
                        <div className="space-y-2">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-2 rounded-lg cursor-pointer border ${getEventTypeColor(
                                event.type
                              )} hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}>
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center space-x-1 flex-1 min-w-0">
                                  {getEventTypeIcon(event.type)}
                                  <span className="truncate font-medium text-xs">
                                    {event.title}
                                  </span>
                                </div>
                                <Badge
                                  className={`text-xs flex-shrink-0 ml-1 ${getEventCategoryColor(
                                    event.category
                                  )}`}>
                                  {event.category}
                                </Badge>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs opacity-75">
                                  {event.time}
                                </span>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-600 text-center py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-100 font-medium">
                              +{dayEvents.length - 3} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Detalhes do Evento */}
        {selectedEvent && (
          <Dialog
            open={!!selectedEvent}
            onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg">
              <DialogHeader className="bg-gradient-aiudex text-white rounded-t-lg -m-6 mb-6 p-6">
                <DialogTitle className="flex items-center space-x-3 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    {getEventTypeIcon(selectedEvent.type)}
                  </div>
                  <span className="text-xl">{selectedEvent.title}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <Label className="text-xs text-gray-600 font-medium">
                      Data
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {format(selectedEvent.date, "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                    <Label className="text-xs text-gray-600 font-medium">
                      Horário
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {selectedEvent.time}
                    </p>
                  </div>
                </div>
                {selectedEvent.client && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                    <Label className="text-xs text-gray-600 font-medium">
                      Cliente
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {selectedEvent.client}
                    </p>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-100">
                    <Label className="text-xs text-gray-600 font-medium">
                      Local
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {selectedEvent.location}
                    </p>
                  </div>
                )}
                {selectedEvent.description && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-100">
                    <Label className="text-xs text-gray-600 font-medium">
                      Descrição
                    </Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Badge
                    className={`${getEventCategoryColor(
                      selectedEvent.category
                    )} text-sm px-3 py-1`}>
                    {selectedEvent.category}
                  </Badge>
                  <Badge
                    className={`${getStatusColor(
                      selectedEvent.status
                    )} text-sm px-3 py-1`}>
                    {selectedEvent.status}
                  </Badge>
                  {selectedEvent.id.startsWith("kanban-") && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm px-3 py-1">
                      Do Kanban
                    </Badge>
                  )}
                </div>

                {/* Botões de Exportação */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToGoogleCalendar(selectedEvent)}
                    className="flex-1 bg-white/50 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Google Calendar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToOutlook(selectedEvent)}
                    className="flex-1 bg-white/50 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200">
                    <Mail className="w-4 h-4 mr-2" />
                    Outlook
                  </Button>
                </div>

                <div className="flex justify-end space-x-3">
                  <Select
                    value={selectedEvent.status}
                    onValueChange={(value) =>
                      handleUpdateEventStatus(
                        selectedEvent.id,
                        value as CalendarEvent["status"]
                      )
                    }>
                    <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="realizado">Realizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Novo Evento */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg">
            <DialogHeader className="bg-gradient-aiudex text-white rounded-t-lg -m-6 mb-6 p-6">
              <DialogTitle className="flex items-center space-x-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl">Novo Evento</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700">
                    Título *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Digite o título do evento"
                    className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="client"
                    className="text-sm font-medium text-gray-700">
                    Cliente
                  </Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) =>
                      handleInputChange("client", e.target.value)
                    }
                    placeholder="Nome do cliente"
                    className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label
                    htmlFor="date"
                    className="text-sm font-medium text-gray-700">
                    Data *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="time"
                    className="text-sm font-medium text-gray-700">
                    Horário *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium text-gray-700">
                    Local
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Local do evento"
                    className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="type"
                    className="text-sm font-medium text-gray-700">
                    Tipo *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audiencia">Audiência</SelectItem>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="documento">Documento</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-700">
                    Categoria *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }>
                    <SelectTrigger className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="importante">Importante</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="lembrete">Lembrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Descrição do evento"
                  rows={4}
                  className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3 mb-4">
                  <Switch
                    id="reminder"
                    checked={formData.reminder}
                    onCheckedChange={(checked) =>
                      handleInputChange("reminder", checked)
                    }
                  />
                  <Label
                    htmlFor="reminder"
                    className="text-sm font-medium text-gray-700">
                    Lembrete
                  </Label>
                </div>
                {formData.reminder && (
                  <div>
                    <Label
                      htmlFor="reminderTime"
                      className="text-sm font-medium text-gray-700">
                      Tempo do Lembrete
                    </Label>
                    <Select
                      value={formData.reminderTime}
                      onValueChange={(value) =>
                        handleInputChange("reminderTime", value)
                      }>
                      <SelectTrigger className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200">
                        <SelectValue placeholder="Selecione o tempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">15 minutos antes</SelectItem>
                        <SelectItem value="30min">30 minutos antes</SelectItem>
                        <SelectItem value="1h">1 hora antes</SelectItem>
                        <SelectItem value="2h">2 horas antes</SelectItem>
                        <SelectItem value="1d">1 dia antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Evento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
