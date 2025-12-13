import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { familyApi } from '../api/family';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const createFamilySchema = z.object({
  name: z.string().min(3, "Nazwa rodziny musi mieć min. 3 znaki"),
  monthlyAmount: z.number({ invalid_type_error: "Podaj kwotę" }).min(0, "Kwota nie może być ujemna"),
});

type CreateFamilyData = z.infer<typeof createFamilySchema>;

export const CreateFamilyPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateFamilyData>({
    resolver: zodResolver(createFamilySchema),
  });

  const onSubmit = async (data: CreateFamilyData) => {
    try {
      await familyApi.create({
        name: data.name,
        monthly_amount: data.monthlyAmount,
      });

      const updatedUser = await authApi.getMe();
      setUser(updatedUser);

      navigate('/dashboard');
    } catch (error) {
      console.error("Błąd tworzenia rodziny", error);
      alert("Nie udało się stworzyć rodziny.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Załóż nową rodzinę</h1>
      <p className="text-gray-600 mb-6">
        Jako twórca rodziny ustalisz miesięczną kwotę, którą każdy członek powinien wpłacać na konto oszczędnościowe.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Nazwa Rodziny (np. Kowalscy)"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Miesięczna składka (PLN)"
          type="number"
          step="0.01"
          {...register('monthlyAmount', { valueAsNumber: true })}
          error={errors.monthlyAmount?.message}
        />

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
            Anuluj
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Stwórz Rodzinę
          </Button>
        </div>
      </form>
    </div>
  );
};