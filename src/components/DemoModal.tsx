"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, X } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui integraria com sistema de agendamento real
    console.log("Demo solicitada:", { name, email });
    alert("Demo agendada! Entraremos em contato em breve.");
    onClose();
    setEmail("");
    setName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-blue-600" />
            <span>Agendar Demonstração</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-slate-600">
            Veja como o AIudex pode revolucionar sua prática jurídica. Nossa
            equipe fará uma demonstração personalizada para você.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="demo-name">Nome Completo</Label>
              <Input
                id="demo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="demo-email">Email Profissional</Label>
              <Input
                id="demo-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                O que você verá na demonstração:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Geração automática de peças processuais</li>
                <li>• Assistente IA especializado em direito</li>
                <li>• CRM jurídico integrado</li>
                <li>• Gestão de prazos e processos</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button type="submit" className="flex-1">
                Agendar Demonstração
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal;
