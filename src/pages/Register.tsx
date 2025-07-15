import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  X,
  Phone,
  MapPin,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCPF, formatPhone } from "@/lib/validations";

// Componente para mostrar critérios de senha
const PasswordCriteria = ({ password }: { password: string }) => {
  const criteria = [
    { test: password.length >= 6, label: "Pelo menos 6 caracteres" },
    { test: /[A-Z]/.test(password), label: "Pelo menos uma letra maiúscula" },
    { test: /[a-z]/.test(password), label: "Pelo menos uma letra minúscula" },
    { test: /\d/.test(password), label: "Pelo menos um número" },
    {
      test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      label: "Pelo menos um caractere especial",
    },
  ];

  return (
    <div className="mt-2 space-y-1">
      {criteria.map((criterion, index) => (
        <div key={index} className="flex items-center text-sm">
          {criterion.test ? (
            <Check className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <X className="h-4 w-4 text-red-500 mr-2" />
          )}
          <span className={criterion.test ? "text-green-600" : "text-red-600"}>
            {criterion.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Aplicar formatação automática
    let formattedValue = value;
    if (name === "cpf") {
      formattedValue = formatCPF(value);
    } else if (name === "phone") {
      formattedValue = formatPhone(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Tentando registrar usuário:", {
      ...formData,
      password: "[HIDDEN]",
      confirmPassword: "[HIDDEN]",
    });

    if (formData.password !== formData.confirmPassword) {
      toast.error("Senhas não coincidem");
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      toast.success("Conta criada com sucesso! Bem-vindo ao AIudex!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      // O erro já é mostrado pelo AuthContext
      toast.error("Erro ao criar conta. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Criar Conta
          </CardTitle>
          <p className="text-gray-600 text-base">
            Junte-se à revolução da advocacia digital
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700">
                Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="cpf"
                  className="text-sm font-medium text-gray-700">
                  CPF
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-gray-700">
                Endereço Completo
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  placeholder="Rua, número, bairro, cidade - UF"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setShowPasswordCriteria(true)}
                    onBlur={() => setShowPasswordCriteria(false)}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="Sua senha"
                    required
                  />
                </div>
                {showPasswordCriteria && formData.password && (
                  <PasswordCriteria password={formData.password} />
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      Senhas não coincidem
                    </p>
                  )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Criar Conta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
