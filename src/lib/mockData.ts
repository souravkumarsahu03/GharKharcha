import type { User, Room, MonthlyCycle, Contribution, Expense, CategoryItem } from '../types';

export const INITIAL_MEMBERS: User[] = [
  {
    id: 'user-sourav',
    name: 'Sourav',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sourav&backgroundColor=b6e3f4,c0aede,d1d4f9',
    phone: '7008145409',
    upi_id: 'sourav.treasurer@upi',
    email: 'sourav@roomsplit.app',
  },
  {
    id: 'user-suraj',
    name: 'Suraj',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suraj&backgroundColor=ffdfbf,ffd5dc,d1d4f9',
    phone: '9265079711',
    upi_id: 'suraj@upi',
    email: 'suraj@roomsplit.app',
  },
  {
    id: 'user-parth',
    name: 'Parth',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Parth&backgroundColor=c0aede,b6e3f4',
    phone: '9898421377',
    upi_id: 'parth@upi',
    email: 'parth@roomsplit.app',
  },
  {
    id: 'user-kushal',
    name: 'Kushal',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kushal&backgroundColor=d1d4f9,c0aede',
    phone: '8780038775',
    upi_id: 'kushal@upi',
    email: 'kushal@roomsplit.app',
  },
  {
    id: 'user-tushar',
    name: 'Tushar',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tushar&backgroundColor=ffd5dc,ffdfbf',
    phone: '9664604345',
    upi_id: 'tushar@upi',
    email: 'tushar@roomsplit.app',
  },
  {
    id: 'user-mahesh',
    name: 'Mahesh',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mahesh&backgroundColor=b6e3f4,ffdfbf',
    phone: '9023140836',
    upi_id: 'mahesh@upi',
    email: 'mahesh@roomsplit.app',
  },
];

export const INITIAL_ROOM: Room = {
  id: 'room-bachelor-1',
  name: 'Bachelor Room',
  monthly_contribution: 8000,
  contribution_day: 7,
  currency: 'INR',
  total_members: 6,
  treasurer_id: 'user-sourav',
};

export const INITIAL_CYCLE: MonthlyCycle = {
  id: 'cycle-2026-10',
  room_id: 'room-bachelor-1',
  year_month: '2026-10',
  display_name: 'October 2026',
  deadline: '2026-10-07',
  status: 'ACTIVE',
  created_at: '2026-10-01T00:00:00Z',
};

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-rent', name: 'Rent', icon: 'Home', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingBag', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'cat-vegetables', name: 'Vegetables', icon: 'Apple', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { id: 'cat-electricity', name: 'Electricity', icon: 'Zap', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'cat-internet', name: 'Internet', icon: 'Wifi', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'cat-gas', name: 'Gas', icon: 'Flame', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { id: 'cat-cleaning', name: 'Cleaning', icon: 'Sparkles', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  { id: 'cat-household', name: 'Household Items', icon: 'Box', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'cat-maintenance', name: 'Maintenance', icon: 'Wrench', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'cat-repairs', name: 'Repairs', icon: 'Hammer', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { id: 'cat-water', name: 'Drinking Water', icon: 'Droplets', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  { id: 'cat-food', name: 'Food', icon: 'Utensils', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 'cat-other', name: 'Other', icon: 'MoreHorizontal', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
];

export const INITIAL_CONTRIBUTIONS: Contribution[] = INITIAL_MEMBERS.map((m) => ({
  id: `contrib-${m.id}-2026-10`,
  cycle_id: 'cycle-2026-10',
  member_id: m.id,
  amount: 0,
  target_amount: 8000,
  remaining_amount: 8000,
  status: 'PENDING',
}));

export const INITIAL_EXPENSES: Expense[] = [];

