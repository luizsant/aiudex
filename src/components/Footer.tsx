import { Bot, Mail, Phone, MapPin, Zap, Cpu } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 opacity-20 animate-pulse"></div>
                <Bot className="w-6 h-6 text-white relative z-10" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                AIudex
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              O futuro da advocacia com inteligência artificial avançada.
              Automatize peças, gerencie processos e revolucione sua prática
              jurídica.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-blue-400" />
              Produto
            </h4>
            <div className="space-y-3">
              <a
                href="#"
                className="block text-slate-400 hover:text-white transition-colors">
                Funcionalidades
              </a>
              <a
                href="#"
                className="block text-slate-400 hover:text-white transition-colors">
                Preços
              </a>
              <a
                href="#"
                className="block text-slate-400 hover:text-white transition-colors">
                Integrações
              </a>
              <a
                href="#"
                className="block text-slate-400 hover:text-white transition-colors">
                API
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-green-400" />
              Suporte
            </h4>
            <div className="space-y-3">
              <a
                href="#"
                className="block text-slate-400 hover:text-white transition-colors">
                Central de Ajuda
              </a>
              <a
                href="#"
                className="block text-slate-400 hover:text-white transition-colors">
                Documentação
              </a>
              <a
                href="#"
                className="block text-slate-400 hover:text-white transition-colors">
                Tutoriais
              </a>
              <a
                href="#"
                className="block text-slate-400 hover:text-white transition-colors">
                Status do Sistema
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <Bot className="w-4 h-4 mr-2 text-blue-400" />
              Contato
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-slate-400">contato@aiudex.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400" />
                <span className="text-slate-400">(11) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span className="text-slate-400">São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 AIudex. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-slate-400 hover:text-white text-sm transition-colors">
                Política de Privacidade
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white text-sm transition-colors">
                Termos de Uso
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white text-sm transition-colors">
                LGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
