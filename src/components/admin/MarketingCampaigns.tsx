import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Mail,
  MessageSquare,
  Share2,
  BarChart3,
  Filter,
  Search,
  Download,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "social" | "ads";
  status: "draft" | "scheduled" | "active" | "paused" | "completed";
  targetAudience: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  startDate: string;
  endDate: string;
  description: string;
  tags: string[];
  createdAt: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Campanha de Boas-vindas",
    type: "email",
    status: "active",
    targetAudience: "Novos usuários",
    budget: 5000,
    spent: 3200,
    impressions: 15000,
    clicks: 1200,
    conversions: 180,
    ctr: 8.0,
    cpc: 2.67,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    description: "Campanha de boas-vindas para novos usuários da plataforma",
    tags: ["onboarding", "email"],
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Promoção Black Friday",
    type: "social",
    status: "scheduled",
    targetAudience: "Usuários ativos",
    budget: 8000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    startDate: "2024-11-20",
    endDate: "2024-11-30",
    description: "Campanha promocional para Black Friday",
    tags: ["promoção", "social"],
    createdAt: "2024-10-15",
  },
  {
    id: "3",
    name: "Google Ads - Advogados",
    type: "ads",
    status: "active",
    targetAudience: "Advogados",
    budget: 12000,
    spent: 8500,
    impressions: 25000,
    clicks: 2100,
    conversions: 320,
    ctr: 8.4,
    cpc: 4.05,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    description: "Campanha de Google Ads direcionada a advogados",
    tags: ["google-ads", "advogados"],
    createdAt: "2023-12-20",
  },
  {
    id: "4",
    name: "SMS - Lembretes",
    type: "sms",
    status: "paused",
    targetAudience: "Usuários inativos",
    budget: 2000,
    spent: 1500,
    impressions: 5000,
    clicks: 300,
    conversions: 45,
    ctr: 6.0,
    cpc: 5.0,
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    description: "Campanha de SMS para reativar usuários inativos",
    tags: ["reativação", "sms"],
    createdAt: "2023-12-15",
  },
];

const MarketingCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "social":
        return <Share2 className="w-4 h-4" />;
      case "ads":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    const matchesType = typeFilter === "all" || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalBudget = campaigns.reduce(
    (sum, campaign) => sum + campaign.budget,
    0
  );
  const totalSpent = campaigns.reduce(
    (sum, campaign) => sum + campaign.spent,
    0
  );
  const totalImpressions = campaigns.reduce(
    (sum, campaign) => sum + campaign.impressions,
    0
  );
  const totalConversions = campaigns.reduce(
    (sum, campaign) => sum + campaign.conversions,
    0
  );

  const handleCreateCampaign = (campaignData: Partial<Campaign>) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: campaignData.name || "",
      type: (campaignData.type as any) || "email",
      status: "draft",
      targetAudience: campaignData.targetAudience || "",
      budget: campaignData.budget || 0,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      startDate: campaignData.startDate || "",
      endDate: campaignData.endDate || "",
      description: campaignData.description || "",
      tags: campaignData.tags || [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCampaigns([...campaigns, newCampaign]);
    setIsCreateModalOpen(false);
  };

  const handleEditCampaign = (campaignData: Partial<Campaign>) => {
    if (selectedCampaign) {
      const updatedCampaigns = campaigns.map((campaign) =>
        campaign.id === selectedCampaign.id
          ? { ...campaign, ...campaignData }
          : campaign
      );
      setCampaigns(updatedCampaigns);
      setIsEditModalOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter((campaign) => campaign.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const updatedCampaigns = campaigns.map((campaign) =>
      campaign.id === id ? { ...campaign, status: newStatus as any } : campaign
    );
    setCampaigns(updatedCampaigns);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Campanhas de Marketing
          </h2>
          <p className="text-gray-600">
            Gerencie suas campanhas de marketing e acompanhe o desempenho
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orçamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {totalSpent.toLocaleString()} gastos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalImpressions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de visualizações
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalConversions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Conversões totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campanhas Ativas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter((c) => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {campaigns.length} campanhas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar campanhas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="ads">Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Campanhas */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(campaign.type)}
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">
                        {campaign.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status === "active" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {campaign.status === "scheduled" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {campaign.status === "paused" && (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      R$ {campaign.spent.toLocaleString()} / R${" "}
                      {campaign.budget.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setIsEditModalOpen(true);
                      }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Nova Campanha</DialogTitle>
          </DialogHeader>
          <CampaignForm onSubmit={handleCreateCampaign} />
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Campanha</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <CampaignForm
              campaign={selectedCampaign}
              onSubmit={handleEditCampaign}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente do Formulário
interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: Partial<Campaign>) => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    type: campaign?.type || "email",
    targetAudience: campaign?.targetAudience || "",
    budget: campaign?.budget || 0,
    startDate: campaign?.startDate || "",
    endDate: campaign?.endDate || "",
    description: campaign?.description || "",
    tags: campaign?.tags?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Campanha</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData({ ...formData, type: value as any })
            }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="ads">Ads</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAudience">Público-alvo</Label>
        <Input
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) =>
            setFormData({ ...formData, targetAudience: e.target.value })
          }
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Orçamento (R$)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Início</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Fim</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="onboarding, email, promoção"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          {campaign ? "Atualizar" : "Criar"} Campanha
        </Button>
      </div>
    </form>
  );
};

export default MarketingCampaigns;
