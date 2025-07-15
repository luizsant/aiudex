import { metricsServiceAPI } from "./metrics-api";

export interface UserMetrics {
  id: string;
  userId: string;
  totalPecas: number;
  totalTempo: number; // em minutos
  pecasGeradas: Array<{
    id: string;
    tipo: string;
    tempoCriacao: number; // em minutos
    data: string;
    area: string;
  }>;
  primeiraPeca: string | null;
  ultimaAtualizacao: string;
}

export interface OptimizationMetric {
  id: number;
  metric: string;
  before: string;
  after: string;
  improvement: string;
  icon: string;
  isDynamic: boolean;
}

const BASELINE_METRICS = {
  tempoMedioPeca: 270, // 4h 30min em minutos
  pecasPorDia: 2.1,
  taxaRetrabalho: 35,
  satisfacaoCliente: 78,
};

const TARGET_METRICS = {
  tempoMedioPeca: 45, // 45min em minutos
  pecasPorDia: 6.8,
  taxaRetrabalho: 12,
  satisfacaoCliente: 94,
};

export class MetricsService {
  private static STORAGE_KEY = "jurisai_user_metrics";
  private static useAPI = false;

  // Verificar se deve usar API ou localStorage
  private static async checkAPI(): Promise<boolean> {
    if (this.useAPI) return true;

    try {
      const isConnected = await metricsServiceAPI.testConnection();
      this.useAPI = isConnected;
      return isConnected;
    } catch (error) {
      console.log("⚠️ API não disponível, usando localStorage");
      this.useAPI = false;
      return false;
    }
  }

  // Inicializar métricas do usuário
  static async initializeUserMetrics(): Promise<UserMetrics> {
    const useAPI = await this.checkAPI();

    if (useAPI) {
      try {
        const metrics = await metricsServiceAPI.getMetrics();
        if (metrics) return metrics;
      } catch (error) {
        console.log("⚠️ Erro na API, usando localStorage");
        this.useAPI = false;
      }
    }

    // Fallback para localStorage
    const existing = await this.getUserMetrics();
    if (existing) return existing;

    const initialMetrics: UserMetrics = {
      id: "",
      userId: "",
      totalPecas: 0,
      totalTempo: 0,
      pecasGeradas: [],
      primeiraPeca: null,
      ultimaAtualizacao: new Date().toISOString(),
    };

    this.saveUserMetrics(initialMetrics);
    return initialMetrics;
  }

  // Obter métricas do usuário
  static async getUserMetrics(): Promise<UserMetrics | null> {
    const useAPI = await this.checkAPI();

    if (useAPI) {
      try {
        return await metricsServiceAPI.getMetrics();
      } catch (error) {
        console.log("⚠️ Erro na API, usando localStorage");
        this.useAPI = false;
      }
    }

    // Fallback para localStorage
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      return null;
    }
  }

  // Salvar métricas do usuário
  static async saveUserMetrics(metrics: UserMetrics): Promise<void> {
    const useAPI = await this.checkAPI();

    if (useAPI) {
      try {
        await metricsServiceAPI.updateMetrics({
          ...metrics,
          primeiraPeca: metrics.primeiraPeca || undefined,
        });
        return;
      } catch (error) {
        console.log("⚠️ Erro na API, usando localStorage");
        this.useAPI = false;
      }
    }

    // Fallback para localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error("Erro ao salvar métricas:", error);
    }
  }

  // Registrar nova peça gerada
  static async registerPecaGerada(
    tipo: string,
    tempoCriacao: number,
    area: string
  ): Promise<void> {
    const useAPI = await this.checkAPI();

    if (useAPI) {
      try {
        await metricsServiceAPI.registerPeca({ tipo, tempoCriacao, area });
        return;
      } catch (error) {
        console.log("⚠️ Erro na API, usando localStorage");
        this.useAPI = false;
      }
    }

    // Fallback para localStorage
    const metrics =
      (await this.getUserMetrics()) || (await this.initializeUserMetrics());

    const novaPeca = {
      id: Date.now().toString(),
      tipo,
      tempoCriacao,
      data: new Date().toISOString(),
      area,
    };

    metrics.pecasGeradas.push(novaPeca);
    metrics.totalPecas += 1;
    metrics.totalTempo += tempoCriacao;

    if (!metrics.primeiraPeca) {
      metrics.primeiraPeca = novaPeca.data;
    }

    metrics.ultimaAtualizacao = new Date().toISOString();

    await this.saveUserMetrics(metrics);
  }

  // Calcular tempo médio real por peça
  static async getTempoMedioReal(): Promise<number> {
    const metrics = await this.getUserMetrics();
    if (!metrics || metrics.totalPecas === 0) {
      return TARGET_METRICS.tempoMedioPeca; // Valor otimista se não há dados
    }

    return Math.round(metrics.totalTempo / metrics.totalPecas);
  }

  // Calcular peças por dia real
  static async getPecasPorDiaReal(): Promise<number> {
    const metrics = await this.getUserMetrics();
    if (!metrics || !metrics.primeiraPeca) {
      return TARGET_METRICS.pecasPorDia; // Valor otimista se não há dados
    }

    const primeiraData = new Date(metrics.primeiraPeca);
    const hoje = new Date();
    const diasDecorridos = Math.max(
      1,
      Math.ceil(
        (hoje.getTime() - primeiraData.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    return Math.round((metrics.totalPecas / diasDecorridos) * 10) / 10;
  }

  // Calcular melhoria percentual
  static calculateImprovement(valorAtual: number, valorBase: number): string {
    const melhoria = ((valorBase - valorAtual) / valorBase) * 100;
    return `${Math.round(melhoria)}%`;
  }

  // Formatar tempo em minutos para formato legível
  static formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  // Gerar métricas de otimização dinâmicas
  static async getOptimizationMetrics(): Promise<OptimizationMetric[]> {
    const tempoMedioReal = await this.getTempoMedioReal();
    const pecasPorDiaReal = await this.getPecasPorDiaReal();

    // Usar valores reais se disponíveis, senão usar valores otimistas
    const tempoMedioFinal =
      tempoMedioReal > 0 ? tempoMedioReal : TARGET_METRICS.tempoMedioPeca;
    const pecasPorDiaFinal =
      pecasPorDiaReal > 0 ? pecasPorDiaReal : TARGET_METRICS.pecasPorDia;

    return [
      {
        id: 1,
        metric: "Tempo médio por peça",
        before: this.formatTime(BASELINE_METRICS.tempoMedioPeca),
        after: this.formatTime(tempoMedioFinal),
        improvement: this.calculateImprovement(
          tempoMedioFinal,
          BASELINE_METRICS.tempoMedioPeca
        ),
        icon: "Clock",
        isDynamic: tempoMedioReal > 0,
      },
      {
        id: 2,
        metric: "Taxa de retrabalho",
        before: `${BASELINE_METRICS.taxaRetrabalho}%`,
        after: `${TARGET_METRICS.taxaRetrabalho}%`,
        improvement: this.calculateImprovement(
          TARGET_METRICS.taxaRetrabalho,
          BASELINE_METRICS.taxaRetrabalho
        ),
        icon: "CheckCircle",
        isDynamic: false,
      },
      {
        id: 3,
        metric: "Peças por dia",
        before: BASELINE_METRICS.pecasPorDia.toString(),
        after: pecasPorDiaFinal.toString(),
        improvement: this.calculateImprovement(
          BASELINE_METRICS.pecasPorDia,
          pecasPorDiaFinal
        ),
        icon: "Target",
        isDynamic: pecasPorDiaReal > 0,
      },
      {
        id: 4,
        metric: "Satisfação do cliente",
        before: `${BASELINE_METRICS.satisfacaoCliente}%`,
        after: `${TARGET_METRICS.satisfacaoCliente}%`,
        improvement: this.calculateImprovement(
          BASELINE_METRICS.satisfacaoCliente,
          TARGET_METRICS.satisfacaoCliente
        ),
        icon: "TrendingUp",
        isDynamic: false,
      },
    ];
  }

  // Obter estatísticas gerais
  static async getGeneralStats() {
    const metrics = await this.getUserMetrics();
    const tempoMedioReal = await this.getTempoMedioReal();

    return {
      pecasGeradas: metrics?.totalPecas || 0,
      tempoEconomizado: metrics
        ? Math.round(
            (BASELINE_METRICS.tempoMedioPeca - tempoMedioReal) *
              metrics.totalPecas
          )
        : 0,
      eficienciaIA: 87, // Valor base
      produtividade:
        metrics && metrics.totalPecas > 0
          ? Math.round(
              (TARGET_METRICS.pecasPorDia / BASELINE_METRICS.pecasPorDia) * 10
            ) / 10
          : 3.2,
    };
  }

  // Simular dados para demonstração (remover em produção)
  static simulateUsage() {
    const tipos = ["Petição Inicial", "Recurso", "Contestação", "Parecer"];
    const areas = ["Civil", "Trabalhista", "Penal", "Administrativo"];

    for (let i = 0; i < 15; i++) {
      const tempo = Math.floor(Math.random() * 30) + 30; // 30-60 minutos
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const area = areas[Math.floor(Math.random() * areas.length)];

      this.registerPecaGerada(tipo, tempo, area);
    }
  }

  // Limpar dados (para testes)
  static clearData() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
