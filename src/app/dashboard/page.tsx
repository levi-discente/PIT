'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Pit {
  id: number;
  user_id: number;
  semester: string;
}

interface Activity {
  id: number;
  pit_id: number;
  type: string;  // "Aula", "Pesquisa", "Extensão", etc.
  title: string;
  description: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const userId = parseInt(searchParams.get('user_id') || '', 10);

  const [pits, setPits] = useState<Pit[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedPit, setSelectedPit] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPits() {
      const response = await fetch('/api/pits');
      const data: Pit[] = await response.json();
      setPits(data.filter((pit) => pit.user_id === userId));
    }
    fetchPits();
  }, [userId]);

  const handlePitClick = async (pitId: number) => {
    const response = await fetch(`/api/activities`);
    const data: Activity[] = await response.json();
    setActivities(data.filter((activity) => activity.pit_id === pitId));
    setSelectedPit(pitId);
  };

  const activityTypes = ['Aula', 'Pesquisa', 'Extensão', 'Apoio ao Ensino', 'Atividades Administrativas'];

  // Função para contar o número de atividades de cada tipo
  const getActivityCountByType = (type: string) => {
    return activities.filter((activity) => activity.type === type).length;
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Main Content */}
      <div className="flex-grow p-6">
        {/* Resumo do PIT */}
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
                <div key={type} className="flex justify-between items-center mb-2">
                  <span>{type}</span>
                  <div className="badge badge-primary">{getActivityCountByType(type)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status de Conclusão */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Status de Conclusão</h3>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${(activities.length / pits.length) * 100}%` }}
                ></div>
              </div>
              <p>{activities.length} de {pits.length} atividades concluídas</p>
            </div>
          </div>
        </div>

        {/* Ações e Gestão de Atividades */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Seus PITs</h2>
          {pits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pits.map((pit) => (
                <div
                  key={pit.id}
                  className="card bg-base-100 shadow-lg cursor-pointer"
                  onClick={() => handlePitClick(pit.id)}
                >
                  <div className="card-body">
                    <h3 className="card-title">PIT {pit.semester}</h3>
                    <p>ID: {pit.id}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">Nenhum PIT cadastrado.</p>
              <button className="btn btn-primary mt-4">Adicionar Novo PIT</button>
            </div>
          )}
        </div>

        {/* Activities Section */}
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
                <button className="btn btn-secondary mt-4">Adicionar Atividade</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

