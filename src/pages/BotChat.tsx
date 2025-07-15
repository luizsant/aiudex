import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Send,
  Paperclip,
  FileText,
  Image,
  Download,
  Trash2,
  Plus,
  MessageSquare,
  Bot,
  Shield,
  Users,
  Gavel,
  Scale,
  BookOpen,
  Zap,
  MessageCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  botChatService,
  BotMessage,
  BotConversation,
} from "@/lib/bot-chat-service";

// Função para processar formatação Markdown
function processMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **negrito** -> <strong>
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // *itálico* -> <em>
    .replace(/__(.*?)__/g, "<u>$1</u>") // __sublinhado__ -> <u>
    .replace(/~~(.*?)~~/g, "<del>$1</del>") // ~~tachado~~ -> <del>
    .replace(/`([^`]+)`/g, "<code>$1</code>") // `código` -> <code>
    .replace(/^### (.*$)/gm, "<h3>$1</h3>") // ### título -> <h3>
    .replace(/^## (.*$)/gm, "<h2>$1</h2>") // ## título -> <h2>
    .replace(/^# (.*$)/gm, "<h1>$1</h1>") // # título -> <h1>
    .replace(/^- (.*$)/gm, "<li>$1</li>") // - item -> <li>
    .replace(/\n\n/g, "<br><br>") // Quebras de linha duplas
    .replace(/\n/g, "<br>"); // Quebras de linha simples
}

// Ícones para cada área do direito
const areaIcons: Record<string, React.ReactElement> = {
  "Direito do Consumidor": <Shield className="w-6 h-6" />,
  "Direito Previdenciário": <Users className="w-6 h-6" />,
  "Direito Trabalhista": <Gavel className="w-6 h-6" />,
  "Direito Administrativo": <Scale className="w-6 h-6" />,
  "Direito Tributário": <BookOpen className="w-6 h-6" />,
  "Direito Empresarial": <Zap className="w-6 h-6" />,
  "Direito Civil": <MessageSquare className="w-6 h-6" />,
  "Direito Constitucional": <Bot className="w-6 h-6" />,
};

// Cores para cada área do direito
const areaColors: Record<string, string> = {
  "Direito do Consumidor": "from-blue-500 to-cyan-500",
  "Direito Previdenciário": "from-green-500 to-emerald-500",
  "Direito Trabalhista": "from-orange-500 to-amber-500",
  "Direito Administrativo": "from-indigo-500 to-purple-500",
  "Direito Tributário": "from-red-500 to-pink-500",
  "Direito Empresarial": "from-violet-500 to-purple-500",
  "Direito Civil": "from-teal-500 to-cyan-500",
  "Direito Constitucional": "from-pink-500 to-rose-500",
};

// Componente de bolinhas animadas para digitação
function TypingDots() {
  return (
    <span className="inline-flex gap-2">
      <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-bounce [animation-delay:-0.2s] shadow-lg border border-white/50"></span>
      <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-bounce [animation-delay:0s] shadow-lg border border-white/50"></span>
      <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-bounce [animation-delay:0.2s] shadow-lg border border-white/50"></span>
    </span>
  );
}

// Componente de upload de arquivo
function FileUpload({
  onFileChange,
  isExtracting,
  uploadingFile,
}: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExtracting: boolean;
  uploadingFile: File | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,image/*"
        onChange={onFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleFileClick}
        disabled={isExtracting}
        className="rounded-full px-3 py-2 border-2 border-blue-300/50 bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 transition-all duration-300 transform hover:scale-105">
        <Paperclip className="w-4 h-4" />
      </Button>
      {uploadingFile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-full border border-blue-200">
          {uploadingFile.name.endsWith(".pdf") && (
            <FileText className="w-4 h-4 text-blue-600" />
          )}
          {uploadingFile.name.match(/\.(jpg|jpeg|png|gif)$/i) && (
            <Image className="w-4 h-4 text-blue-600" />
          )}
          {uploadingFile.name.endsWith(".docx") && (
            <FileText className="w-4 h-4 text-blue-600" />
          )}
          <span className="text-sm text-blue-700 font-medium truncate max-w-32">
            {uploadingFile.name}
          </span>
          {isExtracting && (
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BotChat() {
  const params = useParams();
  const router = useRouter();
  const areaId = params?.areaId as string;
  const botConfig = botChatService.getBotConfig(areaId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversas salvas em localStorage
  const [convs, setConvs] = useState<BotConversation[]>(() => {
    if (typeof window !== "undefined") {
      const loaded = botChatService.loadConversations(areaId);
      return loaded.length > 0
        ? loaded
        : [
            {
              id: Date.now(),
              title: "Nova conversa",
              lastMsg: "0 mensagens",
              messages: [],
            },
          ];
    }
    return [
      {
        id: Date.now(),
        title: "Nova conversa",
        lastMsg: "0 mensagens",
        messages: [],
      },
    ];
  });

  const [currentConv, setCurrentConv] = useState<BotConversation>(() => {
    const initialConvs =
      convs.length > 0
        ? convs
        : [
            {
              id: Date.now(),
              title: "Nova conversa",
              lastMsg: "0 mensagens",
              messages: [],
            },
          ];
    return initialConvs[0];
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Atualiza localStorage sempre que convs mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      botChatService.saveConversation(areaId, currentConv);
    }
  }, [currentConv, areaId]);

  // Garantir que currentConv sempre tenha um valor válido
  useEffect(() => {
    if (
      convs.length > 0 &&
      (!currentConv || !convs.find((c) => c.id === currentConv.id))
    ) {
      setCurrentConv(convs[0]);
    }
  }, [convs, currentConv]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConv.messages]);

  function handleNewConv() {
    const newConv: BotConversation = {
      id: Date.now(),
      title: "Nova conversa",
      lastMsg: "0 mensagens",
      messages: [
        {
          id: Date.now().toString(),
          from: "bot",
          text: `Olá! Eu sou um assistente jurídico especializado em ${botConfig.area}. ${botConfig.desc} Como posso ajudar?`,
          time: "agora",
        },
      ],
    };

    setConvs([newConv, ...convs]);
    setCurrentConv(newConv);
  }

  function handleDeleteConv(id: number) {
    botChatService.deleteConversation(areaId, id);
    const filtered = convs.filter((c) => c.id !== id);
    setConvs(filtered);
    if (currentConv.id === id && filtered.length > 0) {
      setCurrentConv(filtered[0]);
    } else if (filtered.length === 0) {
      handleNewConv();
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() && !uploadingFile) return;

    const userMessage: BotMessage = {
      id: Date.now().toString(),
      from: "user",
      text: inputValue,
      time: "agora",
    };

    // Adicionar mensagem do usuário
    const updatedMessages = [...currentConv.messages, userMessage];
    const updatedConv = { ...currentConv, messages: updatedMessages };
    setCurrentConv(updatedConv);
    setInputValue("");
    setIsTyping(true);

    try {
      let botResponse = "";

      if (uploadingFile) {
        // Processar arquivo
        botResponse = await botChatService.processFile(
          areaId,
          uploadingFile,
          inputValue
        );
        setUploadingFile(null);
      } else {
        // Processar mensagem de texto
        botResponse = await botChatService.sendMessage(
          areaId,
          inputValue,
          updatedMessages
        );
      }

      const botMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        from: "bot",
        text: botResponse,
        time: "agora",
      };

      const finalMessages = [...updatedMessages, botMessage];
      const finalConv = {
        ...updatedConv,
        messages: finalMessages,
        lastMsg: `${finalMessages.length} mensagens`,
      };

      setCurrentConv(finalConv);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        from: "bot",
        text: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        time: "agora",
      };

      const finalMessages = [...updatedMessages, errorMessage];
      const finalConv = {
        ...updatedConv,
        messages: finalMessages,
        lastMsg: `${finalMessages.length} mensagens`,
      };

      setCurrentConv(finalConv);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(file);
    setIsExtracting(true);

    try {
      // Simular processamento de arquivo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const botResponse = await botChatService.processFile(
        areaId,
        file,
        "Analise este documento"
      );

      const userMessage: BotMessage = {
        id: Date.now().toString(),
        from: "user",
        text: `Enviei o arquivo: ${file.name}`,
        time: "agora",
      };

      const botMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        from: "bot",
        text: botResponse,
        time: "agora",
      };

      const updatedMessages = [
        ...currentConv.messages,
        userMessage,
        botMessage,
      ];
      const updatedConv = {
        ...currentConv,
        messages: updatedMessages,
        lastMsg: `${updatedMessages.length} mensagens`,
      };

      setCurrentConv(updatedConv);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
    } finally {
      setUploadingFile(null);
      setIsExtracting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Verificação de segurança */}
      {!currentConv && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando conversa...</p>
          </div>
        </div>
      )}

      {currentConv && (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 shadow-lg">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  className="text-white p-2 mr-2 hover:bg-white/30 transition-all duration-300 rounded-full"
                  onClick={() => router.back()}>
                  <X className="w-6 h-6" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${
                      areaColors[botConfig.area]
                    } rounded-xl flex items-center justify-center shadow-lg`}>
                    {areaIcons[botConfig.area]}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{botConfig.area}</h1>
                    <p className="text-white/80 text-sm">{botConfig.desc}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {botConfig.features.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Lista de Conversas */}
              <div className="lg:col-span-1">
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-800">
                        Conversas
                      </h2>
                      <Button
                        onClick={handleNewConv}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {convs.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                            currentConv.id === conv.id
                              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {conv.title}
                              </p>
                              <p className="text-xs opacity-75 truncate">
                                {conv.lastMsg}
                              </p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConv(conv.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Chat Principal */}
              <div className="lg:col-span-3">
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg h-[600px] flex flex-col">
                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {currentConv.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.from === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}>
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
                            message.from === "user"
                              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: processMarkdown(message.text),
                            }}
                          />
                          <p className="text-xs opacity-75 mt-2">
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl shadow-lg">
                          <TypingDots />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200/50">
                    <form
                      onSubmit={handleSend}
                      className="flex items-center space-x-3">
                      <FileUpload
                        onFileChange={handleFileChange}
                        isExtracting={isExtracting}
                        uploadingFile={uploadingFile}
                      />
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1"
                        disabled={isTyping}
                      />
                      <Button
                        type="submit"
                        disabled={
                          isTyping || (!inputValue.trim() && !uploadingFile)
                        }
                        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white">
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
