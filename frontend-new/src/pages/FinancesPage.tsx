import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { financeApi } from '../api/finance';
import type { Goal, SavingsStatus } from '../api/finance';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

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
    defaultValues: {
      name: '',
      target: 0 
    }
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  // 2. AKCJA: Wpłata miesięczna (Oszczędności)
  const handlePayMonthly = async () => {
    if (!confirm("Czy na pewno chcesz potwierdzić wpłatę miesięczną?")) return;
    try {
      await financeApi.payMonthlySavings();
      setRefreshKey(prev => prev + 1); 
      alert("Wpłata zarejestrowana!");
    } catch (error) {
      alert("Błąd podczas wpłaty. Sprawdź czy już nie wpłaciłeś.");
    }
  };

  // 3. AKCJA: Utworzenie nowego celu (NAPRAWIONA DEFINICJA)
  const onCreateGoal: SubmitHandler<CreateGoalData> = async (data) => {
    try {
      await financeApi.createGoal(data.name, data.target);
      reset();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      alert("Nie udało się utworzyć celu.");
    }
  };

  // 4. AKCJA: Wpłata na cel
  const handleContribute = async (goalId: number) => {
    const amountStr = contributions[goalId];
    const amount = parseFloat(amountStr);
    
    if (!amount || amount <= 0) return alert("Podaj poprawną kwotę");

    try {
      const response = await financeApi.contributeToGoal(goalId, amount);
      setRefreshKey(prev => prev + 1);
      setContributions(prev => ({ ...prev, [goalId]: '' })); // Wyczyść input
      
      if (response.is_completed) {
        alert("🎉 GRATULACJE! Cel został zrealizowany! 🎉");
      }
    } catch (error) {
      alert("Błąd wpłaty na cel.");
    }
  };

  if (isLoading) return <div className="p-8">Ładowanie finansów...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Finanse Rodziny 💰</h1>

      {/* --- SEKCJA 1: KONTO OSZCZĘDNOŚCIOWE --- */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Konto Oszczędnościowe</h2>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">Całkowite oszczędności rodziny</p>
            <p className="text-4xl font-bold text-green-600">
              {savings?.total_family_savings.toFixed(2)} PLN
            </p>
          </div>

          {/* STATUS WPŁATY */}
          <div className="w-full md:w-auto">
            {savings?.paid_this_month ? (
              <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-lg flex items-center justify-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold">Wpłata dokonana</p>
                  <p className="text-xs">Dziękujemy za wpłatę w tym miesiącu!</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <p className="font-bold">Nie wpłaciłeś w tym miesiącu!</p>
                </div>
                <Button onClick={handlePayMonthly} className="bg-red-600 hover:bg-red-700 w-full">
                  Dokonaj wpłaty
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SEKCJA 2: LISTA CELÓW --- */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Cele Finansowe 🎯</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {goals.map((goal) => {
          const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          
          return (
            <div key={goal.id} className={`bg-white rounded-xl shadow p-5 border ${goal.is_completed ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{goal.name}</h3>
                {goal.is_completed && <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">Zrealizowany</span>}
              </div>

              {/* Pasek postępu */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${goal.is_completed ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>{goal.current_amount.toFixed(2)} PLN</span>
                <span>z {goal.target_amount.toFixed(2)} PLN</span>
              </div>

              {/* Formularz wpłaty na cel (tylko jeśli niezrealizowany) */}
              {!goal.is_completed && (
                <div className="flex gap-2 mt-4">
                  <input 
                    type="number"
                    placeholder="Kwota"
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={contributions[goal.id] || ''}
                    onChange={(e) => setContributions({...contributions, [goal.id]: e.target.value})}
                  />
                  <Button 
                    className="text-sm py-1 px-3" 
                    onClick={() => handleContribute(goal.id)}
                    disabled={!contributions[goal.id]}
                  >
                    Wpłać
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- SEKCJA 3: DODAWANIE CELU --- */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Dodaj nowy cel</h3>
        <form onSubmit={handleSubmit(onCreateGoal)} className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <Input 
              label="Nazwa celu" 
              placeholder="np. Wakacje, Nowy TV"
              {...register('name')}
              error={errors.name?.message as string}
              className="bg-white"
            />
          </div>
          <div className="w-full md:w-48">
             <Input 
              label="Kwota docelowa" 
              type="number"
              placeholder="1000"
              {...register('target')}
              error={errors.target?.message as string}
              className="bg-white"
            />
          </div>
          <div className="mt-6">
            <Button type="submit" isLoading={isCreatingGoal}>
              Dodaj Cel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};