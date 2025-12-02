import { getDailySpread } from "@/app/actions/tarot";
import DailySpreadInteractive from "@/components/DailySpreadInteractive";

export default async function TarotDraw() {
  // Fetch data on the server
  const result = await getDailySpread();
    
    // Handle null case
    if (!result) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-center text-slate-400">Unable to load daily guidance.</p>
        </div>
      );
    }

  const { cards, isNew } = result;


  // Sort them to ensure they appear in the order we expect (Postgres IN queries don't guarantee order)
  // Note: For a real spread, you might want to save the order specifically in the DB, 
  // but for now, we just render them.
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-serif text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          Daily Guidance
        </h1>
        {isNew 
            ? "Focus on your intent, and draw three cards from the deck."
            : "Your guidance for today has been revealed."}
      </header>

      {/* 2. Load the Interactive Client Component */}
      <DailySpreadInteractive cards={cards || []} isNew={isNew} />
    </div>
  );
}