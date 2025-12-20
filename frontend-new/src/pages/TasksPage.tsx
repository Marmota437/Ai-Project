import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { tasksApi, type Task, type UserBasic } from '../api/tasks';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';

interface NewTaskForm {
  title: string;
  assignedTo: string;
}

export const TasksPage = () => {
  const currentUser = useAuthStore(state => state.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<UserBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset } = useForm<NewTaskForm>();

  const fetchData = async () => {
    try {
      const [tData, mData] = await Promise.all([
        tasksApi.getAll(),
        tasksApi.getMembers()
      ]);
      setTasks(tData);
      setMembers(mData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIKA ---
  const onSubmit: SubmitHandler<NewTaskForm> = async (data) => {
    try {
      const assignedId = data.assignedTo ? parseInt(data.assignedTo) : undefined;
      await tasksApi.create(data.title, assignedId);
      toast.success("Dodano zadanie!");
      reset();
      fetchData();
    } catch (e) {
      toast.error("Błąd dodawania.");
    }
  };

  const handleComplete = async (task: Task) => {
    try {
      await tasksApi.complete(task.id);
      toast.success("Super! Zadanie wykonane.");
      fetchData();
    } catch (e) {
      toast.error("Błąd.");
    }
  };

  const handleRate = async (task: Task, stars: number) => {
    try {
      await tasksApi.rate(task.id, stars);
      toast.success(`Oceniono na ${stars}/5`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Błąd oceniania");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Usunąć zadanie?")) return;
    try {
      await tasksApi.delete(id);
      toast.success("Usunięto.");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Brak uprawnień (Tylko Admin).");
    }
  };

  const getAssigneeName = (id: number | null) => {
    if (!id) return "Dla wszystkich";
    const user = members.find(m => m.id === id);
    return user ? user.full_name : "Nieznany";
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8 pb-10">
      
      {/* NAGŁÓWEK + STATYSTYKI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zadania Domowe</h1>
          <p className="text-gray-500 mt-1">Zarządzaj obowiązkami i oceniaj wykonanie.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 text-center min-w-[100px]">
            <span className="block text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'TODO').length}</span>
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Do zrobienia</span>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 text-center min-w-[100px]">
            <span className="block text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'DONE').length}</span>
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Zrobione</span>
          </div>
        </div>
      </div>

      {/* FORMULARZ DODAWANIA (Karta) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
          <span className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full text-sm">＋</span> 
          Dodaj nowe zadanie
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <Input 
              label="Tytuł zadania" 
              placeholder="np. Wyprowadzanie psa"
              {...register('title', { required: true })}
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
          <div className="w-full md:w-64 mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Przypisz do</label>
            <select 
              {...register('assignedTo')}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">-- Dla wszystkich --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <Button type="submit" className="shadow-lg shadow-blue-500/30">Dodaj Zadanie</Button>
          </div>
        </form>
      </div>

      {/* LISTA ZADAŃ (Grid Kart) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-4xl mb-2">🛋️</p>
            <p className="text-gray-500 text-lg">Wszystko zrobione! Czas na relaks.</p>
          </div>
        )}
        
        {tasks.map(task => {
          const isDone = task.status === 'DONE';
          const isMyTask = task.assigned_to_id === currentUser?.id;
          
          return (
            <div 
              key={task.id} 
              className={`relative group p-5 rounded-xl border flex flex-col justify-between min-h-[180px] transition-all duration-300 ${
                isDone 
                  ? 'bg-gray-50 border-gray-200 opacity-75 grayscale-[0.5] hover:grayscale-0' 
                  : 'bg-white border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300'
              }`}
            >
              {/* GÓRA KARTY */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${
                    task.assigned_to_id ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {getAssigneeName(task.assigned_to_id)}
                  </span>
                  
                  {/* Przycisk usuwania (pojawia się po najechaniu) */}
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                    title="Usuń zadanie"
                  >
                    ✕
                  </button>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isDone ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
              </div>

              {/* DÓŁ KARTY (AKCJE) */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                
                {/* STATUS / OCENA (LEWA STRONA) */}
                <div>
                   {task.rating ? (
                      <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-lg">
                        <span>⭐</span> {task.rating}/5
                      </div>
                    ) : isDone ? (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">WYKONANE</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">DO ZROBIENIA</span>
                    )}
                </div>

                {/* PRZYCISKI AKCJI (PRAWA STRONA) */}
                <div className="flex gap-2">
                  {!isDone && (
                    <button 
                      onClick={() => handleComplete(task)}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1.5 px-3 rounded-lg shadow-md shadow-green-500/20 transition-all active:scale-95 flex items-center gap-1"
                    >
                      ✓ Zrobione
                    </button>
                  )}

                  {isDone && !task.rating && !isMyTask && (
                    <div className="flex gap-1 bg-white shadow-inner p-1 rounded-full border">
                       {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onClick={() => handleRate(task, star)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-yellow-100 text-gray-300 hover:text-yellow-500 transition-colors text-sm"
                            title={`Oceń na ${star}`}
                          >
                            ★
                          </button>
                        ))}
                    </div>
                  )}
                  
                  {isDone && !task.rating && isMyTask && (
                     <span className="text-xs text-gray-400 italic mt-1">Czekaj na ocenę</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};