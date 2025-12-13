export default function TasksPage() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Lista Zadań</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded">+ Nowe Zadanie</button>
      </div>
      <p>Tu będą kafelki z zadaniami...</p>
    </div>
  );
}