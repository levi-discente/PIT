"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import useAPI from "@/hooks/useAPI";
import { useUser } from "@/contexts/UserContext";
import { User } from "@/types/user";

const ProfilePage = () => {
  const router = useRouter();
  const { httpGet, httpPut, httpDelete } = useAPI();
  const { id: userId, clearUser } = useUser();

  const [profile, setProfile] = useState<User>({
    id: 0,
    name: "",
    email: "",
    password: "",
    role: "docente",
    created_at: "",
    updated_at: "",
  });
  const [password, setPassword] = useState("");

  // Carrega o perfil do usuário logado via API
  useEffect(() => {
    if (!userId) return;
    httpGet<User>(`/users/${userId}`)
      .then((data) => setProfile(data))
      .catch((err) => console.error("Falha ao carregar perfil", err));
  }, [httpGet, userId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Usuário não autenticado.");
      return;
    }
    // Payload para atualizar: se senha for informada, envia-a; caso contrário, ignora.
    const updatePayload = {
      name: profile.name,
      email: profile.email,
      password: password || profile.password,
    };
    try {
      const updated = await httpPut(`/users/${userId}`, updatePayload);
      setProfile(updated);
      setPassword("");
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Falha ao atualizar perfil", error);
      alert("Falha ao atualizar perfil");
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Tem certeza que deseja deletar sua conta? Essa ação é irreversível."
      )
    ) {
      try {
        await httpDelete(`/users/${userId}`);
        alert("Conta deletada com sucesso!");
        clearUser();
        router.push("/");
      } catch (error) {
        console.error("Falha ao deletar conta", error);
        alert("Falha ao deletar conta");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Perfil</h2>

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-2">
            Nome
          </label>
          <Input
            type="text"
            id="name"
            placeholder="Digite seu nome"
            value={profile.name}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
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
            value={profile.email}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Nova Senha
          </label>
          <Input
            type="password"
            id="password"
            placeholder="Digite sua nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full mb-2">
          Atualizar Perfil
        </Button>

        <Button
          type="button"
          className="w-full bg-red-500 text-white hover:bg-red-600"
          onClick={handleDelete}
        >
          Deletar Conta
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;