"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoDocumentsOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import useAPI from "@/hooks/useAPI";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interface para "users"
interface User {
  id: number;
  name: string;
  email: string;
  role: "docente" | "tecnico";
}

// Interface para "pit"
interface Pit {
  id: number;
  user_id: number;
  semester: string; // formato "YYYY.S"
  year: number;
  created_at: string; // formato ISO 8601
}

// Interface para "activiti_types"
interface ActivityType {
  id: number;
  name: string;
}

// Interface para "activities"
interface Activity {
  id: number;
  pit_id: number;
  activity_type_id: number;
  description: string;
  hours: number;
}

export default function Home() {
  const { httpGet } = useAPI();

  // Dados simulados para exemplo
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      pit_id: 123,
      activity_type_id: 1,
      description: "Ministrar aulas de Matemática",
      hours: 10,
    },
  ]);

  const [newActivity, setNewActivity] = useState<Activity>({
    id: 0,
    pit_id: 0,
    activity_type_id: 0,
    description: "",
    hours: 0,
  });

  const handleCreate = () => {
    setActivities([...activities, { ...newActivity, id: Date.now() }]);
    setNewActivity({
      id: 0,
      pit_id: 0,
      activity_type_id: 0,
      description: "",
      hours: 0,
    });
  };

  const handleEdit = (id: number) => {
    const activityToEdit = activities.find((activity) => activity.id === id);
    if (activityToEdit) setNewActivity(activityToEdit);
  };

  const handleDelete = (id: number) => {
    setActivities(activities.filter((activity) => activity.id !== id));
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="flex gap-4">
        <div className="flex flex-col w-full">
          <h2 className="text-xl">Atividades</h2>
          <ScrollArea className="h-96 rounded-md border mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Horas</TableHead>
                  <TableHead className="text-center">Editar</TableHead>
                  <TableHead className="text-center">Excluir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.id}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell className="text-center">
                      {activity.hours}
                    </TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => handleEdit(activity.id)}>
                        ✏️
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => handleDelete(activity.id)}>
                        🗑️
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="mt-4">
            <h3 className="text-lg">Criar/Editar Atividade</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="flex flex-col gap-2"
            >
              <input
                type="number"
                placeholder="Pit ID"
                value={newActivity.pit_id}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    pit_id: Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Activity Type ID"
                value={newActivity.activity_type_id}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    activity_type_id: Number(e.target.value),
                  })
                }
              />
              <input
                type="text"
                placeholder="Descrição"
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    description: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Horas"
                value={newActivity.hours}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    hours: Number(e.target.value),
                  })
                }
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                Salvar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
