"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { HeaderCredits } from "@/components/HeaderCredits";
import NotificationCenter from "./NotificationCenter";
import { useNavigation } from "@/hooks/useNavigation";

import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Bot,
  FileSearch,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Zap,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Wrench,
  Gavel,
  MessageSquare,
  RefreshCw,
  Megaphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { paymentService } from "@/lib/payment-service";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [fadeKey, setFadeKey] = useState(pathname);
  const [expandedMobileSubmenu, setExpandedMobileSubmenu] = useState<
    string | null
  >(null);

  const hasPremiumAccess = paymentService.hasPremiumAccess();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      description: "Visão geral do sistema",
      badge: null,
    },
    {
      icon: FileText,
      label: "Peças Jurídicas",
      href: "/editor",
      description: "Criar documentos com IA",
      badge: "AI",
    },
    {
      icon: Wrench,
      label: "Central Jurídica+",
      href: null,
      description: "Funcionalidades avançadas do sistema",
      badge: null,
      children: [
        {
          icon: Users,
          label: "Bots Jurídicos",
          href: "/agentes-juridicos",
          description: "Assistentes jurídicos inteligentes",
        },
        {
          icon: MessageSquare,
          label: "Análise de Documentos",
          href: "/interacao-doc",
          description:
            "Análise e extração de informações de documentos jurídicos",
        },
        {
          icon: RefreshCw,
          label: "Reescrever Texto",
          href: "/reescrever-texto",
          description: "Reescrita de textos jurídicos",
        },
        {
          icon: Wrench,
          label: "Kanban Jurídico",
          href: "/kanban",
          description: "Painel visual de tarefas, prazos e timesheet",
        },
      ],
    },
    {
      icon: FileSearch,
      label: "Documentos",
      href: "/documents",
      description: "Gerenciar documentos",
      badge: null,
    },
    {
      icon: Users,
      label: "Clientes",
      href: "/clients",
      description: "Gestão de clientes",
      badge: null,
    },
    ...(hasPremiumAccess
      ? [
          // Removido Assistente IA
        ]
      : []),
    {
      icon: Calendar,
      label: "Agenda",
      href: "/calendar",
      description: "Calendário e prazos",
      badge: null,
    },
    {
      icon: BarChart3,
      label: "Relatórios",
      href: "/analytics",
      description: "Análises e métricas",
      badge: null,
    },
    {
      icon: Settings,
      label: "Configurações",
      href: "/settings",
      description: "Configurações do sistema",
      badge: null,
    },
  ];

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileSubmenu(null);
  };

  const handleNavigation = (href: string) => {
    if (href && href !== pathname) {
      setIsMobileMenuOpen(false);
      setExpandedMobileSubmenu(null);
      navigate(href);
    }
  };

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case "AI":
        return <Zap className="w-3 h-3" />;
      case "Pro":
        return <Crown className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case "AI":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg";
      case "Premium":
        return "bg-gradient-to-r from-yellow-300 to-yellow-600 text-yellow-900 font-bold border border-yellow-400 shadow-md px-3";
      default:
        return "";
    }
  };

  // Previne scroll quando menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setFadeKey(pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/80 via-blue-400/70 to-green-400/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-500/90 to-green-500/90 bg-clip-text text-transparent">
                AIudex
              </span>
            </div>
          </div>

          {/* Credits Display */}
          <div className="flex items-center space-x-2">
            <HeaderCredits />
            <NotificationCenter />
          </div>

          {/* User Avatar & Menu Button */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400/80 to-green-400/80 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative z-[101]"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}>
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span
                  className={`absolute w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45" : "-translate-y-1.5"
                  }`}></span>
                <span
                  className={`absolute w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}></span>
                <span
                  className={`absolute w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45" : "translate-y-1.5"
                  }`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`border-r border-gray-200/50 dark:border-gray-700/50 hidden lg:flex transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? "w-16" : "w-80"
        }`}
        style={{ transitionProperty: "width, background, box-shadow" }}>
        <div className="bg-gradient-to-b from-blue-50/30 via-blue-100/20 to-green-50/30 dark:from-blue-900/20 dark:via-blue-800/15 dark:to-green-900/20 backdrop-blur-sm shadow-xl w-full">
          <div
            className={`h-full flex flex-col transition-all duration-500 ${
              isSidebarCollapsed ? "p-3" : "p-6"
            }`}>
            {/* Logo Section */}
            <div
              className={`flex items-center space-x-3 mb-10 group ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/80 via-blue-400/70 to-green-400/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 rounded-full border border-white"></div>
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-500/90 to-green-500/90 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-green-600 transition-all duration-300">
                    AIudex
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                    Plataforma Jurídica
                  </p>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`mb-4 transition-all duration-300 ${
                isSidebarCollapsed
                  ? "w-full justify-center"
                  : "w-full justify-end"
              } hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg`}>
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              {!isSidebarCollapsed && (
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-3 flex items-center space-x-2">
                  <div className="w-1 h-1 bg-gradient-to-r from-blue-400/70 to-green-400/70 rounded-full"></div>
                  <span>Navegação</span>
                  <div className="w-1 h-1 bg-gradient-to-r from-blue-400/70 to-green-400/70 rounded-full"></div>
                </div>
              )}
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                if (item.children) {
                  const [open, setOpen] = useState(false);
                  const submenuRef = useRef(null);
                  useEffect(() => {
                    if (isSidebarCollapsed && open) setOpen(false);
                  }, [isSidebarCollapsed, open]);
                  return (
                    <div key={item.label} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSidebarCollapsed) {
                            setIsSidebarCollapsed(false);
                            setTimeout(() => setOpen(true), 350);
                          } else {
                            setOpen((prev) => !prev);
                          }
                        }}
                        className={`group relative flex items-center transition-all duration-300 text-sm transform hover:scale-[1.02] w-full
                          ${
                            isSidebarCollapsed
                              ? "justify-center px-2 py-3 rounded-xl"
                              : "space-x-3 px-4 py-3 rounded-xl"
                          }
                          ${
                            open
                              ? "bg-gradient-to-r from-blue-400/15 to-green-400/15 text-blue-600 dark:text-blue-300 font-medium shadow-lg border border-blue-200/40 dark:border-blue-800/40"
                              : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white hover:shadow-md"
                          }
                        `}
                        style={{ alignItems: "center" }}>
                        <Icon
                          className={`w-4 h-4 transition-all duration-500`}
                        />
                        {!isSidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                        {!isSidebarCollapsed && (
                          <span
                            className={`ml-auto transition-transform duration-300 ${
                              open ? "rotate-90" : ""
                            }`}>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                        {isSidebarCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </button>
                      <div
                        ref={submenuRef}
                        style={{
                          maxHeight:
                            open && !isSidebarCollapsed
                              ? `${item.children.length * 44 + 8}px`
                              : "0px",
                          opacity: open && !isSidebarCollapsed ? 1 : 0,
                          transition:
                            "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s",
                          overflow: "hidden",
                          background:
                            open && !isSidebarCollapsed
                              ? "rgba(236, 245, 255, 0.7)"
                              : "transparent",
                          borderRadius: "0.5rem",
                          boxShadow:
                            open && !isSidebarCollapsed
                              ? "0 2px 8px 0 rgba(34,197,94,0.08)"
                              : "none",
                          marginLeft: !isSidebarCollapsed ? "2rem" : 0,
                          marginTop: open && !isSidebarCollapsed ? "0.5rem" : 0,
                        }}>
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`group flex items-center space-x-2 px-4 py-3 rounded-xl text-sm transition-all duration-300
                                ${
                                  isChildActive
                                    ? "bg-gradient-to-r from-blue-400/15 to-green-400/15 text-blue-600 dark:text-blue-300 font-medium shadow-lg border border-blue-200/40 dark:border-blue-800/40"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-blue-900/30 hover:text-gray-900 dark:hover:text-white hover:shadow-md"
                                }
                              `}
                              style={{
                                opacity: open && !isSidebarCollapsed ? 1 : 0,
                                transform:
                                  open && !isSidebarCollapsed
                                    ? "translateY(0)"
                                    : "translateY(-10px)",
                                transition: "opacity 0.3s, transform 0.3s",
                              }}
                              tabIndex={0}>
                              <ChildIcon className="w-4 h-4" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`group relative flex items-center transition-all duration-300 text-sm transform hover:scale-[1.02] w-full ${
                      isSidebarCollapsed
                        ? "justify-center px-2 py-3 rounded-xl"
                        : "space-x-3 px-4 py-3 rounded-xl"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-blue-400/15 to-green-400/15 text-blue-600 dark:text-blue-300 font-medium shadow-lg border border-blue-200/40 dark:border-blue-800/40"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white hover:shadow-md"
                    }`}>
                    {/* Active indicator */}
                    {isActive && !isSidebarCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400/80 to-green-400/80 rounded-r-full shadow-lg"></div>
                    )}
                    <Icon
                      className={`w-4 h-4 transition-all duration-500 ${
                        !isSidebarCollapsed ? "mr-2" : ""
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${getBadgeColor(
                                item.badge
                              )} transform group-hover:scale-105 transition-transform duration-200`}>
                              {getBadgeIcon(item.badge)}
                              <span>{item.badge}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                          {item.description}
                        </p>
                      </div>
                    )}
                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1 text-purple-300">
                            ({item.badge})
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="mt-auto pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              {!isSidebarCollapsed ? (
                <>
                  <div className="bg-gradient-to-r from-blue-50/60 to-green-50/60 dark:from-blue-900/15 dark:to-green-900/15 rounded-xl p-4 mb-4 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400/80 to-green-400/80 rounded-full flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition-all duration-300">
                          {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {user?.oabNumber}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 text-amber-500 fill-current animate-pulse" />
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            Premium
                          </span>
                          <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Credits Display */}
                    <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                      <HeaderCredits />
                    </div>

                    {/* Notification Center */}
                    <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                      <NotificationCenter />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm rounded-lg transition-all duration-300 group transform hover:scale-[1.02]">
                    <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-all duration-300 group-hover:shadow-md">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="ml-3">Sair da Conta</span>
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  {/* User Avatar Only */}
                  <div className="relative group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400/80 to-green-400/80 rounded-full flex items-center justify-center text-white font-semibold shadow-md mx-auto hover:shadow-lg transition-all duration-300 cursor-pointer">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>

                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {user?.name}
                      <div className="text-purple-300">Premium</div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 group transform hover:scale-[1.02] p-2">
                    <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-all duration-300 group-hover:shadow-md">
                      <LogOut className="w-4 h-4" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Sair da Conta
                    </div>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed left-0 right-0 top-16 bottom-0 bg-white dark:bg-slate-900 z-[95] shadow-xl transition-transform duration-300 ease-in-out transform ${
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!isMobileMenuOpen}>
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* Navigation */}
            <nav className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-3 flex items-center space-x-2">
                <div className="w-1 h-1 bg-gradient-to-r from-blue-400/70 to-green-400/70 rounded-full"></div>
                <span>Navegação</span>
                <div className="w-1 h-1 bg-gradient-to-r from-blue-400/70 to-green-400/70 rounded-full"></div>
              </div>

              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                if (item.children) {
                  const isExpanded = expandedMobileSubmenu === item.label;
                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() =>
                          setExpandedMobileSubmenu(
                            isExpanded ? null : item.label
                          )
                        }
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="text-left">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href;
                            return (
                              <button
                                key={child.href}
                                onClick={() => handleNavigation(child.href)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                                  isChildActive
                                    ? "bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 text-blue-600 dark:text-blue-400"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                }`}>
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isChildActive
                                      ? "bg-blue-200 dark:bg-blue-800/50"
                                      : "bg-gray-100 dark:bg-gray-700"
                                  }`}>
                                  <ChildIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {child.label}
                                  </span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {child.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`flex items-center space-x-3 px-4 py-4 rounded-xl transition-colors group w-full text-left ${
                      isActive
                        ? "bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 text-blue-600 dark:text-blue-400"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${getBadgeColor(
                              item.badge
                            )}`}>
                            {getBadgeIcon(item.badge)}
                            <span>{item.badge}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile User Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {user?.oabNumber}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Premium
                    </span>
                    <Sparkles className="w-3 h-3 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Credits Display */}
              <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <HeaderCredits />
              </div>

              {/* Notification Center */}
              <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <NotificationCenter />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 group py-3">
              <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-all duration-300">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="ml-3 font-medium">Sair da Conta</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 transition-all duration-300 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
