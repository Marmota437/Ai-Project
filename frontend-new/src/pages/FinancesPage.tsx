import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { financeApi } from '../api/finance';
import type { Goal, SavingsStatus } from '../api/finance';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { PiggyBank, Target, TrendingUp, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

const createGoalSchema = z.object({
  name: z.string().min(3, "Nazwa celu musi być dłuższa"),
  target: z.coerce.number().min(1, "Kwota musi być większa od 0"),
});

type CreateGoalData = z.infer<typeof createGoalSchema>;

export const FinancesPage = () => {
  const [savings, setSavings] = useState<SavingsStatus | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [contributions, setContributions] = useState<Record<number, string>>({});

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting: isCreatingGoal } 
  } = useForm({
    resolver: zodResolver(createGoalSchema),
    defaultValues: { name: '', target: 0 }
  });

  // 1. POBIERANIE DANYCH
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [savingsData, goalsData] = await Promise.all([
          financeApi.getSavingsStatus(),
          financeApi.getGoals()
        ]);
        setSavings(savingsData);
        setGoals(goalsData);
      } catch (error) {
        console.error("Błąd pobierania finansów:", error);
        toast.error("Nie udało się pobrać danych finansowych.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  // 2. AKCJA: Wpłata miesięczna
  const handlePayMonthly = async () => {
    if (!confirm("Czy na pewno chcesz potwierdzić wpłatę miesięczną?")) return;
    try {
      await financeApi.payMonthlySavings();
      setRefreshKey(prev => prev + 1); 
      toast.success("Wpłata zarejestrowana! Dziękujemy 💸");
    } catch (error) {
      toast.error("Już wpłaciłeś w tym miesiącu lub wystąpił błąd.");
    }
  };

  // 3. AKCJA: Utworzenie celu
  const onCreateGoal: SubmitHandler<CreateGoalData> = async (data) => {
    try {
      await financeApi.createGoal(data.name, data.target);
      reset();
      setRefreshKey(prev => prev + 1);
      toast.success("Nowy cel dodany! 🎯");
    } catch (error) {
      toast.error("Nie udało się utworzyć celu.");
    }
  };

  // 4. AKCJA: Wpłata na cel
  const handleContribute = async (goalId: number) => {
    const amountStr = contributions[goalId];
    const amount = parseFloat(amountStr);
    
    if (!amount || amount <= 0) return toast.error("Podaj poprawną kwotę");

    try {
      const response = await financeApi.contributeToGoal(goalId, amount);
      setRefreshKey(prev => prev + 1);
      setContributions(prev => ({ ...prev, [goalId]: '' }));
      
      if (response.is_completed) {
        toast.success("🎉 GRATULACJE! Cel został zrealizowany!", { duration: 5000 });
      } else {
        toast.success(`Wpłacono ${amount} PLN na cel.`);
      }
    } catch (error) {
      toast.error("Błąd wpłaty na cel.");
    }
  };

  // Formatowanie waluty
  const formatPLN = (amount: number = 0) => 
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#57C785]"></div></div>;

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      {/* NAGŁÓWEK Z TWOIMI KOLORAMI */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#57C785] to-[#EDDD53]">
          Finanse Rodziny
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Monitoruj oszczędności i realizuj marzenia 💰</p>
      </div>

      {/* --- SEKCJA 1: KONTO OSZCZĘDNOŚCIOWE --- */}
      <div className="bg-white rounded-3xl shadow-xl shadow-[#57C785]/10 overflow-hidden border border-[#57C785]/20 relative group">
        
        {/* Ikonka w tle */}
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
           <PiggyBank size={180} color="#57C785" />
        </div>
        
        <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[#57C785] font-bold uppercase tracking-wider text-xs">
              <TrendingUp size={16} /> Stan konta
            </div>
            <p className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
              {formatPLN(savings?.total_family_savings)}
            </p>
            <p className="text-gray-500 mt-2">Zgromadzone środki całej rodziny</p>
          </div>

          {/* STATUS WPŁATY */}
          <div className="w-full md:w-auto min-w-[300px]">
            {savings?.paid_this_month ? (
              <div className="bg-[#57C785]/10 border border-[#57C785]/30 rounded-2xl p-6 text-center transform transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-white text-[#57C785] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-[#2d6a45] font-bold text-lg">Składka opłacona</h3>
                <p className="text-[#419463] text-sm">Dziękujemy za wpłatę w tym miesiącu!</p>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
                 <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-rose-800 font-bold text-lg mb-1">Brak wpłaty!</h3>
                <p className="text-rose-600 text-sm mb-4">W tym miesiącu: <strong>{formatPLN(savings?.payment_amount)}</strong></p>
                <Button onClick={handlePayMonthly} className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30">
                  Dokonaj wpłaty
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SEKCJA 2: LISTA CELÓW --- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="text-[#57C785]" /> Cele Finansowe
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {goals.length === 0 && (
             <div className="col-span-full bg-gray-50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
               <p className="text-gray-400 font-medium">Brak celów. Dodaj pierwszy cel poniżej!</p>
             </div>
          )}

          {goals.map((goal) => {
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            
            return (
              <div key={goal.id} className={`relative p-6 rounded-2xl border transition-all duration-300 ${goal.is_completed ? 'bg-[#57C785]/10 border-[#57C785]/30 shadow-sm' : 'bg-white border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1'}`}>
                
                {/* Nagłówek Karty */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">{goal.name}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      {formatPLN(goal.current_amount)} <span className="text-gray-300">/</span> {formatPLN(goal.target_amount)}
                    </p>
                  </div>
                  {goal.is_completed && (
                    <span className="bg-[#57C785] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={12} /> Zrealizowany
                    </span>
                  )}
                </div>

                {/* PASEK POSTĘPU Z GRADIENTEM */}
                <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                        width: `${progress}%`,
                        background: goal.is_completed ? '#57C785' : 'linear-gradient(90deg, #EDDD53 0%, #57C785 100%)' 
                    }}
                  ></div>
                </div>
                
                {/* Formularz wpłaty */}
                {!goal.is_completed ? (
                  <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <span className="text-gray-400 pl-2 text-sm">PLN</span>
                    <input 
                      type="number"
                      placeholder="Kwota"
                      className="bg-transparent border-none focus:ring-0 w-full text-sm font-semibold text-gray-700 placeholder:font-normal"
                      value={contributions[goal.id] || ''}
                      onChange={(e) => setContributions({...contributions, [goal.id]: e.target.value})}
                    />
                    <Button 
                      size="sm"
                      className="whitespace-nowrap bg-[#57C785] hover:bg-[#46a56c] shadow-md shadow-[#57C785]/30 border-0" 
                      onClick={() => handleContribute(goal.id)}
                      disabled={!contributions[goal.id]}
                    >
                      Wpłać +
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2 text-[#57C785] font-bold text-sm bg-white/50 rounded-lg">
                    Gratulacje! Cel osiągnięty 🎉
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SEKCJA 3: DODAWANIE CELU --- */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
          <div className="bg-[#57C785]/10 text-[#57C785] p-1.5 rounded-lg">
             <Plus size={20} />
          </div>
          Dodaj nowy cel
        </h3>
        <form onSubmit={handleSubmit(onCreateGoal)} className="flex flex-col md:flex-row gap-5 items-end">
          <div className="flex-1 w-full">
            <Input 
              label="Nazwa celu" 
              placeholder="np. Wakacje, Remont, Konsola"
              {...register('name')}
              error={errors.name?.message as string}
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="w-full md:w-64">
             <Input 
              label="Kwota docelowa" 
              type="number"
              placeholder="np. 5000"
              {...register('target')}
              error={errors.target?.message as string}
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="mb-4 w-full md:w-auto">
            <Button type="submit" isLoading={isCreatingGoal} className="w-full md:w-auto h-[42px] bg-gray-900 hover:bg-black text-white px-8">
              Utwórz Cel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};