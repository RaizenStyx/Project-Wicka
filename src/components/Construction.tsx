import { Hammer } from 'lucide-react'; // Or any other icon

export default function Construction({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 p-8">
      <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
        <Hammer className="w-8 h-8 text-purple-400" />
      </div>
      <h1 className="text-3xl font-serif font-bold text-slate-200">{title}</h1>
      <p className="text-slate-400 max-w-md mx-auto">{description}</p>
    </div>
  );
}