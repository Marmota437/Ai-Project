export default function FinancePage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Konto Oszczędnościowe</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 mb-4">
           Nie wpłaciłeś jeszcze w tym miesiącu!
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded">Dokonaj wpłaty</button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Cele Finansowe</h3>
        <p>Tu będzie lista celów...</p>
      </div>
    </div>
  );
}