import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { tasksApi, type Task, type UserBasic } from '../api/tasks';
import { familyApi } from '../api/family'; 
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';

interface TaskForm {
  title: string;
  assignedTo: string;
}

export const TasksPage = () => {
  const currentUser = useAuthStore(state => state.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<UserBasic[]>([]);
  const [familyOwnerId, setFamilyOwnerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { register, handleSubmit, reset } = useForm<TaskForm>();
  
  const { 
    register: registerEdit, 
    handleSubmit: handleSubmitEdit, 
    setValue: setEditValue 
  } = useForm<TaskForm>();

  const fetchData = async () => {
    try {
      const [tData, mData, fData] = await Promise.all([
        tasksApi.getAll(),
        tasksApi.getMembers(),
        familyApi.getMyFamily()
      ]);
      setTasks(tData);
      setMembers(mData);
      setFamilyOwnerId(fData.owner_id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isAdmin = currentUser?.id === familyOwnerId;

  // --- LOGIKA ---
  const onSubmit: SubmitHandler<TaskForm> = async (data) => {
    try {
      const assignedId = data.assignedTo ? parseInt(data.assignedTo) : undefined;
      await tasksApi.create(data.title, assignedId);
      toast.success("Dodano zadanie!");
      reset();
      fetchData();
    } catch (e) { toast.error("Błąd dodawania."); }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTask(task);
    setEditValue('title', task.title);
    setEditValue('assignedTo', task.assigned_to_id ? task.assigned_to_id.toString() : "");
  };

  const onEditSubmit: SubmitHandler<TaskForm> = async (data) => {
    if (!editingTask) return;
    try {
      const assignedId = data.assignedTo ? parseInt(data.assignedTo) : undefined;
      await tasksApi.update(editingTask.id, data.title, assignedId);
      toast.success("Zadanie zaktualizowane!");
      setEditingTask(null);
      fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Błąd edycji"); }
  };

  const handleComplete = async (task: Task) => {
    try {
      await tasksApi.complete(task.id);
      toast.success("Zadanie wykonane!");
      fetchData();
    } catch (e) { toast.error("Błąd."); }
  };

  const handleRate = async (task: Task, stars: number) => {
    try {
      await tasksApi.rate(task.id, stars);
      toast.success(`Oceniono na ${stars}/5`);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.detail || "Błąd"); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Usunąć zadanie?")) return;
    try {
      await tasksApi.delete(id);
      toast.success("Usunięto.");
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.detail || "Brak uprawnień."); }
  };

  const getAssigneeName = (id: number | null) => {
    if (!id) return "Wszyscy";
    const user = members.find(m => m.id === id);
    return user ? user.full_name : "Nieznany";
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      {/* NAGŁÓWEK */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Zadania Domowe
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {isAdmin ? "Panel Administratora Rodziny 👑" : "Twoje centrum obowiązków"}
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex flex-col items-center bg-white px-6 py-2 rounded-2xl shadow-sm border border-blue-100">
            <span className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'TODO').length}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Do zrobienia</span>
          </div>
          <div className="flex flex-col items-center bg-white px-6 py-2 rounded-2xl shadow-sm border border-green-100">
            <span className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'DONE').length}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Zrobione</span>
          </div>
        </div>
      </div>

      {/* FORMULARZ DODAWANIA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow duration-300">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
          <span className="bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-lg text-sm shadow-md shadow-blue-500/30">＋</span> 
          Dodaj nowe zadanie
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <Input 
              label="Tytuł zadania" 
              placeholder="np. Wyprowadzanie psa"
              {...register('title', { required: true })}
              className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="w-full md:w-64 mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Przypisz do</label>
            <select 
              {...register('assignedTo')}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-white"
            >
              <option value="">-- Dla wszystkich --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <Button type="submit" className="shadow-lg shadow-blue-600/20 bg-gradient-to-r from-blue-600 to-blue-700">Dodaj</Button>
          </div>
        </form>
      </div>

      {/* LISTA ZADAŃ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.length === 0 && (
          <div className="col-span-full text-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4 animate-bounce">🛋️</div>
            <h3 className="text-xl font-bold text-gray-700">Wszystko zrobione!</h3>
            <p className="text-gray-400">Możesz odpocząć lub dodać nowe zadanie.</p>
          </div>
        )}
        
        {tasks.map(task => {
          const isDone = task.status === 'DONE';
          const isMyTask = task.assigned_to_id === currentUser?.id;
          
          return (
            <div 
              key={task.id} 
              className={`relative group p-6 rounded-2xl border flex flex-col justify-between min-h-[180px] transition-all duration-300 ${
                isDone 
                  ? 'bg-slate-50 border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100' 
                  : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-200'
              }`}
            >
              {/* GÓRA KARTY */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                    task.assigned_to_id 
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-100' 
                      : 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border border-orange-100'
                  }`}>
                    {getAssigneeName(task.assigned_to_id)}
                  </span>
                  
                  {/* PRZYCISKI ADMINA (Pojawiają się po najechaniu) */}
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100">
                      <button 
                        onClick={() => handleStartEdit(task)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        title="Edytuj"
                      >
                        ✎
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Usuń"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <h3 className={`text-lg font-bold mb-2 leading-snug ${isDone ? 'line-through text-gray-400 decoration-2' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
              </div>

              {/* DÓŁ KARTY */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                   {task.rating ? (
                      <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                        <span>⭐</span> {task.rating}/5
                      </div>
                    ) : isDone ? (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md tracking-wider border border-emerald-100">UKOŃCZONE</span>
                    ) : (
                      <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md tracking-wider border border-gray-100">OCZEKUJE</span>
                    )}
                </div>

                <div className="flex gap-2">
                  {!isDone && (
                    <Button size="sm" onClick={() => handleComplete(task)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                      ✓ Zrobione
                    </Button>
                  )}

                  {isDone && !task.rating && !isMyTask && (
                    <div className="flex bg-white shadow-sm p-1 rounded-full border border-gray-100">
                       {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => handleRate(task, star)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-yellow-50 text-gray-300 hover:text-yellow-400 transition-all text-sm transform hover:scale-110">★</button>
                        ))}
                    </div>
                  )}
                  
                  {isDone && !task.rating && isMyTask && (
                     <span className="text-xs text-gray-400 italic mt-1 bg-gray-50 px-2 py-1 rounded">Czekaj na ocenę</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL EDYCJI */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 border border-white/50">
            <h3 className="text-xl font-bold mb-1 text-gray-800">Edytuj zadanie</h3>
            <p className="text-sm text-gray-500 mb-6">Wprowadź poprawki do zadania.</p>
            
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
              <Input 
                label="Nowy tytuł" 
                {...registerEdit('title', { required: true })}
                className="bg-gray-50 border-gray-200"
              />
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Przypisz do</label>
                <select 
                  {...registerEdit('assignedTo')}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">-- Dla wszystkich --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-50">
                <Button type="button" variant="secondary" onClick={() => setEditingTask(null)} className="w-full">
                  Anuluj
                </Button>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Zapisz zmiany
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};