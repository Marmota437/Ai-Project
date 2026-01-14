import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { tasksApi, type Task, type UserBasic, type TaskComment } from '../api/tasks';
import { familyApi } from '../api/family'; 
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';
import { Calendar, MessageSquare, Send, Clock, User, X, Plus } from 'lucide-react';

interface TaskForm {
  title: string;
  assignedTo: string;
  deadline: string;
}

export const TasksPage = () => {
  const currentUser = useAuthStore(state => state.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<UserBasic[]>([]);
  const [familyOwnerId, setFamilyOwnerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [commentTask, setCommentTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");

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

  useEffect(() => {
    if (commentTask) {
      tasksApi.getComments(commentTask.id).then(setComments).catch(console.error);
    }
  }, [commentTask]);

  const isAdmin = currentUser?.id === familyOwnerId;

  const onSubmit: SubmitHandler<TaskForm> = async (data) => {
    try {
      const assignedId = data.assignedTo && data.assignedTo !== "" ? parseInt(data.assignedTo) : undefined;
      const deadlineIso = data.deadline ? new Date(data.deadline).toISOString() : undefined;
      
      await tasksApi.create(data.title, assignedId, deadlineIso);
      toast.success("Dodano zadanie!");
      reset();
      fetchData();
    } catch (e) { 
      toast.error("Błąd dodawania."); 
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentTask || !newComment.trim()) return;
    try {
      await tasksApi.addComment(commentTask.id, newComment);
      setNewComment("");
      const updatedComments = await tasksApi.getComments(commentTask.id);
      setComments(updatedComments);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Błąd dodawania komentarza");
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTask(task);
    setEditValue('title', task.title);
    setEditValue('assignedTo', task.assigned_to_id ? task.assigned_to_id.toString() : "");
    if (task.deadline) {
        const dateObj = new Date(task.deadline);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        setEditValue('deadline', `${yyyy}-${mm}-${dd}`);
    } else {
        setEditValue('deadline', '');
    }
  };

  const onEditSubmit: SubmitHandler<TaskForm> = async (data) => {
    if (!editingTask) return;
    try {
      const assignedId = data.assignedTo && data.assignedTo !== "" ? parseInt(data.assignedTo) : undefined;
      const deadlineIso = data.deadline ? new Date(data.deadline).toISOString() : undefined;

      await tasksApi.update(editingTask.id, data.title, assignedId, deadlineIso);
      toast.success("Zaktualizowano!");
      setEditingTask(null);
      fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Błąd edycji"); }
  };

  const handleComplete = async (task: Task) => {
    try { await tasksApi.complete(task.id); toast.success("Zadanie wykonane!"); fetchData(); } catch (e) { toast.error("Błąd."); }
  };
  const handleRate = async (task: Task, stars: number) => {
    try { await tasksApi.rate(task.id, stars); toast.success(`Oceniono na ${stars}/5`); fetchData(); } catch (e: any) { toast.error(e.response?.data?.detail || "Błąd"); }
  };
  const handleDelete = async (id: number) => {
    if(!confirm("Usunąć zadanie?")) return;
    try { await tasksApi.delete(id); toast.success("Usunięto."); fetchData(); } catch (e: any) { toast.error(e.response?.data?.detail || "Brak uprawnień."); }
  };
  
  const getAssigneeName = (id: number | null) => {
    if (!id) return "Wszyscy";
    const user = members.find(m => m.id === id);
    return user ? user.full_name : "Nieznany";
  };
  const getUserName = (id: number) => {
    const user = members.find(m => m.id === id);
    return user ? user.full_name : "Ktoś";
  };
  const formatDate = (isoString: string | null) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleDateString('pl-PL');
  };
  const isOverdue = (task: Task) => {
    if (!task.deadline || task.status === 'DONE') return false;
    const d1 = new Date(task.deadline);
    const d2 = new Date();
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    return d1 < d2;
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Zadania Domowe
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {isAdmin ? "Panel Administratora Rodziny 👑" : "Twoje centrum obowiązków"}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow duration-300">
        <h3 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <div className="bg-blue-100 p-1 rounded-md text-blue-600"><Plus size={18}/></div>
            Nowe zadanie
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row items-end gap-4">
          
          <div className="w-full md:flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Tytuł zadania</label>
            <input 
              type="text"
              placeholder="np. Wyprowadzanie psa"
              {...register('title', { required: true })}
              className="w-full h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder-gray-400 shadow-sm"
            />
          </div>

          <div className="w-full md:w-48">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Termin</label>
             <input 
                type="date"
                {...register('deadline')}
                className="w-full h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 shadow-sm cursor-pointer"
             />
          </div>

          <div className="w-full md:w-64 relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Przypisz do</label>
            <select 
              {...register('assignedTo')}
              className="w-full h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm appearance-none cursor-pointer text-gray-700"
            >
              <option value="">-- Wszyscy --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute bottom-0 right-0 h-[42px] flex items-center px-3 text-gray-500">
               <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <Button type="submit" className="h-[42px] bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md whitespace-nowrap w-full md:w-auto px-8">
                Dodaj
            </Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map(task => {
          const isDone = task.status === 'DONE';
          const isMyTask = task.assigned_to_id === currentUser?.id;
          const overdue = isOverdue(task);
          
          return (
            <div key={task.id} className={`relative group p-6 rounded-2xl border flex flex-col justify-between min-h-[200px] transition-all duration-300 ${isDone ? 'bg-slate-50 opacity-60' : 'bg-white shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1'}`}>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${task.assigned_to_id ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                        <User size={10} /> {getAssigneeName(task.assigned_to_id)}
                    </span>
                    {task.deadline && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${overdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                            <Calendar size={10} /> {formatDate(task.deadline)}
                        </span>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleStartEdit(task)} className="text-gray-400 hover:text-blue-500 p-1" title="Edytuj">✎</button>
                      <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-500 p-1" title="Usuń">✕</button>
                    </div>
                  )}
                </div>

                <h3 className={`text-lg font-bold mb-2 leading-snug ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                
                <button 
                    onClick={() => setCommentTask(task)}
                    className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 text-xs font-bold py-1 px-2 rounded-md hover:bg-blue-50"
                >
                    <MessageSquare size={16} /> Komentarze
                </button>

                <div className="flex gap-2">
                  {!isDone && (
                    <Button size="sm" onClick={() => handleComplete(task)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                      ✓
                    </Button>
                  )}

                  {isDone && !task.rating && !isMyTask && (
                    <div className="flex gap-1 bg-white border border-gray-100 rounded-full p-1 shadow-sm">
                       {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => handleRate(task, star)} className="hover:text-yellow-400 text-gray-300 transition-colors">★</button>
                        ))}
                    </div>
                  )}
                  {isDone && task.rating && <span className="text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100 text-sm">⭐ {task.rating}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {commentTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/50">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-500"/>
                        Komentarze
                    </h3>
                    <button onClick={() => setCommentTask(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"><X size={18}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    <div className="bg-blue-50 p-3 rounded-lg mb-4 text-xs text-blue-800 border border-blue-100">
                        Zadanie: <strong>{commentTask.title}</strong>
                    </div>
                    {comments.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-400 text-sm">Brak komentarzy. Napisz coś!</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className={`flex flex-col ${comment.user_id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${comment.user_id === currentUser?.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                    {comment.content}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                                    {getUserName(comment.user_id)}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {commentTask.assigned_to_id === currentUser?.id ? (
                    <div className="p-4 bg-gray-100 text-center text-xs text-gray-500 border-t font-medium">
                        🔒 Jako wykonawca nie możesz dodawać komentarzy motywujących :)
                    </div>
                ) : (
                    <form onSubmit={handleSendComment} className="p-3 bg-white border-t flex gap-2">
                        <input 
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Napisz motywujący komentarz..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                            <Send size={16} />
                        </button>
                    </form>
                )}
            </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-white/50">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edytuj zadanie</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Tytuł</label>
                <input 
                    type="text"
                    {...registerEdit('title', { required: true })}
                    className="w-full h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Termin</label>
                <input 
                    type="date"
                    {...registerEdit('deadline')}
                    className="w-full h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Przypisz do</label>
                <select {...registerEdit('assignedTo')} className="w-full h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                    <option value="">-- Wszyscy --</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
                <div className="pointer-events-none absolute bottom-0 right-0 h-[42px] flex items-center px-3 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={() => setEditingTask(null)} className="w-full h-[42px]">Anuluj</Button>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-[42px]">Zapisz</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};