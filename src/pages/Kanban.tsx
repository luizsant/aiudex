import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Circle,
  Users,
  Tag,
  Timer,
  CalendarDays,
  Target,
  Zap,
  BarChart3,
  Settings,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Copy,
  Share2,
  Archive,
  Star,
  Flag,
  MessageSquare,
  FileText,
  Link,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Maximize2,
  Minimize2,
  Move,
  GripVertical,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  User,
  UserCheck,
  UserX,
  UserPlus,
  Users2,
  UserCog,
  UserMinus,
  UserSearch,
} from "lucide-react";

// Tipos
interface Task {
  id: number;
  title: string;
  description: string;
  client: string;
  status: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  tags: string[];
  time: number;
  running: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgendaItem {
  id: number;
  taskId: number;
  taskTitle: string;
  taskClient: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
}

interface FormData {
  title: string;
  description: string;
  client: string;
  status: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  tags: string[];
}

interface AgendaFormData {
  date: string;
  time: string;
  duration: number;
  notes: string;
}

// Tags predefinidas
const PREDEFINED_TAGS = [
  {
    id: "reuniao",
    label: "Reunião",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: "audiencia",
    label: "Audiência",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    id: "prazo",
    label: "Prazo",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    id: "urgente",
    label: "Urgente",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    id: "pericia",
    label: "Perícia",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    id: "protocolo",
    label: "Protocolo",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  {
    id: "conciliacao",
    label: "Conciliação",
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
  {
    id: "documento",
    label: "Documento",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  {
    id: "cliente",
    label: "Cliente",
    color: "bg-teal-100 text-teal-700 border-teal-200",
  },
  {
    id: "processo",
    label: "Processo",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
];

// Colunas do Kanban
const columns = [
  {
    id: "todo",
    title: "A Fazer",
    color: "bg-blue-50 border-blue-200",
    icon: <Circle className="w-4 h-4 text-blue-600" />,
  },
  {
    id: "in-progress",
    title: "Em Andamento",
    color: "bg-yellow-50 border-yellow-200",
    icon: <Clock className="w-4 h-4 text-yellow-600" />,
  },
  {
    id: "review",
    title: "Em Revisão",
    color: "bg-purple-50 border-purple-200",
    icon: <Eye className="w-4 h-4 text-purple-600" />,
  },
  {
    id: "done",
    title: "Concluído",
    color: "bg-green-50 border-green-200",
    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
  },
];

export default function Kanban() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [selectedTaskForAgenda, setSelectedTaskForAgenda] =
    useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Refs para timers
  const timerRefs = useRef<Record<number, NodeJS.Timeout>>({});
  const startTimeRefs = useRef<Record<number, number>>({});

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    client: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    tags: [],
  });

  const [agendaFormData, setAgendaFormData] = useState<AgendaFormData>({
    date: "",
    time: "",
    duration: 60,
    notes: "",
  });

  // Carregar dados do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("kanban_tasks");
      const savedAgenda = localStorage.getItem("kanban_agenda");
      const savedRunningTimers = localStorage.getItem("kanban_running_timers");

      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Dados de exemplo se não há tarefas salvas
        const exampleTasks: Task[] = [
          {
            id: 1,
            title: "Protocolar petição inicial",
            description:
              "Elaborar e protocolar a petição inicial do processo 12345.",
            client: "João Silva",
            status: "todo",
            priority: "high",
            dueDate: "2024-07-10",
            tags: ["urgente", "prazo", "protocolo"],
            time: 0,
            running: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: "Reunião com cliente",
            description: "Reunião para alinhamento de estratégia.",
            client: "Maria Oliveira",
            status: "in-progress",
            priority: "medium",
            dueDate: "2024-07-12",
            tags: ["reuniao", "cliente"],
            time: 25,
            running: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 3,
            title: "Aguardar retorno do perito",
            description: "Aguardando laudo pericial do processo 34567.",
            client: "Empresa XPTO",
            status: "review",
            priority: "low",
            dueDate: "2024-07-15",
            tags: ["pericia", "processo"],
            time: 0,
            running: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 4,
            title: "Audiência de conciliação",
            description: "Audiência marcada para o processo 45678.",
            client: "Carlos Souza",
            status: "done",
            priority: "high",
            dueDate: "2024-07-20",
            tags: ["audiencia", "conciliacao", "processo"],
            time: 60,
            running: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 5,
            title: "Elaborar contestação",
            description: "Preparar contestação para o processo 56789.",
            client: "Ana Costa",
            status: "todo",
            priority: "high",
            dueDate: "2024-07-08",
            tags: ["urgente", "prazo", "documento"],
            time: 0,
            running: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 6,
            title: "Revisar documentos",
            description: "Revisar documentos do processo 67890.",
            client: "Pedro Santos",
            status: "in-progress",
            priority: "medium",
            dueDate: "2024-07-14",
            tags: ["documento", "processo"],
            time: 15,
            running: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setTasks(exampleTasks);
      }

      if (savedAgenda) {
        setAgendaItems(JSON.parse(savedAgenda));
      }

      // Restore running timers
      if (savedRunningTimers) {
        const runningTimers = JSON.parse(savedRunningTimers);
        setTasks((prev: Task[]) =>
          prev.map((task: Task) => ({
            ...task,
            running: runningTimers[task.id] || false,
          }))
        );

        // Start timers for running tasks
        Object.keys(runningTimers).forEach((taskId: string) => {
          if (runningTimers[taskId]) {
            const task = tasks.find((t: Task) => t.id === parseInt(taskId));
            if (task) {
              // Don't add extra time during restore, just start the interval
              startTimer(parseInt(taskId), true); // true = restore mode
            }
          }
        });
      }
    }
  }, []);

  // Salvar tarefas no localStorage quando mudarem
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kanban_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Salvar agenda no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kanban_agenda", JSON.stringify(agendaItems));
    }
  }, [agendaItems]);

  // Save running timers to localStorage
  const saveRunningTimers = (tasks: Task[]) => {
    const runningTimers: Record<number, boolean> = {};
    tasks.forEach((task: Task) => {
      if (task.running) {
        runningTimers[task.id] = true;
      }
    });
    localStorage.setItem(
      "kanban_running_timers",
      JSON.stringify(runningTimers)
    );
  };

  // Timer functions
  function startTimer(taskId: number, isRestore = false) {
    // Clear any existing interval for this task to avoid duplicates
    if (timerRefs.current[taskId]) {
      clearInterval(timerRefs.current[taskId]);
    }

    // Start timer for this specific task (don't stop others)
    setTasks((prev: Task[]) => {
      const updated = prev.map((t: Task) => ({
        ...t,
        running: t.id === taskId ? true : t.running, // Keep other timers running
      }));
      saveRunningTimers(updated);
      return updated;
    });

    // Record start time
    if (!isRestore) {
      startTimeRefs.current[taskId] = Date.now();
    } else {
      // For restore mode, calculate the elapsed time since the timer was started
      const savedStartTime = localStorage.getItem(
        `kanban_timer_start_${taskId}`
      );
      if (savedStartTime) {
        startTimeRefs.current[taskId] = parseInt(savedStartTime);
      } else {
        startTimeRefs.current[taskId] = Date.now();
      }
    }

    // Save start time to localStorage
    localStorage.setItem(
      `kanban_timer_start_${taskId}`,
      startTimeRefs.current[taskId].toString()
    );

    // Start interval for this specific task
    timerRefs.current[taskId] = setInterval(() => {
      setTasks((prev: Task[]) => {
        const updated = prev.map((t: Task) => {
          if (t.id === taskId && t.running) {
            // Simply add 1 second to the current time
            return { ...t, time: t.time + 1 };
          }
          return t;
        });
        saveRunningTimers(updated);
        return updated;
      });
    }, 1000); // Update every second

    if (!isRestore) {
      toast({
        title: "Timer iniciado!",
        description: "O timer foi iniciado com sucesso.",
      });
    }
  }

  function stopTimer(taskId: number) {
    setTasks((prev: Task[]) => {
      const updated = prev.map((t: Task) =>
        t.id === taskId ? { ...t, running: false } : t
      );
      saveRunningTimers(updated);
      return updated;
    });

    if (timerRefs.current[taskId]) {
      clearInterval(timerRefs.current[taskId]);
      delete timerRefs.current[taskId];
    }

    // Remove start time from localStorage
    localStorage.removeItem(`kanban_timer_start_${taskId}`);

    toast({
      title: "Timer pausado!",
      description: "O timer foi pausado com sucesso.",
    });
  }

  function resetTimer(taskId: number) {
    if (confirm("Tem certeza que deseja zerar o tempo desta tarefa?")) {
      setTasks((prev: Task[]) => {
        const updated = prev.map((t: Task) =>
          t.id === taskId ? { ...t, time: 0, running: false } : t
        );
        saveRunningTimers(updated);
        return updated;
      });

      if (timerRefs.current[taskId]) {
        clearInterval(timerRefs.current[taskId]);
        delete timerRefs.current[taskId];
      }

      // Remove start time from localStorage
      localStorage.removeItem(`kanban_timer_start_${taskId}`);

      toast({
        title: "Timer zerado!",
        description: "O timer foi zerado com sucesso.",
      });
    }
  }

  function toggleTimer(taskId: number) {
    const task = tasks.find((t: Task) => t.id === taskId);
    if (task?.running) {
      stopTimer(taskId);
    } else {
      startTimer(taskId);
    }
  }

  // Function to pause all running timers
  function pauseAllTimers() {
    const runningTasks = tasks.filter((task: Task) => task.running);
    if (runningTasks.length === 0) {
      toast({
        title: "Nenhum timer ativo",
        description: "Nenhum timer está rodando no momento.",
      });
      return;
    }

    runningTasks.forEach((task: Task) => {
      stopTimer(task.id);
    });

    toast({
      title: "Timers pausados!",
      description: "Todos os timers foram pausados com sucesso.",
    });
  }

  // Function to reset all timers
  function resetAllTimers() {
    if (
      confirm(
        "Tem certeza que deseja zerar todos os timers? Esta ação não pode ser desfeita."
      )
    ) {
      // Stop all running timers first
      const runningTasks = tasks.filter((task: Task) => task.running);
      runningTasks.forEach((task: Task) => {
        stopTimer(task.id);
      });

      // Reset all task times
      setTasks((prev: Task[]) => {
        const updated = prev.map((t: Task) => ({
          ...t,
          time: 0,
          running: false,
        }));
        saveRunningTimers(updated);
        return updated;
      });

      toast({
        title: "Timers zerados!",
        description: "Todos os timers foram zerados com sucesso.",
      });
    }
  }

  // Get running timers count
  const runningTimersCount = tasks.filter((task: Task) => task.running).length;

  // Drag and drop functions
  function onDragStart(task: Task, e: React.DragEvent) {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    setDragOverColumn(colId);
  }

  function onDragLeave() {
    setDragOverColumn(null);
  }

  function onDrop(colId: string) {
    if (draggedTask) {
      setTasks((prev: Task[]) =>
        prev.map((t: Task) =>
          t.id === draggedTask.id
            ? { ...t, status: colId, updatedAt: new Date().toISOString() }
            : t
        )
      );
      setDraggedTask(null);
      setIsDragging(false);
      setDragOverColumn(null);
      toast({
        title: "Tarefa movida!",
        description: `Tarefa movida para ${
          columns.find((c) => c.id === colId)?.title
        }`,
      });
    }
  }

  function openCreateModal() {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      client: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      tags: [],
    });
    setShowCreateModal(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      client: task.client,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags,
    });
    setShowCreateModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "Título é obrigatório!",
        variant: "destructive",
      });
      return;
    }

    if (!formData.client.trim()) {
      toast({
        title: "Erro de validação",
        description: "Cliente é obrigatório!",
        variant: "destructive",
      });
      return;
    }

    const newTask: Task = {
      id: editingTask ? editingTask.id : Date.now(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      client: formData.client.trim(),
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate,
      tags: formData.tags,
      time: editingTask ? editingTask.time : 0,
      running: false,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingTask) {
      setTasks((prev: Task[]) =>
        prev.map((t: Task) => (t.id === editingTask.id ? newTask : t))
      );
      toast({
        title: "Tarefa atualizada!",
        description: "Tarefa atualizada com sucesso.",
      });
    } else {
      setTasks((prev: Task[]) => [...prev, newTask]);
      toast({
        title: "Tarefa criada!",
        description: "Tarefa criada com sucesso.",
      });
    }

    setShowCreateModal(false);
  }

  function deleteTask(taskId: number) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      // Stop timer if running
      if (timerRefs.current[taskId]) {
        clearInterval(timerRefs.current[taskId]);
        delete timerRefs.current[taskId];
      }

      setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== taskId));
      toast({
        title: "Tarefa excluída!",
        description: "Tarefa excluída com sucesso.",
      });
    }
  }

  function openAgendaModal(task: Task) {
    setSelectedTaskForAgenda(task);
    setAgendaFormData({
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      duration: 60,
      notes: "",
    });
    setShowAgendaModal(true);
  }

  function handleAgendaSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!agendaFormData.date || !agendaFormData.time) {
      toast({
        title: "Erro de validação",
        description: "Data e hora são obrigatórios!",
        variant: "destructive",
      });
      return;
    }

    const agendaItem: AgendaItem = {
      id: Date.now(),
      taskId: selectedTaskForAgenda!.id,
      taskTitle: selectedTaskForAgenda!.title,
      taskClient: selectedTaskForAgenda!.client,
      date: agendaFormData.date,
      time: agendaFormData.time,
      duration: parseInt(agendaFormData.duration.toString()),
      notes: agendaFormData.notes,
    };

    setAgendaItems((prev: AgendaItem[]) => [...prev, agendaItem]);
    setShowAgendaModal(false);
    toast({
      title: "Agendamento criado!",
      description: "Agendamento criado com sucesso.",
    });
  }

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  function getPriorityIcon(priority: string) {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-3 h-3" />;
      case "medium":
        return <Target className="w-3 h-3" />;
      case "low":
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  }

  function isOverdue(dueDate: string) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  function getDaysUntilDue(dueDate: string) {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function getTagColor(tag: string) {
    const predefinedTag = PREDEFINED_TAGS.find(
      (t) => t.id === tag.toLowerCase()
    );
    return predefinedTag
      ? predefinedTag.color
      : "bg-gray-100 text-gray-700 border-gray-200";
  }

  function getTagLabel(tag: string) {
    const predefinedTag = PREDEFINED_TAGS.find(
      (t) => t.id === tag.toLowerCase()
    );
    return predefinedTag ? predefinedTag.label : tag;
  }

  const totalTime = tasks.reduce(
    (sum: number, task: Task) => sum + task.time,
    0
  );
  const runningTasks = tasks.filter((task: Task) => task.running);

  // Filtrar tarefas por tags selecionadas
  const filteredTasks =
    selectedTags.length > 0
      ? tasks.filter((task) =>
          selectedTags.some((tag) => task.tags.includes(tag))
        )
      : tasks;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Kanban"
        subtitle="Gerencie suas tarefas com eficiência"
        icon={<Target className="w-7 h-7 text-white" />}
      />

      <div className="flex-1 p-6">
        {/* Header com estatísticas */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={openCreateModal}
              className="bg-gradient-aiudex hover:shadow-aiudex-lg text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>

            <div className="flex gap-2">
              <Badge className="bg-blue-100 text-blue-700">
                {filteredTasks.filter((t: Task) => t.status === "todo").length}{" "}
                a fazer
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700">
                {
                  filteredTasks.filter((t: Task) => t.status === "in-progress")
                    .length
                }{" "}
                em andamento
              </Badge>
              <Badge className="bg-purple-100 text-purple-700">
                {
                  filteredTasks.filter((t: Task) => t.status === "review")
                    .length
                }{" "}
                em revisão
              </Badge>
              <Badge className="bg-green-100 text-green-700">
                {filteredTasks.filter((t: Task) => t.status === "done").length}{" "}
                concluídas
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {formatTime(totalTime)}
              </span>
            </div>

            {runningTimersCount > 0 && (
              <Badge className="bg-green-100 text-green-700 animate-pulse">
                {runningTimersCount} timer(s) ativo(s)
              </Badge>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pauseAllTimers}
                disabled={runningTimersCount === 0}>
                <Pause className="w-4 h-4 mr-1" />
                Pausar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllTimers}
                className="text-red-600 hover:text-red-700">
                <RotateCcw className="w-4 h-4 mr-1" />
                Zerar Todos
              </Button>
            </div>
          </div>
        </div>

        {/* Filtro de Tags */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Filtrar por tags:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  const newSelectedTags = selectedTags.includes(tag.id)
                    ? selectedTags.filter((t) => t !== tag.id)
                    : [...selectedTags, tag.id];
                  setSelectedTags(newSelectedTags);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedTags.includes(tag.id)
                    ? `${tag.color} scale-105 shadow-sm`
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}>
                {tag.label}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-red-600 hover:text-red-700">
                <X className="w-3 h-3 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map((col) => (
            <div
              key={col.id}
              className={`${
                col.color
              } border-2 rounded-lg p-4 min-h-[600px] transition-all duration-300 ${
                dragOverColumn === col.id ? "scale-105 shadow-lg" : ""
              }`}
              onDragOver={(e) => onDragOver(e, col.id)}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(col.id)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h2 className="font-bold text-gray-800">{col.title}</h2>
                </div>
                <Badge className="bg-white text-gray-700 border-gray-200">
                  {
                    filteredTasks.filter((t: Task) => t.status === col.id)
                      .length
                  }
                </Badge>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                {filteredTasks
                  .filter((t: Task) => t.status === col.id)
                  .sort((a: Task, b: Task) => {
                    // Sort by priority first, then by creation date
                    const priorityOrder: Record<string, number> = {
                      high: 3,
                      medium: 2,
                      low: 1,
                    };
                    const aPriority = priorityOrder[a.priority] || 0;
                    const bPriority = priorityOrder[b.priority] || 0;
                    if (aPriority !== bPriority) return bPriority - aPriority;
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  })
                  .map((task: Task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => onDragStart(task, e)}
                      className={`bg-white border border-gray-200 rounded-lg shadow-sm group hover:shadow-md transition-all cursor-grab active:scale-95 flex flex-col gap-2 p-3 ${
                        draggedTask?.id === task.id ? "opacity-50 scale-95" : ""
                      } ${
                        isOverdue(task.dueDate)
                          ? "border-red-300 bg-red-50"
                          : ""
                      }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {task.client}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            className={`text-xs ${getPriorityColor(
                              task.priority
                            )}`}>
                            {getPriorityIcon(task.priority)}
                            {task.priority === "high"
                              ? "Alta"
                              : task.priority === "medium"
                              ? "Média"
                              : "Baixa"}
                          </Badge>
                          {task.dueDate && (
                            <div
                              className={`text-xs ${
                                isOverdue(task.dueDate)
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            className={`${getTagColor(tag)} text-xs`}>
                            {getTagLabel(tag)}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {formatTime(task.time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTimer(task.id)}
                            className={`h-6 w-6 p-0 ${
                              task.running
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }`}>
                            {task.running ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetTimer(task.id)}
                            className="h-6 w-6 p-0 text-gray-600 hover:text-gray-700">
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(task)}
                            className="h-6 w-6 p-0 text-gray-600 hover:text-gray-700">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAgendaModal(task)}
                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700">
                            <Calendar className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de criação/edição */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Digite o título da tarefa"
                />
              </div>
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  placeholder="Digite o nome do cliente"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Digite a descrição da tarefa"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData({ ...formData, priority: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Seletor de Tags */}
            <div>
              <Label>Tags</Label>
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        const newTags = formData.tags.includes(tag.id)
                          ? formData.tags.filter((t) => t !== tag.id)
                          : [...formData.tags, tag.id];
                        setFormData({ ...formData, tags: newTags });
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        formData.tags.includes(tag.id)
                          ? `${tag.color} scale-105 shadow-sm`
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}>
                      {tag.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  Selecione as tags que se aplicam à tarefa
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTask ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de agenda */}
      <Dialog open={showAgendaModal} onOpenChange={setShowAgendaModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Tarefa</DialogTitle>
          </DialogHeader>
          {selectedTaskForAgenda && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">
                {selectedTaskForAgenda.title}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedTaskForAgenda.client}
              </p>
            </div>
          )}
          <form onSubmit={handleAgendaSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agendaDate">Data</Label>
                <Input
                  id="agendaDate"
                  type="date"
                  value={agendaFormData.date}
                  onChange={(e) =>
                    setAgendaFormData({
                      ...agendaFormData,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="agendaTime">Hora</Label>
                <Input
                  id="agendaTime"
                  type="time"
                  value={agendaFormData.time}
                  onChange={(e) =>
                    setAgendaFormData({
                      ...agendaFormData,
                      time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="agendaDuration">Duração (minutos)</Label>
              <Input
                id="agendaDuration"
                type="number"
                value={agendaFormData.duration}
                onChange={(e) =>
                  setAgendaFormData({
                    ...agendaFormData,
                    duration: parseInt(e.target.value),
                  })
                }
                min="15"
                max="480"
                step="15"
              />
            </div>

            <div>
              <Label htmlFor="agendaNotes">Observações</Label>
              <Textarea
                id="agendaNotes"
                value={agendaFormData.notes}
                onChange={(e) =>
                  setAgendaFormData({
                    ...agendaFormData,
                    notes: e.target.value,
                  })
                }
                placeholder="Observações sobre o agendamento"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAgendaModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Agendar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
