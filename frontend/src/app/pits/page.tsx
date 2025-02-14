"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import useAPI from "@/hooks/useAPI";
import { Pit } from "@/types/pit";

export default function PitsPage() {
  const { httpGet, createWebSocket } = useAPI();
  const router = useRouter();
  const [pits, setPits] = useState<Pit[]>([]);

  // Carrega os pits iniciais via API
  useEffect(() => {
    httpGet<Pit[]>("/pits")
      .then((data) => setPits(data))
      .catch((err) => console.error("Falha ao carregar pits", err));
  }, [httpGet]);

  // Conecta ao WebSocket para receber atualizações em tempo real
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws/pits";
    const ws = createWebSocket(wsUrl, {
      onMessage: (data: unknown) => {
        // Se a mensagem for um array, atualiza todos os pits
        if (Array.isArray(data)) {
          setPits(data);
        } else if (data && (data as Pit).id) {
          // Se for um único pit, atualiza ou adiciona no estado
          const newPit = data as Pit;
          setPits((prev) => {
            const index = prev.findIndex((pit) => pit.id === newPit.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = newPit;
              return updated;
            }
            return [...prev, newPit];
          });
        }
      },
      onError: (error) => console.error("Erro no WebSocket:", error),
    });

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pits em Tempo Real</h1>
        {/* Botão para redirecionar para a página de gerenciamento (criar, editar e apagar pits) */}
        <Button onClick={() => router.push("/pits/manage")}>
          Gerenciar Pits
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pits.map((pit) => (
            <TableRow key={pit.id}>
              <TableCell>{pit.id}</TableCell>
              <TableCell>{pit.user_id}</TableCell>
              <TableCell>{pit.semester}</TableCell>
              <TableCell>{pit.year}</TableCell>
              <TableCell>
                {new Date(pit.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
