"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useNavigation = () => {
  const router = useRouter();

  const navigate = useCallback(
    (href: string) => {
      try {
        // Navegação imediata sem delay para melhor responsividade
        router.push(href);
      } catch (error) {
        console.error("Erro na navegação:", error);
      }
    },
    [router]
  );

  return { navigate };
};
