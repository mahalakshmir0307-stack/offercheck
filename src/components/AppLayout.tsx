import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  TreePine, Menu, X, LogOut, LayoutDashboard, PlusCircle,
  PackageOpen, Lightbulb, Boxes, BarChart3, FileText, Network,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Wood Inventory', icon: PackageOpen },
  { to: '/add-wood', label: 'Add Material', icon: PlusCircle },
  { to: '/suggestions', label: 'Product Recommendations', icon: Lightbulb },
  { to: '/products', label: 'Created Products', icon: Boxes },
  { to: '/analytics', label: 'Business Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/architecture', label: 'Architecture', icon: Network },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-charcoal-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 bg-charcoal-900 border-r border-charcoal-800 z-40">
        <div className="px-5 py-4 border-b border-charcoal-800">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-amber-700 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">WoodValue</span>
              <p className="text-[11px] text-charcoal-400 -mt-0.5">Material Intelligence Platform</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-amber-700 text-white'
                    : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-white'
                )}
              >
                <item.icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-white' : 'text-charcoal-500 group-hover:text-charcoal-300')} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-2.5 py-3 border-t border-charcoal-800">
          <div className="px-3 py-1.5 mb-1">
            <p className="text-xs font-medium text-charcoal-300 truncate">
              {session?.user?.email || 'Owner'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-charcoal-400 hover:bg-charcoal-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-charcoal-900 border-b border-charcoal-800 px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-amber-700 flex items-center justify-center">
            <TreePine className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white">WoodValue</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-charcoal-300 p-1 rounded-md hover:bg-charcoal-800 transition-colors">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-charcoal-900 overflow-y-auto animate-slide-up">
            <div className="px-5 py-4 border-b border-charcoal-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-amber-700 flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-bold text-white">WoodValue</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-charcoal-300 p-1 rounded-md hover:bg-charcoal-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-2.5 py-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-amber-700 text-white'
                        : 'text-charcoal-400 hover:bg-charcoal-800'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-charcoal-400 hover:bg-charcoal-800"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 pt-14 lg:pt-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
