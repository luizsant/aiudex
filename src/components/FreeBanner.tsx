"use client";

import { Button } from "@/components/ui/button";
import { X, Zap, ArrowRight, Bot } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const FreeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-3 rounded-full shadow-2xl animate-pulse max-w-sm sm:max-w-md border border-white/20 backdrop-blur-sm">
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm sm:text-base whitespace-nowrap">
            7 DIAS GRÁTIS - SEM CARTÃO
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/register">
            <Button
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-xs px-3 py-1 h-auto shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              TESTAR
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 p-1 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeBanner;
