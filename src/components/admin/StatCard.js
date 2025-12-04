export default function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-6">
      <div className={`p-4 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={color} size={28} />
      </div>
      <div>
        <p className="text-sm text-stone-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-stone-800">{value}</p>
      </div>
    </div>
  );
}