"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import useAPI from "@/hooks/useAPI";
import { Pit, PitCreate, PitUpdate } from "@/types/pit";
import { useUser } from "@/contexts/UserContext";

export default function ManagePitsPage() {
  const { httpGet, httpPost, httpPut, httpDelete } = useAPI();
  const { id: userId } = useUser();
  const router = useRouter();

  const [pits, setPits] = useState<Pit[]>([]);
  const [formData, setFormData] = useState({
    semester: "",
    description: "",
    year: "",
  });
  const [editingPit, setEditingPit] = useState<Pit | null>(null);

  // Carrega os pits do usuário logado
  useEffect(() => {
    if (!userId) return;
    httpGet<Pit[]>("/pits")
      .then((data) => {
        const userPits = data.filter((pit) => pit.user_id === userId);
        setPits(userPits);
      })
      .catch((err) => console.error("Falha ao carregar pits", err));
  }, [httpGet, userId]);

  // Lida com o submit do formulário para criar ou atualizar um pit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Usuário não autenticado.");
      return;
    }

    if (editingPit) {
      // Atualiza pit existente
      const updatePayload: PitUpdate = {
        semester: formData.semester,
        description: formData.description,
        year: formData.year,
        updated_at: new Date().toISOString(),
      };
      try {
        const updated = await httpPut(`/pits/${editingPit.id}`, updatePayload);
        setPits((prev) =>
          prev.map((pit) => (pit.id === editingPit.id ? updated : pit))
        );
        setEditingPit(null);
        setFormData({ semester: "", description: "", year: "" });
      } catch (error) {
        console.error("Falha ao atualizar pit", error);
        alert("Falha ao atualizar pit");
      }
    } else {
      // Cria um novo pit
      const createPayload: PitCreate = {
        user_id: userId,
        semester: formData.semester,
        description: formData.description,
        year: formData.year,
      };
      try {
        const created = await httpPost("/pits", createPayload);
        setPits((prev) => [...prev, created]);
        setFormData({ semester: "", description: "", year: "" });
      } catch (error) {
        console.error("Falha ao criar pit", error);
        alert("Falha ao criar pit");
      }
    }
  };

  const handleEdit = (pit: Pit) => {
    setEditingPit(pit);
    setFormData({
      semester: pit.semester,
      description: pit.description,
      year: pit.year,
    });
  };

  const handleDelete = async (pitId: number) => {
    if (!confirm("Tem certeza que deseja excluir este pit?")) return;
    try {
      await httpDelete(`/pits/${pitId}`);
      setPits((prev) => prev.filter((pit) => pit.id !== pitId));
    } catch (error) {
      console.error("Falha ao excluir pit", error);
      alert("Falha ao excluir pit");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mb-4">
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Gerenciar Pits</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-md">
        <div>
          <label className="block text-gray-700 mb-2">Semester</label>
          <Input
            type="text"
            placeholder="Ex: 2024.1"
            value={formData.semester}
            onChange={(e) =>
              setFormData({ ...formData, semester: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <Input
            type="text"
            placeholder="Descrição do pit"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Year</label>
          <Input
            type="text"
            placeholder="Ano ex: 2024"
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: e.target.value })
            }
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button type="submit">
            {editingPit ? "Atualizar Pit" : "Criar Pit"}
          </Button>
          {editingPit && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingPit(null);
                setFormData({ semester: "", description: "", year: "" });
              }}
            >
              Cancelar edição
            </Button>
          )}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">Seus Pits</h2>
        {pits.length === 0 ? (
          <p>Nenhum pit cadastrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pits.map((pit) => (
                <TableRow key={pit.id}>
                  <TableCell>{pit.id}</TableCell>
                  <TableCell>{pit.semester}</TableCell>
                  <TableCell>{pit.description}</TableCell>
                  <TableCell>{pit.year}</TableCell>
                  <TableCell>
                    {new Date(pit.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => handleEdit(pit)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(pit.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}