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

  // --- 1. DODAWANIE ZADANIA ---
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

  // --- 2. OZNACZANIE JAKO WYKONANE ---
  const handleComplete = async (task: Task) => {
    try {
      await tasksApi.complete(task.id);
      toast.success("Super! Zadanie wykonane.");
      fetchData();
    } catch (e) {
      toast.error("Błąd.");
    }
  };

  // --- 3. OCENIANIE ---
  const handleRate = async (task: Task, stars: number) => {
    try {
      await tasksApi.rate(task.id, stars);
      toast.success(`Oceniono na ${stars}/5`);
      fetchData();
    } catch (error: any) {
      // Backend zwróci 400 jeśli oceniamy siebie
      toast.error(error.response?.data?.detail || "Błąd oceniania");
    }
  };

  // --- 4. USUWANIE (TYLKO ADMIN) ---
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

  // Pomocnicza funkcja do znalezienia nazwy usera po ID
  const getAssigneeName = (id: number | null) => {
    if (!id) return "Dla wszystkich";
    const user = members.find(m => m.id === id);
    return user ? user.full_name : "Nieznany";
  };

  if (isLoading) return <div className="p-8">Ładowanie zadań...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Zadania Domowe 📝</h1>

      {/* FORMULARZ */}
      <div className="bg-gray-50 p-6 rounded-xl border mb-8 shadow-sm">
        <h3 className="font-semibold mb-3 text-lg">Dodaj nowe zadanie</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <Input 
              label="Co trzeba zrobić?" 
              placeholder="np. Wynieść śmieci"
              {...register('title', { required: true })}
              className="bg-white"
            />
          </div>
          <div className="w-full md:w-64 mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">Przypisz do:</label>
            <select 
              {...register('assignedTo')}
              className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Ktokolwiek --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <Button type="submit">Dodaj Zadanie</Button>
          </div>
        </form>
      </div>

      {/* LISTA ZADAŃ */}
      <div className="space-y-4">
        {tasks.length === 0 && <p className="text-center text-gray-500 py-10">Brak zadań. Odpocznij! 🛋️</p>}
        
        {tasks.map(task => {
          const isDone = task.status === 'DONE';
          const isMyTask = task.assigned_to_id === currentUser?.id;
          
          return (
            <div key={task.id} className={`p-5 rounded-lg border transition-all ${isDone ? 'bg-green-50 border-green-200' : 'bg-white hover:shadow-md'}`}>
              <div className="flex justify-between items-start">
                
                {/* LEWA: TREŚĆ */}
                <div>
                  <h3 className={`text-xl font-bold ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  <div className="flex gap-2 text-sm mt-1 text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      👤 {getAssigneeName(task.assigned_to_id)}
                    </span>
                    {task.rating && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">
                        Ocena: {task.rating}/5 ⭐
                      </span>
                    )}
                  </div>
                </div>

                {/* PRAWA: AKCJE */}
                <div className="flex flex-col items-end gap-2">
                  {/* PRZYCISK DELETE (Dla każdego, backend zablokuje, ale user friendly jest pokazać ikonkę kosza) */}
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="text-red-400 hover:text-red-600 text-xs uppercase font-bold tracking-wide"
                  >
                    Usuń
                  </button>

                  {/* PRZYCISK WYKONANIA */}
                  {!isDone && (
                    <Button size="sm" onClick={() => handleComplete(task)}>
                      ✅ Zrobione
                    </Button>
                  )}

                  {/* GWIAZDKI (Tylko jak zrobione i nie moje) */}
                  {isDone && !task.rating && (
                    <div className="mt-1">
                      {isMyTask ? (
                        <span className="text-xs text-gray-400 italic">Czekaj na ocenę innych</span>
                      ) : (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star}
                              onClick={() => handleRate(task, star)}
                              className="text-xl hover:scale-125 transition-transform grayscale hover:grayscale-0"
                              title={`Daj ${star} gwiazdki`}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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