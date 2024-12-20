import { useState } from 'react';

export default function ActivityForm({ initialActivity, onSubmit }) {
  const [type, setType] = useState(initialActivity.type);
  const [title, setTitle] = useState(initialActivity.title);
  const [description, setDescription] = useState(initialActivity.description);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...initialActivity, type, title, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Tipo</span>
        </label>
        <select
          className="select select-bordered"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="">Selecione o tipo</option>
          <option value="Aula">Aula</option>
          <option value="Pesquisa">Pesquisa</option>
          <option value="Extensão">Extensão</option>
          <option value="Apoio ao Ensino">Apoio ao Ensino</option>
          <option value="Atividades Administrativas">Atividades Administrativas</option>
        </select>
      </div>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Título</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Descrição</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">
          Salvar
        </button>
      </div>
    </form>
  );
}
