import { useState } from 'react';

export default function PitForm({ initialPit, onSubmit }) {
  const [semester, setSemester] = useState(initialPit.semester);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...initialPit, semester });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Semestre</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">
          Salvar
        </button>
      </div>
    </form>
  );
}
