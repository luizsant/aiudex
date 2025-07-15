"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const ContactButton = ({
  variant = "default",
  size = "default",
  className = "",
}: ContactButtonProps) => {
  const handleWhatsApp = () => {
    const message =
      "Olá! Gostaria de saber mais sobre o AIudex e agendar uma demonstração.";
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePhone = () => {
    window.open("tel:+5511999999999", "_self");
  };

  const handleEmail = () => {
    const subject = "Interesse no AIudex";
    const body =
      "Olá! Gostaria de saber mais sobre o AIudex e suas funcionalidades.";
    window.open(
      `mailto:contato@legalai.pro?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`,
      "_self"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Falar com Vendas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleWhatsApp} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePhone} className="cursor-pointer">
          <Phone className="w-4 h-4 mr-2 text-blue-600" />
          Telefone
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmail} className="cursor-pointer">
          <Mail className="w-4 h-4 mr-2 text-gray-600" />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContactButton;
