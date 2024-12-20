'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
}

export default function SelectUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch('/api/users');
      const data: User[] = await response.json();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      window.location.href = `/dashboard?user_id=${selectedUser}`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">


      {/* Main Content */}
      <div className="flex flex-grow items-center justify-center p-6">
        <div className="card w-full max-w-md bg-base-100 shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Selecione um Usuário</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Usuário</span>
              </label>
              <select
                className="select select-bordered"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
              >
                <option value="" disabled>
                  Escolha um usuário
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

