"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import useAPI from "@/hooks/useAPI";

const LoginPage = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const { httpPost } = useAPI();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await httpPost("/Auth/login", {
        email: formData.email,
        password: formData.senha,
      });

      const userId = (data as { id: number }).id;
      const role = (data as { role: "free" | "premium" }).role;

      setUser(userId, role);
      router.push("/pits");
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Falha ao efetuar login. Verifique suas credenciais.");
    }
  };

  const navigateToCadastro = () => {
    router.push("/cadastro");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            id="email"
            placeholder="Digite seu email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="mb-6">
          <label htmlFor="senha" className="block text-gray-700 mb-2">
            Senha
          </label>
          <Input
            type="password"
            id="senha"
            placeholder="Digite sua senha"
            value={formData.senha}
            onChange={(e) =>
              setFormData({ ...formData, senha: e.target.value })
            }
          />
        </div>

        <Button type="submit" className="w-full mb-2">
          Entrar
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">Não tem uma conta?</span>
          <button
            type="button"
            onClick={navigateToCadastro}
            className="ml-2 text-sm text-blue-600 hover:underline"
          >
            Cadastre-se
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
