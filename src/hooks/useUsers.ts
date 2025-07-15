import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  planId: string;
  oabNumber?: string;
  firm?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  plan?: {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
  };
  subscription?: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    stripeSubscriptionId?: string;
  };
  _count?: {
    documents: number;
    creditsUsage: number;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
  planId?: string;
  status?: string;
  oabNumber?: string;
  firm?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  planId?: string;
  status?: string;
  oabNumber?: string;
  firm?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("legalai_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData): Promise<User | null> => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar usuário");
      }

      const data = await response.json();
      const newUser = data.user;

      setUsers((prev) => [...prev, newUser]);
      toast.success("Usuário criado com sucesso!");

      return newUser;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar usuário";
      toast.error(errorMessage);
      return null;
    }
  };

  const updateUser = async (
    userId: string,
    userData: UpdateUserData
  ): Promise<User | null> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar usuário");
      }

      const data = await response.json();
      const updatedUser = data.user;

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );
      toast.success("Usuário atualizado com sucesso!");

      return updatedUser;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar usuário";
      toast.error(errorMessage);
      return null;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir usuário");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("Usuário excluído com sucesso!");

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao excluir usuário";
      toast.error(errorMessage);
      return false;
    }
  };

  const updateUserStatus = async (
    userId: string,
    status: string
  ): Promise<User | null> => {
    return updateUser(userId, { status });
  };

  const resetUserPassword = async (userId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao resetar senha");
      }

      const data = await response.json();
      toast.success(`Senha temporária: ${data.tempPassword}`);

      return data.tempPassword;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao resetar senha";
      toast.error(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetUserPassword,
  };
}
