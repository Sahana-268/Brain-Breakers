import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user } = useAuthStore();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Good Morning';
    if (h < 17) return '🌤️ Good Afternoon';
    return '🌙 Good Evening';
  };

  return (
    <header className="h-16 bg-white border-b border-primary-100 flex items-center px-6 gap-4 sticky top-0 z-20 shadow-sm">
      {/* Greeting & Institute Brand */}
      <div className="flex-1 flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="Brain Breakers Academy"
          className="w-8 h-8 rounded-lg object-cover shadow-sm md:hidden"
        />
        <div>
          <p className="text-sm font-semibold text-navy-800">
            {greeting()}, <span className="text-primary-600">{user?.full_name.split(' ')[0]}</span>!
          </p>
          <p className="text-xs text-gray-500 font-medium">
            Brain Breakers Academy · <span className="italic text-primary-600">Think Beyond, Learn Beyond</span>
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-xl px-3 py-2 w-56">
        <Search size={15} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl hover:bg-primary-50 transition-colors">
        <Bell size={18} className="text-gray-500" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* Avatar */}
      <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-primary-700 transition-colors">
        {user?.full_name.charAt(0).toUpperCase()}
      </div>
    </header>
  );
}

