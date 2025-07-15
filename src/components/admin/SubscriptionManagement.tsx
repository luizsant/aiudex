import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  user: string;
  plan: string;
  status: "ativo" | "cancelado" | "suspenso" | "trial";
  startDate: string;
  endDate: string;
  amount: number;
  nextBilling: string;
  autoRenew: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  benefits: string[];
}

// MOCK: Planos disponíveis
const mockPlans: Plan[] = [
  {
    id: "plan_free",
    name: "Free",
    price: 0,
    benefits: ["Acesso limitado", "Suporte básico"],
  },
  {
    id: "plan_basic",
    name: "Basic",
    price: 49.9,
    benefits: ["Acesso a documentos", "Suporte padrão", "5 usuários"],
  },
  {
    id: "plan_pro",
    name: "Pro",
    price: 129.9,
    benefits: [
      "Tudo do Basic",
      "Integração IA",
      "20 usuários",
      "Prioridade no suporte",
    ],
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: 399.9,
    benefits: [
      "Tudo do Pro",
      "Usuários ilimitados",
      "Gestor dedicado",
      "SLA personalizado",
    ],
  },
];

// Adicionar PlanModal mock
const PlanModal = ({
  plan,
  onClose,
  onSave,
}: {
  plan?: Plan;
  onClose: () => void;
  onSave: (plan: Plan) => void;
}) => {
  const [name, setName] = useState<string>(plan?.name || "");
  const [price, setPrice] = useState<number>(plan?.price || 0);
  const [benefits, setBenefits] = useState<string>(
    plan?.benefits?.join("\n") || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: plan?.id || `plan_${Date.now()}`,
      name,
      price: parseFloat(String(price)),
      benefits: benefits
        .split("\n")
        .map((b: string) => b.trim())
        .filter((b: string) => Boolean(b)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md space-y-4">
        <h3 className="text-lg font-bold mb-2">
          {plan ? "Editar Plano" : "Novo Plano"}
        </h3>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Preço (R$)</label>
          <input
            className="w-full border rounded px-2 py-1"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Benefícios (um por linha)
          </label>
          <textarea
            className="w-full border rounded px-2 py-1"
            rows={4}
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
          />
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            className="px-3 py-1 rounded bg-gray-200"
            onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-blue-600 text-white">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

const SubscriptionManagement = () => {
  // Estado dos planos
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState<boolean>(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  // Estado das assinaturas
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState<boolean>(true);
  const [subsError, setSubsError] = useState<string | null>(null);

  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Carregar planos da API
  useEffect(() => {
    setPlansLoading(true);
    fetch("/api/planos")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar planos");
        return res.json();
      })
      .then((json: Plan[]) => {
        setPlans(json);
        setPlansError(null);
      })
      .catch((err: unknown) => {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar planos";
        setPlansError(errorMessage);
        setPlans([]);
      })
      .finally(() => setPlansLoading(false));
  }, []);

  // Carregar assinaturas da API
  useEffect(() => {
    setSubsLoading(true);
    fetch("/api/assinaturas")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar assinaturas");
        return res.json();
      })
      .then((json: Subscription[]) => {
        setSubscriptions(json);
        setSubsError(null);
      })
      .catch((err: unknown) => {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar assinaturas";
        setSubsError(errorMessage);
        setSubscriptions([]);
      })
      .finally(() => setSubsLoading(false));
  }, []);

  // Funções CRUD de Planos
  const createPlan = async (plan: Plan) => {
    try {
      const res = await fetch("/api/planos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      if (!res.ok) throw new Error("Erro ao criar plano");
      toast.success("Plano criado com sucesso!");
      reloadPlans();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar plano";
      toast.error(errorMessage);
    }
  };
  const updatePlan = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/planos/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      if (!res.ok) throw new Error("Erro ao editar plano");
      toast.success("Plano editado com sucesso!");
      reloadPlans();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao editar plano";
      toast.error(errorMessage);
    }
  };
  const deletePlan = async (id: string) => {
    try {
      const res = await fetch(`/api/planos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover plano");
      toast.success("Plano removido com sucesso!");
      reloadPlans();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao remover plano";
      toast.error(errorMessage);
    }
  };
  const reloadPlans = () => {
    setPlansLoading(true);
    fetch("/api/planos")
      .then((res) => res.json())
      .then((json: Plan[]) => setPlans(json))
      .finally(() => setPlansLoading(false));
  };

  // Funções CRUD de Assinaturas
  const createSubscription = async (sub: Subscription) => {
    try {
      const res = await fetch("/api/assinaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("Erro ao criar assinatura");
      toast.success("Assinatura criada com sucesso!");
      reloadSubscriptions();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar assinatura";
      toast.error(errorMessage);
    }
  };
  const updateSubscription = async (sub: Subscription) => {
    try {
      const res = await fetch(`/api/assinaturas/${sub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("Erro ao editar assinatura");
      toast.success("Assinatura editada com sucesso!");
      reloadSubscriptions();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao editar assinatura";
      toast.error(errorMessage);
    }
  };
  const deleteSubscription = async (id: string) => {
    try {
      const res = await fetch(`/api/assinaturas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover assinatura");
      toast.success("Assinatura removida com sucesso!");
      reloadSubscriptions();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao remover assinatura";
      toast.error(errorMessage);
    }
  };
  const reloadSubscriptions = () => {
    setSubsLoading(true);
    fetch("/api/assinaturas")
      .then((res) => res.json())
      .then((json: Subscription[]) => setSubscriptions(json))
      .finally(() => setSubsLoading(false));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      case "suspenso":
        return "bg-yellow-100 text-yellow-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Premium":
        return "bg-purple-100 text-purple-800";
      case "Professional":
        return "bg-blue-100 text-blue-800";
      case "Basic":
        return "bg-green-100 text-green-800";
      case "Trial":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Exibir loading/erro dos planos
  if (plansLoading)
    return (
      <div className="p-8 text-center text-gray-500">Carregando planos...</div>
    );
  if (plansError)
    return (
      <div className="p-8 text-center text-red-500">Erro: {plansError}</div>
    );

  // Exibir loading/erro das assinaturas
  if (subsLoading)
    return (
      <div className="p-8 text-center text-gray-500">
        Carregando assinaturas...
      </div>
    );
  if (subsError)
    return (
      <div className="p-8 text-center text-red-500">Erro: {subsError}</div>
    );

  return (
    <div className="space-y-6">
      {/* Painel de Planos */}
      <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-white/30 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-700">
            Planos Disponíveis
          </h2>
          <Button
            onClick={() => {
              setEditingPlan(null);
              setShowPlanModal(true);
            }}
            variant="default">
            Novo Plano
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100 shadow flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg text-blue-800">
                  {plan.name}
                </span>
                <span className="text-xl font-bold text-green-700">
                  {plan.price === 0 ? "Grátis" : `R$ ${plan.price}`}
                </span>
              </div>
              <ul className="mb-2 text-sm text-gray-700 list-disc pl-4">
                {plan.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <div className="flex gap-2 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingPlan(plan);
                    setShowPlanModal(true);
                  }}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePlan(plan.id)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal de Plano */}
      {showPlanModal && (
        <PlanModal
          plan={editingPlan ?? undefined}
          onClose={() => setShowPlanModal(false)}
          onSave={updatePlan}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Gestão de Assinaturas
          </h2>
          <p className="text-gray-600 mt-1">
            Controle de planos, pagamentos e renovações
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setSubsLoading(true);
              reloadSubscriptions();
            }}
            variant="outline"
            size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Assinaturas</p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +12% este mês
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    subscriptions
                      .filter((s) => s.status === "ativo")
                      .reduce((sum, s) => sum + s.amount, 0)
                  )}
                </p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +8% este mês
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Retenção</p>
                <p className="text-2xl font-bold">94.2%</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +2.1% este mês
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próximos Pagamentos</p>
                <p className="text-2xl font-bold">
                  {subscriptions.filter((s) => s.status === "ativo").length}
                </p>
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Este mês
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Assinaturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Assinaturas Ativas
          </CardTitle>
          <CardDescription>
            Lista de todas as assinaturas e seus status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Próximo Pagamento</TableHead>
                <TableHead>Renovação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.user}</div>
                      <div className="text-sm text-gray-500">
                        ID: {subscription.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(subscription.plan)}>
                      {subscription.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status === "ativo"
                        ? "Ativo"
                        : subscription.status === "cancelado"
                        ? "Cancelado"
                        : subscription.status === "suspenso"
                        ? "Suspenso"
                        : "Trial"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(subscription.amount)}
                    </div>
                    <div className="text-sm text-gray-500">mensal</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">
                        {new Date(
                          subscription.nextBilling
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {subscription.autoRenew ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-sm">Automática</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-sm">Manual</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Suspender
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
