import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Building,
  Bell,
  Shield,
  Palette,
  FileText,
  Upload,
  Save,
  Eye,
  Download,
  Image,
  Trash2,
  X,
  Settings as SettingsIcon,
  FileCheck,
  Sun,
  Moon,
  Target,
  CreditCard,
  Crown,
  Star,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getOfficeConfig,
  saveOfficeConfig,
  OfficeConfig,
} from "@/lib/document-service";
import { getTestUser } from "@/lib/test-data";
import { PageHeader } from "@/components/PageHeader";
import { useThemeToggle } from "@/hooks/use-theme";
import { useTemplateSettings } from "@/hooks/use-template-settings";
import { useCredits } from "@/hooks/useCredits";
import TemplatePreview from "@/components/TemplatePreview";
import { formatCPF, formatPhone } from "@/lib/validations";
import { paymentService, PaymentPlan } from "@/lib/payment-service";

const Settings = () => {
  const { theme, toggleTheme, isLight, isDark, mounted } = useThemeToggle();
  const {
    settings: templateSettings,
    updateSetting,
    saveSettings,
  } = useTemplateSettings();
  const { credits, stats, updateUserPlan } = useCredits();

  // Estados para gerenciamento de plano
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    address: "",
    specialty: "",
    bio: "",
  });

  const [firmData, setFirmData] = useState({
    name: "Silva & Associados",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    cep: "01234-567",
    phone: "(11) 3333-4444",
    email: "contato@silvaadvocacia.com",
  });

  // Configurações do escritório para automação
  const [officeConfig, setOfficeConfig] = useState<OfficeConfig>({
    lawyerName: "Dr. [NOME DO ADVOGADO]",
    oabNumber: "[NÚMERO]",
    oabState: "SP",
    officeAddress: "[ENDEREÇO DO ESCRITÓRIO]",
    officePhone: "(11) 99999-9999",
    officeEmail: "contato@escritorio.com",
    officeWebsite: "www.escritorio.com",
    officeCnpj: "12.345.678/0001-90",
    officeName: "Escritório de Advocacia",
    officeCity: "São Paulo",
    officeCep: "01234-567",
    officeComplement: "",
    officeNeighborhood: "Centro",
    officeNumber: "123",
    officeStreet: "Rua das Flores",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    deadlines: true,
    newClients: false,
    reports: true,
    marketing: false,
  });

  // Estados para personalização
  const [brandingSettings, setBrandingSettings] = useState({
    logo: null as string | null,
    header: null as string | null,
    footer: null as string | null,
    includeHeader: true,
    includeFooter: true,
    headerHeight: "3cm",
    footerHeight: "2cm",
    headerAlignment: "center" as "left" | "center" | "right",
    footerAlignment: "center" as "left" | "center" | "right",
    headerMargin: "0",
    footerMargin: "0",
    headerWidth: "500",
    headerHeightImg: "100",
    footerWidth: "500",
    footerHeightImg: "80",
    headerDistance: "1.25",
    footerDistance: "1.25",
    headerIndentLeft: "0",
    headerIndentTop: "0",
    footerIndentLeft: "0",
    footerIndentBottom: "0",
  });

  // Refs para os inputs de arquivo
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados do usuário logado
  useEffect(() => {
    const currentUser = localStorage.getItem("legalai_user");
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);

        // Função para determinar o título (Dr./Dra.) baseado no nome
        const getLawyerTitle = (name: string): string => {
          // Se o nome já começa com Dr. ou Dra., retorna como está
          if (name.startsWith("Dr. ") || name.startsWith("Dra. ")) {
            return name;
          }

          // Lista de nomes femininos comuns para determinar Dra.
          const femaleNames = [
            "ana",
            "maria",
            "juliana",
            "camila",
            "fernanda",
            "patricia",
            "sandra",
            "lucia",
            "carla",
            "adriana",
            "vanessa",
            "daniela",
            "gabriela",
            "amanda",
            "carolina",
            "beatriz",
            "leticia",
            "mariana",
            "isabela",
            "sofia",
            "valentina",
            "laura",
            "clara",
            "alice",
            "helena",
            "luisa",
            "manuela",
            "cecilia",
            "agatha",
            "elisa",
            "lorena",
            "mirella",
            "melissa",
            "yasmin",
            "isabella",
            "rafaela",
            "giovanna",
            "sarah",
            "julia",
            "nicole",
            "victoria",
            "barbara",
            "debora",
            "elaine",
            "fatima",
            "gisele",
            "hilda",
            "irene",
            "josefa",
            "karen",
            "lilian",
            "marcia",
            "nadia",
            "olga",
            "paula",
            "quenia",
            "rosa",
            "silvia",
            "tatiana",
            "ursula",
            "vera",
            "wanda",
            "xenia",
            "yara",
            "zenaida",
          ];

          // Extrair o primeiro nome (antes do espaço)
          const firstName = name.toLowerCase().split(" ")[0];

          // Verificar se é um nome feminino
          if (femaleNames.includes(firstName)) {
            return `Dra. ${name}`;
          }

          // Padrão: usar Dr. para nomes masculinos ou não identificados
          return `Dr. ${name}`;
        };

        // Carregar dados pessoais do usuário logado
        setProfileData({
          name: getLawyerTitle(userData.name),
          email: userData.email,
          cpf: userData.cpf || "",
          phone: userData.phone || "",
          address: userData.address || "",
          specialty: "",
          bio: "",
        });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }
  }, []);

  // Carregar configurações do escritório
  useEffect(() => {
    const loadOfficeConfig = async () => {
      const config = await getOfficeConfig();

      // Obter usuário logado para usar como padrão
      const currentUser = localStorage.getItem("legalai_user");
      let loggedInUser = null;

      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          loggedInUser = getTestUser(userData.email);
        } catch (error) {
          console.error("Erro ao obter usuário logado:", error);
        }
      }

      // Se não há configuração salva e há usuário logado, usar o nome do usuário
      if (!localStorage.getItem("legalai_office_config") && loggedInUser) {
        // Função para determinar o título (Dr./Dra.) baseado no nome
        const getLawyerTitle = (name: string): string => {
          // Se o nome já começa com Dr. ou Dra., retorna como está
          if (name.startsWith("Dr. ") || name.startsWith("Dra. ")) {
            return name;
          }

          // Lista de nomes femininos comuns para determinar Dra.
          const femaleNames = [
            "ana",
            "maria",
            "juliana",
            "camila",
            "fernanda",
            "patricia",
            "sandra",
            "lucia",
            "carla",
            "adriana",
            "vanessa",
            "daniela",
            "gabriela",
            "amanda",
            "carolina",
            "beatriz",
            "leticia",
            "mariana",
            "isabela",
            "sofia",
            "valentina",
            "laura",
            "clara",
            "alice",
            "helena",
            "luisa",
            "manuela",
            "cecilia",
            "agatha",
            "elisa",
            "lorena",
            "mirella",
            "melissa",
            "yasmin",
            "isabella",
            "rafaela",
            "giovanna",
            "sarah",
            "julia",
            "nicole",
            "victoria",
            "barbara",
            "debora",
            "elaine",
            "fatima",
            "gisele",
            "hilda",
            "irene",
            "josefa",
            "karen",
            "lilian",
            "marcia",
            "nadia",
            "olga",
            "paula",
            "quenia",
            "rosa",
            "silvia",
            "tatiana",
            "ursula",
            "vera",
            "wanda",
            "xenia",
            "yara",
            "zenaida",
          ];

          // Extrair o primeiro nome (antes do espaço)
          const firstName = name.toLowerCase().split(" ")[0];

          // Verificar se é um nome feminino
          if (femaleNames.includes(firstName)) {
            return `Dra. ${name}`;
          }

          // Padrão: usar Dr. para nomes masculinos ou não identificados
          return `Dr. ${name}`;
        };

        config.lawyerName = getLawyerTitle(loggedInUser.name);
      }

      setOfficeConfig(config);
    };

    loadOfficeConfig();
  }, []);

  // Carregar dados da assinatura atual
  useEffect(() => {
    const subscription = paymentService.getCurrentSubscription();
    setCurrentSubscription(subscription);
  }, []);

  const handleSave = async (section: string) => {
    if (section === "documentos") {
      // Salvar configurações de template usando o hook
      const success = await saveSettings(templateSettings);
      if (success) {
        toast.success(`Configurações de ${section} salvas com sucesso!`);
      } else {
        toast.error(`Erro ao salvar configurações de ${section}.`);
      }
    } else {
      toast.success(`Configurações de ${section} salvas com sucesso!`);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    // Aplicar formatação automática
    let formattedValue = value;
    if (field === "cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "phone") {
      formattedValue = formatPhone(value);
    }

    setProfileData((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handleFirmChange = (field: string, value: string) => {
    setFirmData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOfficeConfigChange = (
    field: keyof OfficeConfig,
    value: string
  ) => {
    setOfficeConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveOfficeConfig = async () => {
    const success = await saveOfficeConfig(officeConfig);
    if (success) {
      toast.success("Configurações do escritório salvas com sucesso!");
      toast.info(
        "As configurações serão aplicadas automaticamente nos templates de automação."
      );
    } else {
      toast.error("Erro ao salvar configurações do escritório.");
    }
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    updateSetting(field as any, value);
  };

  // Funções para gerenciar upload de imagens
  const handleImageUpload = (
    type: "logo" | "header" | "footer",
    file: File
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBrandingSettings((prev) => ({ ...prev, [type]: result }));
        toast.success(
          `${
            type === "logo"
              ? "Logo"
              : type === "header"
              ? "Cabeçalho"
              : "Rodapé"
          } carregado com sucesso!`
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type: "logo" | "header" | "footer") => {
    setBrandingSettings((prev) => ({ ...prev, [type]: null }));
    toast.success(
      `${
        type === "logo" ? "Logo" : type === "header" ? "Cabeçalho" : "Rodapé"
      } removido com sucesso!`
    );
  };

  const handleBrandingChange = (field: string, value: string | boolean) => {
    setBrandingSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveBrandingSettings = () => {
    try {
      localStorage.setItem(
        "legalai_branding",
        JSON.stringify(brandingSettings)
      );
      toast.success("Configurações de branding salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações de branding.");
    }
  };

  // Carregar configurações de branding ao inicializar
  useEffect(() => {
    const savedBranding = localStorage.getItem("legalai_branding");
    if (savedBranding) {
      try {
        setBrandingSettings((prev) => ({
          ...prev,
          ...JSON.parse(savedBranding),
        }));
      } catch (error) {
        console.error(
          "Erro ao carregar configurações de personalização:",
          error
        );
      }
    }
  }, []);

  // Funções para gerenciamento de plano
  const handleUpgradePlan = async () => {
    if (!selectedPlan) {
      toast.error("Selecione um plano");
      return;
    }

    setIsProcessing(true);
    try {
      // Simular processamento de upgrade
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Atualizar plano no sistema
      updateUserPlan(selectedPlan);

      // Atualizar assinatura
      const newSubscription = {
        id: `SUB_${Date.now()}`,
        planId: selectedPlan,
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        paymentMethod: "credit_card",
      };

      setCurrentSubscription(newSubscription);
      localStorage.setItem(
        "legalai_subscription",
        JSON.stringify(newSubscription)
      );

      toast.success("Plano atualizado com sucesso!");
      setShowUpgradeModal(false);
      setSelectedPlan("");
    } catch (error) {
      toast.error("Erro ao atualizar plano. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      // Simular processamento de cancelamento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Atualizar status da assinatura
      const updatedSubscription = {
        ...currentSubscription,
        status: "cancelled",
        autoRenew: false,
      };

      setCurrentSubscription(updatedSubscription);
      localStorage.setItem(
        "legalai_subscription",
        JSON.stringify(updatedSubscription)
      );

      toast.success("Assinatura cancelada com sucesso!");
      setShowCancelModal(false);
    } catch (error) {
      toast.error("Erro ao cancelar assinatura. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanInfo = (planId: string) => {
    const plans = paymentService.getPlans();
    return plans.find((plan) => plan.id === planId);
  };

  const getPlanIcon = (priority: string) => {
    switch (priority) {
      case "free":
        return <Star className="w-5 h-5" />;
      case "basic":
        return <Zap className="w-5 h-5" />;
      case "pro":
        return <Crown className="w-5 h-5" />;
      case "enterprise":
        return <Users className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getPlanColor = (priority: string) => {
    switch (priority) {
      case "free":
        return "bg-gray-100 text-gray-700";
      case "basic":
        return "bg-blue-100 text-blue-700";
      case "pro":
        return "bg-purple-100 text-purple-700";
      case "enterprise":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Configurações"
        subtitle="Personalize sua experiência na AIudex"
        icon={<SettingsIcon className="w-5 h-5 md:w-6 md:h-6" />}
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        <Tabs defaultValue="perfil" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger
              value="perfil"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-md transition-all duration-200">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger
              value="escritorio"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-md transition-all duration-200">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Escritório</span>
            </TabsTrigger>
            <TabsTrigger
              value="plano"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-md transition-all duration-200">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Meu Plano</span>
            </TabsTrigger>
            <TabsTrigger
              value="notificacoes"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-md transition-all duration-200">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger
              value="documentos"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-md transition-all duration-200">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
            <TabsTrigger
              value="branding"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-md transition-all duration-200">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger
              value="aparencia"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-md transition-all duration-200">
              <Sun className="w-4 h-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger
              value="seguranca"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-md transition-all duration-200">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Dados Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={profileData.cpf}
                      onChange={(e) =>
                        handleProfileChange("cpf", e.target.value)
                      }
                      placeholder="000.000.000-00"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      placeholder="(11) 99999-9999"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      handleProfileChange("address", e.target.value)
                    }
                    placeholder="Rua, número, bairro, cidade - UF"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select
                    value={profileData.specialty}
                    onValueChange={(value) =>
                      handleProfileChange("specialty", value)
                    }>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direito Civil">
                        Direito Civil
                      </SelectItem>
                      <SelectItem value="Direito Penal">
                        Direito Penal
                      </SelectItem>
                      <SelectItem value="Direito Trabalhista">
                        Direito Trabalhista
                      </SelectItem>
                      <SelectItem value="Direito Empresarial">
                        Direito Empresarial
                      </SelectItem>
                      <SelectItem value="Direito de Família">
                        Direito de Família
                      </SelectItem>
                      <SelectItem value="Direito Tributário">
                        Direito Tributário
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={() => handleSave("perfil")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="escritorio" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Configurações do Escritório</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Configure os dados do escritório que serão usados nos
                  templates de documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Dados do Advogado */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Dados do Advogado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="lawyerName">Nome do Advogado *</Label>
                      <Input
                        id="lawyerName"
                        value={officeConfig.lawyerName}
                        onChange={(e) =>
                          handleOfficeConfigChange("lawyerName", e.target.value)
                        }
                        placeholder="Dr. João Silva"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="oabNumber">Número OAB *</Label>
                      <Input
                        id="oabNumber"
                        value={officeConfig.oabNumber}
                        onChange={(e) =>
                          handleOfficeConfigChange("oabNumber", e.target.value)
                        }
                        placeholder="123.456"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="oabState">Estado OAB *</Label>
                      <Select
                        value={officeConfig.oabState}
                        onValueChange={(value) =>
                          handleOfficeConfigChange("oabState", value)
                        }>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">
                            Rio Grande do Norte
                          </SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Dados do Escritório */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Dados do Escritório
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="officeName">Nome do Escritório</Label>
                      <Input
                        id="officeName"
                        value={officeConfig.officeName}
                        onChange={(e) =>
                          handleOfficeConfigChange("officeName", e.target.value)
                        }
                        placeholder="Silva & Associados"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeCnpj">CNPJ</Label>
                      <Input
                        id="officeCnpj"
                        value={officeConfig.officeCnpj}
                        onChange={(e) =>
                          handleOfficeConfigChange("officeCnpj", e.target.value)
                        }
                        placeholder="12.345.678/0001-90"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officePhone">Telefone</Label>
                      <Input
                        id="officePhone"
                        value={officeConfig.officePhone}
                        onChange={(e) =>
                          handleOfficeConfigChange(
                            "officePhone",
                            e.target.value
                          )
                        }
                        placeholder="(11) 99999-9999"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeEmail">E-mail</Label>
                      <Input
                        id="officeEmail"
                        value={officeConfig.officeEmail}
                        onChange={(e) =>
                          handleOfficeConfigChange(
                            "officeEmail",
                            e.target.value
                          )
                        }
                        placeholder="contato@escritorio.com"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeWebsite">Website</Label>
                      <Input
                        id="officeWebsite"
                        value={officeConfig.officeWebsite}
                        onChange={(e) =>
                          handleOfficeConfigChange(
                            "officeWebsite",
                            e.target.value
                          )
                        }
                        placeholder="www.escritorio.com"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeCep">CEP</Label>
                      <Input
                        id="officeCep"
                        value={officeConfig.officeCep}
                        onChange={(e) =>
                          handleOfficeConfigChange("officeCep", e.target.value)
                        }
                        placeholder="01234-567"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço Detalhado */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Endereço Detalhado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="officeStreet">Logradouro</Label>
                      <Input
                        id="officeStreet"
                        value={officeConfig.officeStreet}
                        onChange={(e) =>
                          handleOfficeConfigChange(
                            "officeStreet",
                            e.target.value
                          )
                        }
                        placeholder="Rua das Flores"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeNumber">Número</Label>
                      <Input
                        id="officeNumber"
                        value={officeConfig.officeNumber}
                        onChange={(e) =>
                          handleOfficeConfigChange(
                            "officeNumber",
                            e.target.value
                          )
                        }
                        placeholder="123"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeComplement">Complemento</Label>
                      <Input
                        id="officeComplement"
                        value={officeConfig.officeComplement}
                        onChange={(e) =>
                          handleOfficeConfigChange(
                            "officeComplement",
                            e.target.value
                          )
                        }
                        placeholder="Sala 101"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeNeighborhood">Bairro</Label>
                      <Input
                        id="officeNeighborhood"
                        value={officeConfig.officeNeighborhood}
                        onChange={(e) =>
                          handleOfficeConfigChange(
                            "officeNeighborhood",
                            e.target.value
                          )
                        }
                        placeholder="Centro"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeCity">Cidade</Label>
                      <Input
                        id="officeCity"
                        value={officeConfig.officeCity}
                        onChange={(e) =>
                          handleOfficeConfigChange("officeCity", e.target.value)
                        }
                        placeholder="São Paulo"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Endereço Completo (para compatibilidade) */}
                  <div className="mt-4">
                    <Label htmlFor="officeAddress">
                      Endereço Completo (Automático)
                    </Label>
                    <Input
                      id="officeAddress"
                      value={officeConfig.officeAddress}
                      onChange={(e) =>
                        handleOfficeConfigChange(
                          "officeAddress",
                          e.target.value
                        )
                      }
                      placeholder="Endereço completo do escritório"
                      className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Este campo é preenchido automaticamente com base nos dados
                      detalhados acima
                    </p>
                  </div>
                </div>

                {/* Variáveis Disponíveis */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Variáveis Disponíveis para Templates
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      Use estas variáveis nos seus templates de documentos:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{nome}}"}
                        </code>{" "}
                        - Nome do advogado
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{advogado}}"}
                        </code>{" "}
                        - Nome do advogado
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{oab}}"}
                        </code>{" "}
                        - Número OAB
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{estado}}"}
                        </code>{" "}
                        - Estado OAB
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{escritorio}}"}
                        </code>{" "}
                        - Nome do escritório
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{telefone}}"}
                        </code>{" "}
                        - Telefone do escritório
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{email}}"}
                        </code>{" "}
                        - Email do escritório
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{cnpj}}"}
                        </code>{" "}
                        - CNPJ do escritório
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{assinatura_completa}}"}
                        </code>{" "}
                        - Assinatura completa
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200">
                          {"{{oab_completa}}"}
                        </code>{" "}
                        - OAB completa
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveOfficeConfig}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plano" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Meu Plano e Créditos</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Gerencie seu plano de assinatura e acompanhe o uso de créditos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Status do Plano Atual */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Plano Atual
                  </h3>

                  {credits ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-700">
                            Plano
                          </span>
                          <Badge
                            variant={
                              credits.planId === "pro" ||
                              credits.planId === "enterprise"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              credits.planId === "pro" ||
                              credits.planId === "enterprise"
                                ? "bg-blue-600"
                                : "bg-gray-500"
                            }>
                            {credits.planId === "free" && "Gratuito"}
                            {credits.planId === "basic" && "Básico"}
                            {credits.planId === "pro" && "Profissional"}
                            {credits.planId === "enterprise" && "Empresarial"}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                          {credits.planId === "free" && "R$ 0/mês"}
                          {credits.planId === "basic" && "R$ 29/mês"}
                          {credits.planId === "pro" && "R$ 79/mês"}
                          {credits.planId === "enterprise" && "R$ 199/mês"}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          {credits.planId === "free" && "Acesso limitado"}
                          {credits.planId === "basic" && "Acesso básico"}
                          {credits.planId === "pro" && "Acesso completo"}
                          {credits.planId === "enterprise" &&
                            "Acesso empresarial"}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-700">
                            Créditos
                          </span>
                          <Badge
                            variant="outline"
                            className="border-green-300 text-green-700">
                            {credits.maxCredits === -1
                              ? "Ilimitado"
                              : `${credits.currentCredits}/${credits.maxCredits}`}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                          {credits.currentCredits}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          {credits.maxCredits === -1
                            ? "Sem limite de uso"
                            : `${
                                credits.maxCredits - credits.currentCredits
                              } utilizados este mês`}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-700">
                            Status
                          </span>
                          <Badge
                            variant={
                              currentSubscription?.status === "active"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              currentSubscription?.status === "active"
                                ? "bg-green-600"
                                : "bg-red-600"
                            }>
                            {currentSubscription?.status === "active" &&
                              "Ativo"}
                            {currentSubscription?.status === "cancelled" &&
                              "Cancelado"}
                            {currentSubscription?.status === "expired" &&
                              "Expirado"}
                            {!currentSubscription && "Sem assinatura"}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">
                          {currentSubscription?.status === "active"
                            ? "Ativo"
                            : "Inativo"}
                        </p>
                        <p className="text-sm text-purple-600 mt-1">
                          {currentSubscription?.autoRenew
                            ? "Renovação automática"
                            : "Renovação manual"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">
                        Carregando informações do plano...
                      </p>
                    </div>
                  )}
                </div>

                {/* Informações da Assinatura */}
                {currentSubscription && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Detalhes da Assinatura
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Período da Assinatura
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Início:{" "}
                          {new Date(
                            currentSubscription.startDate
                          ).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Fim:{" "}
                          {new Date(
                            currentSubscription.endDate
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Método de Pagamento
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {currentSubscription.paymentMethod ===
                            "credit_card" && "Cartão de Crédito"}
                          {currentSubscription.paymentMethod === "pix" && "PIX"}
                          {currentSubscription.paymentMethod === "boleto" &&
                            "Boleto Bancário"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Histórico de Uso */}
                {credits && credits.usageHistory.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Histórico Recente
                    </h3>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <div className="divide-y divide-gray-200">
                          {credits.usageHistory
                            .slice(-10)
                            .reverse()
                            .map((usage) => (
                              <div
                                key={usage.id}
                                className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {usage.description}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {usage.date.toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge
                                      variant="outline"
                                      className="text-xs">
                                      {usage.creditsUsed} crédito
                                      {usage.creditsUsed !== 1 ? "s" : ""}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações do Plano */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gerenciar Plano
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSubscription?.status === "active" ? (
                      <>
                        <Button
                          onClick={() => setShowUpgradeModal(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                          <ArrowUp className="w-4 h-4 mr-2" />
                          Alterar Plano
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setShowCancelModal(true)}
                          className="w-full border-red-300 text-red-700 hover:bg-red-50 font-medium px-6 py-3 rounded-lg transition-colors">
                          <X className="w-4 h-4 mr-2" />
                          Cancelar Assinatura
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Assinar Plano
                      </Button>
                    )}
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">
                        Sobre os Créditos
                      </p>
                      <p className="text-blue-700">
                        Os créditos são renovados mensalmente no primeiro dia do
                        mês. Planos ilimitados não possuem restrição de uso.
                        Créditos não utilizados não são acumulados para o
                        próximo mês.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modal de Upgrade/Downgrade */}
          <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Alterar Plano</span>
                </DialogTitle>
                <DialogDescription>
                  Escolha um novo plano para sua assinatura. As alterações
                  entrarão em vigor imediatamente.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentService.getPlans().map((plan) => (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? "ring-2 ring-blue-500 border-blue-500"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getPlanIcon(plan.priority)}
                            <span className="font-semibold">{plan.name}</span>
                          </div>
                          <Badge className={getPlanColor(plan.priority)}>
                            {plan.priority}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold mb-2">
                          R$ {plan.price.toFixed(2).replace(".", ",")}
                          <span className="text-sm font-normal text-gray-500">
                            /mês
                          </span>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{plan.features.length - 3} recursos adicionais
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpgradePlan}
                  disabled={!selectedPlan || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Confirmar Alteração
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Cancelamento */}
          <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Cancelar Assinatura</span>
                </DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja cancelar sua assinatura? Você perderá
                  acesso aos recursos premium.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-900 mb-1">Atenção</p>
                      <p className="text-red-700">
                        Ao cancelar sua assinatura, você:
                      </p>
                      <ul className="text-red-700 mt-2 space-y-1">
                        <li>• Perderá acesso aos recursos premium</li>
                        <li>• Será rebaixado para o plano gratuito</li>
                        <li>• Manterá seus dados salvos</li>
                        <li>• Poderá reativar a qualquer momento</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}>
                  Manter Assinatura
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  variant="destructive">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Confirmar Cancelamento
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <TabsContent value="notificacoes" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Preferências de Notificação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações por E-mail</Label>
                    <p className="text-sm text-gray-600">
                      Receber notificações importantes por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(value) =>
                      handleNotificationChange("email", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas de Prazo</Label>
                    <p className="text-sm text-gray-600">
                      Notificações sobre prazos próximos
                    </p>
                  </div>
                  <Switch
                    checked={notifications.deadlines}
                    onCheckedChange={(value) =>
                      handleNotificationChange("deadlines", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Novos Clientes</Label>
                    <p className="text-sm text-gray-600">
                      Notificações sobre novos clientes cadastrados
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newClients}
                    onCheckedChange={(value) =>
                      handleNotificationChange("newClients", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Relatórios Semanais</Label>
                    <p className="text-sm text-gray-600">
                      Receber relatórios de desempenho semanalmente
                    </p>
                  </div>
                  <Switch
                    checked={notifications.reports}
                    onCheckedChange={(value) =>
                      handleNotificationChange("reports", value)
                    }
                  />
                </div>
                <Button
                  onClick={() => handleSave("notificações")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Configurações de Documentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultFont">Fonte Padrão</Label>
                    <Select
                      value={templateSettings.defaultFont}
                      onValueChange={(value) =>
                        handleTemplateChange("defaultFont", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Times New Roman">
                          Times New Roman
                        </SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Calibri">Calibri</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Book Antiqua">
                          Book Antiqua
                        </SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fontSize">Tamanho da Fonte</Label>
                    <Select
                      value={templateSettings.fontSize}
                      onValueChange={(value) =>
                        handleTemplateChange("fontSize", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10pt</SelectItem>
                        <SelectItem value="11">11pt</SelectItem>
                        <SelectItem value="12">12pt</SelectItem>
                        <SelectItem value="14">14pt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lineSpacing">Espaçamento de Linha</Label>
                    <Select
                      value={templateSettings.lineSpacing}
                      onValueChange={(value) =>
                        handleTemplateChange("lineSpacing", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.0">Simples</SelectItem>
                        <SelectItem value="1.5">1.5 linhas</SelectItem>
                        <SelectItem value="2.0">Duplo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paragraphSpacing">
                      Espaçamento entre Parágrafos
                    </Label>
                    <Select
                      value={templateSettings.paragraphSpacing}
                      onValueChange={(value) =>
                        handleTemplateChange("paragraphSpacing", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">Compacto (0.5)</SelectItem>
                        <SelectItem value="1.0">Normal (1.0)</SelectItem>
                        <SelectItem value="1.5">Amplo (1.5)</SelectItem>
                        <SelectItem value="2.0">Muito Amplo (2.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="margins">Margens</Label>
                    <Select
                      value={templateSettings.margins}
                      onValueChange={(value) =>
                        handleTemplateChange("margins", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2.0cm">2.0 cm</SelectItem>
                        <SelectItem value="2.5cm">2.5 cm</SelectItem>
                        <SelectItem value="3.0cm">3.0 cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="numberedParagraphs">
                      Numeração de Parágrafos
                    </Label>
                    <Select
                      value={
                        templateSettings.numberedParagraphs ? "true" : "false"
                      }
                      onValueChange={(value) =>
                        handleTemplateChange(
                          "numberedParagraphs",
                          value === "true"
                        )
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Sem numeração</SelectItem>
                        <SelectItem value="true">
                          Parágrafos numerados
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="chapterNumbering">
                      Numeração de Capítulos
                    </Label>
                    <Select
                      value={templateSettings.chapterNumbering}
                      onValueChange={(value) =>
                        handleTemplateChange("chapterNumbering", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem numeração</SelectItem>
                        <SelectItem value="integer">
                          Números inteiros (1, 2, 3)
                        </SelectItem>
                        <SelectItem value="unit">
                          Com unidade (1.1, 1.2, 2.1)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="firstLineIndent">
                      Recuo de Primeira Linha
                    </Label>
                    <Select
                      value={templateSettings.firstLineIndent}
                      onValueChange={(value) =>
                        handleTemplateChange("firstLineIndent", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.25cm">1.25 cm (ABNT)</SelectItem>
                        <SelectItem value="1.5cm">1.5 cm</SelectItem>
                        <SelectItem value="2.0cm">2.0 cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="jurisprudenceIndent">
                      Recuo de Jurisprudência
                    </Label>
                    <Select
                      value={templateSettings.jurisprudenceIndent}
                      onValueChange={(value) =>
                        handleTemplateChange("jurisprudenceIndent", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3.0cm">3.0 cm</SelectItem>
                        <SelectItem value="4.0cm">4.0 cm (Padrão)</SelectItem>
                        <SelectItem value="5.0cm">5.0 cm</SelectItem>
                        <SelectItem value="6.0cm">6.0 cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Configurações de Análise de Documentos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Configurações de Análise de Documentos
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defaultAnalysisType">
                        Tipo de Análise Padrão
                      </Label>
                      <Select
                        value={
                          templateSettings.defaultAnalysisType || "completa"
                        }
                        onValueChange={(value) =>
                          handleTemplateChange("defaultAnalysisType", value)
                        }>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resumo">
                            Resumo Executivo
                          </SelectItem>
                          <SelectItem value="pontos">
                            Pontos Críticos
                          </SelectItem>
                          <SelectItem value="recomendacoes">
                            Recomendações
                          </SelectItem>
                          <SelectItem value="completa">
                            Análise Completa
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="defaultDepth">Profundidade Padrão</Label>
                      <Select
                        value={templateSettings.defaultDepth || "intermediaria"}
                        onValueChange={(value) =>
                          handleTemplateChange("defaultDepth", value)
                        }>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basica">Básica</SelectItem>
                          <SelectItem value="intermediaria">
                            Intermediária
                          </SelectItem>
                          <SelectItem value="avancada">Avançada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="defaultOutputFormat">
                        Formato de Saída Padrão
                      </Label>
                      <Select
                        value={
                          templateSettings.defaultOutputFormat || "estruturado"
                        }
                        onValueChange={(value) =>
                          handleTemplateChange("defaultOutputFormat", value)
                        }>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="texto">Texto Livre</SelectItem>
                          <SelectItem value="estruturado">
                            Estruturado
                          </SelectItem>
                          <SelectItem value="bullet">Tópicos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="defaultAIModel">
                        Modelo de IA Padrão
                      </Label>
                      <Select
                        value={templateSettings.defaultAIModel || "gemini"}
                        onValueChange={(value) =>
                          handleTemplateChange("defaultAIModel", value)
                        }>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini">
                            🤖 Gemini (Google)
                          </SelectItem>
                          <SelectItem value="deepseek">
                            ⚡ DeepSeek (Local)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="defaultAreas">
                      Áreas do Direito Padrão
                    </Label>
                    <div className="mt-2 space-y-2">
                      {[
                        "Civil",
                        "Trabalhista",
                        "Tributário",
                        "Penal",
                        "Administrativo",
                        "Constitucional",
                        "Empresarial",
                        "Ambiental",
                      ].map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={`area-${area}`}
                            checked={
                              templateSettings.defaultAreas?.includes(area) ||
                              false
                            }
                            onCheckedChange={(checked) => {
                              const currentAreas =
                                templateSettings.defaultAreas || [];
                              const newAreas = checked
                                ? [...currentAreas, area]
                                : currentAreas.filter((a) => a !== area);
                              handleTemplateChange("defaultAreas", newAreas);
                            }}
                          />
                          <Label
                            htmlFor={`area-${area}`}
                            className="text-sm font-medium">
                            {area}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jurisprudenceFontSize">
                      Tamanho da Fonte da Jurisprudência
                    </Label>
                    <Select
                      value={templateSettings.jurisprudenceFontSize}
                      onValueChange={(value) =>
                        handleTemplateChange("jurisprudenceFontSize", value)
                      }>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8pt</SelectItem>
                        <SelectItem value="9">9pt</SelectItem>
                        <SelectItem value="10">10pt (Padrão)</SelectItem>
                        <SelectItem value="11">11pt</SelectItem>
                        <SelectItem value="12">12pt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Incluir Marca D'água</Label>
                    <p className="text-sm text-gray-600">
                      Adicionar marca d'água com o nome do escritório
                    </p>
                  </div>
                  <Switch
                    checked={templateSettings.includeWatermark}
                    onCheckedChange={(value) =>
                      handleTemplateChange("includeWatermark", value)
                    }
                  />
                </div>
                <Button
                  onClick={() => handleSave("documentos")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>

            {/* Preview das Configurações */}
            <TemplatePreview />
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Palette className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Personalização de Documentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Logo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Logo do Escritório
                      </Label>
                      <p className="text-sm text-gray-600">
                        Logo exibido na interface (não incluído nos documentos)
                      </p>
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload("logo", e.target.files[0]);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-md transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                  {brandingSettings.logo && (
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <img
                        src={brandingSettings.logo}
                        alt="Logo"
                        className="w-16 h-16 object-contain"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Logo carregado</p>
                        <p className="text-xs text-gray-500">
                          Clique para visualizar
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveImage("logo")}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Cabeçalho */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Cabeçalho dos Documentos
                      </Label>
                      <p className="text-sm text-gray-600">
                        Imagem incluída no topo de todos os documentos gerados
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={brandingSettings.includeHeader}
                        onCheckedChange={(value) =>
                          handleBrandingChange("includeHeader", value)
                        }
                      />
                      <input
                        ref={headerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload("header", e.target.files[0]);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => headerInputRef.current?.click()}
                        disabled={!brandingSettings.includeHeader}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-60">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Cabeçalho
                      </Button>
                    </div>
                  </div>

                  {/* Bloco de preview e remoção da imagem */}
                  {brandingSettings.header && (
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <img
                        src={brandingSettings.header}
                        alt="Cabeçalho"
                        className="w-full h-20 object-contain"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveImage("header")}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Controles de configuração do cabeçalho - sempre visíveis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div>
                      <Label className="text-sm font-medium">Alinhamento</Label>
                      <Select
                        value={brandingSettings.headerAlignment}
                        onValueChange={(value) =>
                          handleBrandingChange(
                            "headerAlignment",
                            value as "left" | "center" | "right"
                          )
                        }>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Margem (px)</Label>
                      <Input
                        value={brandingSettings.headerMargin}
                        onChange={(e) =>
                          handleBrandingChange("headerMargin", e.target.value)
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Largura (px)
                      </Label>
                      <Input
                        value={brandingSettings.headerWidth}
                        onChange={(e) =>
                          handleBrandingChange("headerWidth", e.target.value)
                        }
                        placeholder="500"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Altura (px)</Label>
                      <Input
                        value={brandingSettings.headerHeightImg}
                        onChange={(e) =>
                          handleBrandingChange(
                            "headerHeightImg",
                            e.target.value
                          )
                        }
                        placeholder="100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Distância do topo (cm)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={1.25}
                        step={0.01}
                        value={brandingSettings.headerDistance || "1.25"}
                        onChange={(e) =>
                          handleBrandingChange("headerDistance", e.target.value)
                        }
                        placeholder="1.25"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Recuo à esquerda (cm)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={brandingSettings.headerIndentLeft || "0"}
                        onChange={(e) =>
                          handleBrandingChange(
                            "headerIndentLeft",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Recuo do topo (cm)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={brandingSettings.headerIndentTop || "0"}
                        onChange={(e) =>
                          handleBrandingChange(
                            "headerIndentTop",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rodapé */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Rodapé dos Documentos
                      </Label>
                      <p className="text-sm text-gray-600">
                        Imagem incluída no final de todos os documentos gerados
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={brandingSettings.includeFooter}
                        onCheckedChange={(value) =>
                          handleBrandingChange("includeFooter", value)
                        }
                      />
                      <input
                        ref={footerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload("footer", e.target.files[0]);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => footerInputRef.current?.click()}
                        disabled={!brandingSettings.includeFooter}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-60">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Rodapé
                      </Button>
                    </div>
                  </div>

                  {/* Bloco de preview e remoção da imagem */}
                  {brandingSettings.footer && (
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <img
                        src={brandingSettings.footer}
                        alt="Rodapé"
                        className="w-full h-16 object-contain"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveImage("footer")}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Controles de configuração do rodapé - sempre visíveis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div>
                      <Label className="text-sm font-medium">Alinhamento</Label>
                      <Select
                        value={brandingSettings.footerAlignment}
                        onValueChange={(value) =>
                          handleBrandingChange(
                            "footerAlignment",
                            value as "left" | "center" | "right"
                          )
                        }>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Margem (px)</Label>
                      <Input
                        value={brandingSettings.footerMargin}
                        onChange={(e) =>
                          handleBrandingChange("footerMargin", e.target.value)
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Largura (px)
                      </Label>
                      <Input
                        value={brandingSettings.footerWidth}
                        onChange={(e) =>
                          handleBrandingChange("footerWidth", e.target.value)
                        }
                        placeholder="500"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Altura (px)</Label>
                      <Input
                        value={brandingSettings.footerHeightImg}
                        onChange={(e) =>
                          handleBrandingChange(
                            "footerHeightImg",
                            e.target.value
                          )
                        }
                        placeholder="80"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Distância da base (cm)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={1.25}
                        step={0.01}
                        value={brandingSettings.footerDistance || "1.25"}
                        onChange={(e) =>
                          handleBrandingChange("footerDistance", e.target.value)
                        }
                        placeholder="1.25"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Recuo à esquerda (cm)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={brandingSettings.footerIndentLeft || "0"}
                        onChange={(e) =>
                          handleBrandingChange(
                            "footerIndentLeft",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Recuo do rodapé para cima (cm)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={brandingSettings.footerIndentBottom || "0"}
                        onChange={(e) =>
                          handleBrandingChange(
                            "footerIndentBottom",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Preview do Documento
                  </Label>
                  <div className="border rounded-lg p-4 bg-white border border-gray-200">
                    <div className="space-y-4">
                      {brandingSettings.includeHeader &&
                        brandingSettings.header && (
                          <div className="border-b pb-2">
                            <img
                              src={brandingSettings.header}
                              alt="Cabeçalho Preview"
                              className="w-full h-16 object-contain"
                            />
                          </div>
                        )}

                      <div className="p-4 bg-gray-50 rounded border border-gray-200">
                        <h3 className="font-semibold mb-2 text-gray-900">
                          Conteúdo do Documento
                        </h3>
                        <p className="text-sm text-gray-600">
                          Este é um exemplo de como o documento ficará com as
                          configurações atuais. O conteúdo real será inserido
                          aqui quando você gerar documentos.
                        </p>
                      </div>

                      {brandingSettings.includeFooter &&
                        brandingSettings.footer && (
                          <div className="border-t pt-2">
                            <img
                              src={brandingSettings.footer}
                              alt="Rodapé Preview"
                              className="w-full h-12 object-contain"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={saveBrandingSettings}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações de Personalização
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Sun className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Configurações de Aparência</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Personalize a aparência da aplicação conforme sua preferência
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Tema */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900">
                      Tema da Aplicação
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Escolha entre o tema claro ou escuro para a interface
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-white border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {mounted && isLight ? (
                          <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Moon className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {mounted && isLight ? "Tema Claro" : "Tema Escuro"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {mounted && isLight
                              ? "Interface com fundo claro e texto escuro"
                              : "Interface com fundo escuro e texto claro"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={toggleTheme}
                      disabled={!mounted}
                      variant="outline"
                      className="min-w-[200px] transition-all duration-200 hover:scale-105">
                      {mounted && isLight ? (
                        <>
                          <Moon className="w-4 h-4 mr-2" />
                          Mudar para Escuro
                        </>
                      ) : (
                        <>
                          <Sun className="w-4 h-4 mr-2" />
                          Mudar para Claro
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-1">
                          Dica de Acessibilidade
                        </p>
                        <p className="text-gray-600">
                          O tema escuro pode reduzir a fadiga visual em
                          ambientes com pouca luz. O tema claro é ideal para
                          ambientes bem iluminados.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Alterar Senha</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Atualize sua senha para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="currentPassword"
                      className="text-sm font-medium text-gray-700">
                      Senha Atual
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Digite sua senha atual"
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="newPassword"
                      className="text-sm font-medium text-gray-700">
                      Nova Senha
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Digite sua nova senha"
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      A senha deve ter pelo menos 6 caracteres
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="confirmNewPassword"
                      className="text-sm font-medium text-gray-700">
                      Confirmar Nova Senha
                    </Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Confirme sua nova senha"
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                </div>

                <Separator />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">
                        Dicas de Segurança
                      </p>
                      <ul className="text-blue-700 space-y-1">
                        <li>
                          • Use uma senha forte com letras, números e símbolos
                        </li>
                        <li>• Não compartilhe sua senha com ninguém</li>
                        <li>• Evite usar a mesma senha em outros sites</li>
                        <li>• Altere sua senha regularmente</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
