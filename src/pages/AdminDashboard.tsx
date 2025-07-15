import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  Activity,
  Mail,
  User,
  Brain,
  Settings,
} from "lucide-react";
import RealUserManagement from "@/components/admin/RealUserManagement";
import ActivityLogs from "@/components/admin/ActivityLogs";
import FinancialDashboard from "@/components/admin/FinancialDashboard";
import SubscriptionManagement from "@/components/admin/SubscriptionManagement";
import MarketingCampaigns from "@/components/admin/MarketingCampaigns";
import SalesFunnel from "@/components/admin/SalesFunnel";
import AnalyticsReports from "@/components/admin/AnalyticsReports";
import TechnicalOperations from "@/components/admin/TechnicalOperations";
import SecurityCompliance from "@/components/admin/SecurityCompliance";
import AIMonitoring from "@/components/admin/AIMonitoring";
import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import {
  NotificationCenter,
  NotificationStats,
  NotificationItem,
} from "@/components/admin/NotificationCenter";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useAdminNotifications } from "@/lib/admin-notifications";
import { ReportGenerator } from "@/components/admin/ReportGenerator";
import { ReportViewer } from "@/components/admin/ReportViewer";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { BackupManager } from "@/components/admin/BackupManager";

const sections = [
  { key: "gestao", label: "Gestão", icon: Users },
  { key: "comercial", label: "Comercial", icon: DollarSign },
  { key: "marketing", label: "Marketing", icon: Mail },
  { key: "relatorios", label: "Relatórios", icon: BarChart3 },
  { key: "operacoes", label: "Operações", icon: Activity },
  { key: "seguranca", label: "Segurança", icon: Shield },
  { key: "ia", label: "IA & Analytics", icon: Brain },
];

const AdminDashboard = () => {
  const { settings } = useAdminSettings();
  const { testNotification } = useRealTimeNotifications();
  const {
    simulateNotifications,
    notifications,
    markAsRead,
    removeNotification,
  } = useAdminNotifications();
  const [selected, setSelected] = useState<
    | "gestao"
    | "comercial"
    | "marketing"
    | "relatorios"
    | "operacoes"
    | "seguranca"
    | "ia"
  >("gestao");
  const [showSettings, setShowSettings] = useState(false);

  // Listener para navegação via notificações
  useEffect(() => {
    const handleAdminNavigate = (event: CustomEvent) => {
      const { section } = event.detail;
      if (section) {
        setSelected(section as typeof selected);
      }
    };

    window.addEventListener(
      "admin-navigate",
      handleAdminNavigate as EventListener
    );

    return () => {
      window.removeEventListener(
        "admin-navigate",
        handleAdminNavigate as EventListener
      );
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-50/60 via-blue-100/40 to-green-50/60 backdrop-blur-md border-r border-white/30 shadow-xl flex flex-col">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {sections.map((section) => (
            <button
              key={section.key}
              className={`flex items-center w-full px-4 py-2 rounded-xl transition-all text-left space-x-3 font-medium ${
                selected === section.key
                  ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg"
                  : "hover:bg-blue-100/60 text-gray-700"
              }`}
              onClick={() => setSelected(section.key as typeof selected)}>
              <section.icon className="w-5 h-5" />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20 text-xs text-gray-500">
          AIudex Admin &copy; 2024
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-gradient-to-br from-white/80 via-blue-50/60 to-green-50/60">
        {/* Header/Topbar */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Painel de gestão e métricas do sistema
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationCenter />
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Configurações">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-gray-700">Administrador</span>
          </div>
        </div>
        {/* Conteúdo principal */}
        <div className="px-8 pb-8">
          {selected === "gestao" && (
            <div className="space-y-6">
              <NotificationStats />
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-blue-700">
                  Gestão Administrativa e de Usuários
                </h2>
                <RealUserManagement />
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-blue-700">
                  Logs e Histórico de Atividades
                </h2>
                <ActivityLogs />
              </div>
            </div>
          )}

          {selected === "comercial" && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-green-700">
                  Dashboard Financeiro
                </h2>
                <FinancialDashboard />
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-green-700">
                  Gestão de Assinaturas e Pagamentos
                </h2>
                <SubscriptionManagement />
              </div>
            </div>
          )}

          {selected === "marketing" && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">
                  Campanhas de Marketing
                </h2>
                <MarketingCampaigns />
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">
                  Funil de Vendas
                </h2>
                <SalesFunnel />
              </div>
            </div>
          )}

          {selected === "relatorios" && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">
                  Gerador de Relatórios Avançados
                </h2>
                <ReportGenerator />
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">
                  Relatórios Gerados
                </h2>
                <ReportViewer />
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">
                  Analytics e Métricas
                </h2>
                <AnalyticsReports />
              </div>
            </div>
          )}

          {selected === "operacoes" && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-green-700">
                  Gerenciamento de Backup
                </h2>
                <BackupManager />
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-green-700">
                  Logs de Auditoria
                </h2>
                <AuditLogs />
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-green-700">
                  Operações Técnicas
                </h2>
                <TechnicalOperations />
              </div>
            </div>
          )}

          {selected === "seguranca" && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
              <SecurityCompliance />
            </div>
          )}

          {selected === "ia" && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
              <AIMonitoring />
            </div>
          )}
        </div>
      </main>

      {/* Painel de Configurações */}
      <AdminSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default AdminDashboard;
