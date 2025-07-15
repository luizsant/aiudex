import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Calendar as CalendarIcon,
  X,
  Search,
  RotateCcw,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  userStatus: string[];
  userPlans: string[];
  activityTypes: string[];
  revenueRange: {
    min: number | null;
    max: number | null;
  };
  searchTerm: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
  className?: string;
}

const DEFAULT_FILTERS: FilterOptions = {
  dateRange: {
    from: null,
    to: null,
  },
  userStatus: [],
  userPlans: [],
  activityTypes: [],
  revenueRange: {
    min: null,
    max: null,
  },
  searchTerm: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: "userStatus" | "userPlans" | "activityTypes",
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.userStatus.length > 0) count++;
    if (filters.userPlans.length > 0) count++;
    if (filters.activityTypes.length > 0) count++;
    if (filters.revenueRange.min || filters.revenueRange.max) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  const handleReset = () => {
    onFiltersChange(DEFAULT_FILTERS);
    onReset();
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFiltersCount()} ativo
                {getActiveFiltersCount() !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1">
              <RotateCcw className="h-3 w-3" />
              Limpar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Recolher" : "Expandir"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca rápida */}
        <div className="space-y-2">
          <Label>Busca Geral</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email, ID..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from?.toLocaleDateString("pt-BR") ||
                        "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) =>
                        updateFilter("dateRange", {
                          ...filters.dateRange,
                          from: date || null,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to?.toLocaleDateString("pt-BR") ||
                        "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) =>
                        updateFilter("dateRange", {
                          ...filters.dateRange,
                          to: date || null,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Status dos Usuários */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Status dos Usuários
              </Label>
              <div className="flex flex-wrap gap-2">
                {["ativo", "inativo", "suspenso"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.userStatus.includes(status)}
                      onCheckedChange={() =>
                        toggleArrayFilter("userStatus", status)
                      }
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm capitalize cursor-pointer">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Planos */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Planos
              </Label>
              <div className="flex flex-wrap gap-2">
                {["free", "basic", "pro", "enterprise"].map((plan) => (
                  <div key={plan} className="flex items-center space-x-2">
                    <Checkbox
                      id={`plan-${plan}`}
                      checked={filters.userPlans.includes(plan)}
                      onCheckedChange={() =>
                        toggleArrayFilter("userPlans", plan)
                      }
                    />
                    <Label
                      htmlFor={`plan-${plan}`}
                      className="text-sm capitalize cursor-pointer">
                      {plan === "free"
                        ? "Gratuito"
                        : plan === "basic"
                        ? "Básico"
                        : plan === "pro"
                        ? "Profissional"
                        : "Empresarial"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos de Atividade */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Tipos de Atividade
              </Label>
              <div className="flex flex-wrap gap-2">
                {["auth", "document", "payment", "admin", "system"].map(
                  (type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`activity-${type}`}
                        checked={filters.activityTypes.includes(type)}
                        onCheckedChange={() =>
                          toggleArrayFilter("activityTypes", type)
                        }
                      />
                      <Label
                        htmlFor={`activity-${type}`}
                        className="text-sm capitalize cursor-pointer">
                        {type === "auth"
                          ? "Autenticação"
                          : type === "document"
                          ? "Documentos"
                          : type === "payment"
                          ? "Pagamentos"
                          : type === "admin"
                          ? "Administração"
                          : "Sistema"}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Faixa de Receita */}
            <div className="space-y-2">
              <Label>Faixa de Receita (R$)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.revenueRange.min || ""}
                  onChange={(e) =>
                    updateFilter("revenueRange", {
                      ...filters.revenueRange,
                      min: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={filters.revenueRange.max || ""}
                  onChange={(e) =>
                    updateFilter("revenueRange", {
                      ...filters.revenueRange,
                      max: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            {/* Ordenação */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter("sortBy", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Data de Criação</SelectItem>
                    <SelectItem value="lastLogin">Último Login</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="plan">Plano</SelectItem>
                    <SelectItem value="creditsUsed">Créditos Usados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ordem</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) =>
                    updateFilter("sortOrder", value as "asc" | "desc")
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Crescente</SelectItem>
                    <SelectItem value="desc">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Filtros Ativos */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Filtros Ativos:</Label>
            <div className="flex flex-wrap gap-1">
              {filters.searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Busca: {filters.searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("searchTerm", "")}
                  />
                </Badge>
              )}
              {filters.userStatus.map((status) => (
                <Badge key={status} variant="secondary" className="gap-1">
                  Status: {status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleArrayFilter("userStatus", status)}
                  />
                </Badge>
              ))}
              {filters.userPlans.map((plan) => (
                <Badge key={plan} variant="secondary" className="gap-1">
                  Plano: {plan}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleArrayFilter("userPlans", plan)}
                  />
                </Badge>
              ))}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="gap-1">
                  Período
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      updateFilter("dateRange", { from: null, to: null })
                    }
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
