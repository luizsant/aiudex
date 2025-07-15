import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  ArrowLeft,
  Search,
  AlertTriangle,
  FileText,
  Bot,
  Users,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const commonRoutes = [
    { path: "/dashboard", name: "Dashboard", icon: Home },
    { path: "/documents", name: "Documentos", icon: FileText },
    { path: "/assistant", name: "Assistente IA", icon: Bot },
    { path: "/clients", name: "Clientes", icon: Users },
    { path: "/calendar", name: "Calendário", icon: Calendar },
    { path: "/analytics", name: "Analytics", icon: BarChart3 },
    { path: "/settings", name: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Ícone e título */}
            <div className="space-y-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Página não encontrada
                </h2>
                <p className="text-gray-600">
                  A página{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {location.pathname}
                  </code>{" "}
                  não existe ou foi movida.
                </p>
              </div>
            </div>

            {/* Rotas comuns */}
            {isAuthenticated && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Páginas disponíveis:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonRoutes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <Button
                        key={route.path}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                        onClick={() => navigate(route.path)}>
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{route.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>

              <Button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Ir para Home</span>
              </Button>

              {isAuthenticated && (
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="secondary"
                  className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>
                Se você acredita que esta página deveria existir, entre em
                contato com o suporte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
