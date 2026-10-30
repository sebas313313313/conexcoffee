import { Users, Leaf, Building2, ShoppingBag } from 'lucide-react';

const ICON_MAP = {
  Users,
  Leaf,
  Building2,
  ShoppingBag,
};

export default function StatKPI({ stat }) {
  const Icon = stat.icon || ICON_MAP[stat.iconName] || Users;


  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{stat.label}</p>
          <p className="text-3xl font-extrabold text-surface-900 mt-1 tabular-nums">{stat.value}</p>
        </div>
        <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: stat.bg }}>
          <Icon className="h-6 w-6" style={{ color: stat.color }} />
        </div>
      </div>
    </div>
  );
}
