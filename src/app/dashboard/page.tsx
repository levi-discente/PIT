'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Modal, TextInput, Label, Spinner, Table, Badge, Card } from 'flowbite-react';

interface Pit {
  id: number;
  user_id: number;
  semester: string;
}

interface Activity {
  id: number;
  pit_id: number;
  type: string;
  title: string;
  details: string;
}

interface ActivityType {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const userId = parseInt(searchParams.get('user_id') || '', 10);

  const [pits, setPits] = useState<Pit[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedPit, setSelectedPit] = useState<number | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPitModalOpen, setIsPitModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pitSemester, setPitSemester] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPits() {
      const response = await fetch('/api/pits');
      const data: Pit[] = await response.json();
      setPits(data.filter((pit) => pit.user_id === userId));
    }
    fetchPits();
  }, [userId]);

  useEffect(() => {
    async function fetchActivityTypes() {
      const response = await fetch('/api/activityTypes');
      const data: ActivityType[] = await response.json();
      setActivityTypes(data);
    }
    fetchActivityTypes();
  }, []);

  const handlePitClick = async (pitId: number) => {
    setLoading(true);
    const response = await fetch(`/api/activities?pit_id=${pitId}`);
    const data: Activity[] = await response.json();
    setActivities(data);
    setSelectedPit(pitId);
    setLoading(false);
  };

  const handleCreateActivity = async () => {
    if (!selectedPit || !selectedType || !title || !description) return;

    const newActivity = {
      pit_id: selectedPit,
      type_id: selectedType,
      title,
      details: description,
    };

    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newActivity),
    });

    if (response.ok) {
      const data: Activity = await response.json();
      setActivities([...activities, data]);
      setIsActivityModalOpen(false);
    } else {
      alert('Erro ao criar atividade.');
    }
  };

  const handleCreatePit = async () => {
    if (!pitSemester) return;

    const newPit = {
      user_id: userId,
      semester: pitSemester,
    };

    const response = await fetch('/api/pits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPit),
    });

    if (response.ok) {
      const data: Pit = await response.json();
      setPits([...pits, data]);
      setIsPitModalOpen(false);
    } else {
      alert('Erro ao criar PIT.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="text-xl font-semibold">Resumo do PIT</h3>
          <p>Semestre: {pits.length > 0 ? pits[0].semester : 'N/A'}</p>
          <p>Total de Atividades: {activities.length}</p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold">Tipos de Atividades</h3>
          {activityTypes.map((type) => (
            <div key={type.id} className="flex justify-between items-center">
              <span>{type.name}</span>
              <Badge color="info">
                {activities.filter((activity) => activity.type === type.name).length}
              </Badge>
            </div>
          ))}
        </Card>

        <Card>
          <h3 className="text-xl font-semibold">PITs</h3>
          {pits.map((pit) => (
            <div
              key={pit.id}
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handlePitClick(pit.id)}
            >
              <span>PIT {pit.semester}</span>
              <Badge color="success">
                {activities.filter((activity) => activity.pit_id === pit.id).length}
              </Badge>
            </div>
          ))}
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => setIsActivityModalOpen(true)}>Adicionar Nova Atividade</Button>
        <Button color="success" onClick={() => setIsPitModalOpen(true)}>Adicionar Novo PIT</Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spinner size="lg" aria-label="Loading..." />
        </div>
      ) : (
        selectedPit && (
          <Table>
            <Table.Head>
              <Table.HeadCell>ID</Table.HeadCell>
              <Table.HeadCell>Título</Table.HeadCell>
              <Table.HeadCell>Descrição</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {activities.map((activity) => (
                <Table.Row key={activity.id}>
                  <Table.Cell>{activity.id}</Table.Cell>
                  <Table.Cell>{activity.title}</Table.Cell>
                  <Table.Cell>{activity.details}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )
      )}

      <Modal show={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)}>
        <Modal.Header>Criar Nova Atividade</Modal.Header>
        <Modal.Body>
          <Label htmlFor="activity-type" value="Tipo de Atividade" />
          <select
            id="activity-type"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-opacity-50"
            value={selectedType || ''}
            onChange={(e) => setSelectedType(parseInt(e.target.value, 10))}
          >
            <option value="">Selecione um tipo</option>
            {activityTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          <Label htmlFor="title" value="Título" className="mt-4" />
          <TextInput id="title" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Label htmlFor="description" value="Descrição" className="mt-4" />
          <TextInput id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCreateActivity}>Criar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isPitModalOpen} onClose={() => setIsPitModalOpen(false)}>
        <Modal.Header>Criar Novo PIT</Modal.Header>
        <Modal.Body>
          <Label htmlFor="semester" value="Semestre" />
          <TextInput id="semester" value={pitSemester} onChange={(e) => setPitSemester(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button color="success" onClick={handleCreatePit}>Criar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

