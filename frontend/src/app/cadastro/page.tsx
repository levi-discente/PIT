"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

import { UserCreate } from "@/types/user";
import useAPI from "@/hooks/useAPI";

const CadastroPage = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const { httpPost } = useAPI();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    role: "free",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      alert("As senhas não conferem!");
      return;
    }

    const userPayload: UserCreate = {
      name: formData.nome,
      email: formData.email,
      password: formData.senha,
      role: "free",
    };

    try {
      const data = await httpPost("/users", userPayload);
      const userId = (data as { id: number }).id;
      console.log("Usuário cadastrado:", data);

      // Atualiza o contexto com o id e o role (docente ou discente)
      setUser(userId, formData.role as "free" | "premium");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Falha ao cadastrar usuário");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Cadastro</h2>

        <div className="mb-4">
          <label htmlFor="nome" className="block text-gray-700 mb-2">
            Nome
          </label>
          <Input
            type="text"
            id="nome"
            placeholder="Digite seu nome"
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
          />
        </div>

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

        <div className="mb-4">
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

        <div className="mb-6">
          <label htmlFor="confirmarSenha" className="block text-gray-700 mb-2">
            Confirmar Senha
          </label>
          <Input
            type="password"
            id="confirmarSenha"
            placeholder="Confirme sua senha"
            value={formData.confirmarSenha}
            onChange={(e) =>
              setFormData({ ...formData, confirmarSenha: e.target.value })
            }
          />
        </div>

        <Button type="submit" className="w-full">
          Cadastrar
        </Button>
      </form>
    </div>
  );
};

export default CadastroPage;
