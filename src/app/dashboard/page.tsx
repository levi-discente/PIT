'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  description: string;
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
    const response = await fetch(`/api/activities?pit_id=${pitId}`);
    const data: Activity[] = await response.json();
    setActivities(data);
    setSelectedPit(pitId);
  };

  const handleCreateActivity = async () => {

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
    <div className="flex min-h-screen bg-base-200">
      <div className="flex-grow p-6">
        {/* Cards do Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Resumo do PIT</h3>
              <p>Semestre: {pits.length > 0 ? pits[0].semester : 'N/A'}</p>
              <p>Total de Atividades: {activities.length}</p>
            </div>
          </div>

          {/* Indicadores de Tipo de Atividade */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Tipos de Atividades</h3>
              {activityTypes.map((type) => (
                <div key={type.id} className="flex justify-between items-center mb-2">
                  <span>{type.name}</span>
                  <div className="badge badge-primary">
                    {activities.filter((activity) => activity.type === type.name).length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PITs do Usuário */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">PITs</h3>
              {pits.length > 0 ? (
                pits.map((pit) => (
                  <div
                    key={pit.id}
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => handlePitClick(pit.id)}
                  >
                    <span>PIT {pit.semester}</span>
                    <div className="badge badge-secondary">
                      {activities.filter((activity) => activity.pit_id === pit.id).length}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">Nenhum PIT cadastrado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Botão para Adicionar Atividade e PIT */}
        <div className="mb-6">
          <button
            className="btn btn-primary mt-4 mr-4"
            onClick={() => setIsActivityModalOpen(true)}
          >
            Adicionar Nova Atividade
          </button>
          <button
            className="btn btn-secondary mt-4"
            onClick={() => setIsPitModalOpen(true)}
          >
            Adicionar Novo PIT
          </button>
        </div>

        {/* Modal para Criar Atividade */}
        {isActivityModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl mb-4">Criar Nova Atividade</h3>
              <div className="mb-4">
                <label className="block mb-2">Tipo de Atividade</label>
                <select
                  className="select w-full"
                  value={selectedType || ''}
                  onChange={(e) => setSelectedType(parseInt(e.target.value, 10))}
                >
                  <option value="">Selecione um tipo</option>
                  {activityTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Título</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Descrição</label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="btn btn-secondary mr-2"
                  onClick={() => setIsActivityModalOpen(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleCreateActivity}>
                  Criar Atividade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Criar PIT */}
        {isPitModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl mb-4">Criar Novo PIT</h3>
              <div className="mb-4">
                <label className="block mb-2">Semestre</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={pitSemester}
                  onChange={(e) => setPitSemester(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="btn btn-secondary mr-2"
                  onClick={() => setIsPitModalOpen(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleCreatePit}>
                  Criar PIT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Atividades do PIT Selecionado */}
        {selectedPit && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Atividades do PIT {selectedPit}</h2>
            {activities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity.id}>
                        <td>{activity.id}</td>
                        <td>{activity.title}</td>
                        <td>{activity.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500">Nenhuma atividade cadastrada para este PIT.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

