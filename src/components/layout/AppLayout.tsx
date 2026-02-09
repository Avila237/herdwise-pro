import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  ClipboardList,
  Settings,
  BarChart3,
  FileSpreadsheet,
  Menu,
  X,
  Beef,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useFarmContext } from '@/hooks/useFarm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DemoBanner } from '@/components/common/DemoBanner';

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

function NavItem({ to, icon, label, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentFarm, farms, setCurrentFarm } = useFarmContext();
  const location = useLocation();

  const navItems = [
    { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/animals', icon: <Beef className="w-5 h-5" />, label: 'Animais' },
    { to: '/events', icon: <Calendar className="w-5 h-5" />, label: 'Eventos' },
    { to: '/ia-iatf', icon: <Stethoscope className="w-5 h-5" />, label: 'IA / IATF' },
    { to: '/history', icon: <ClipboardList className="w-5 h-5" />, label: 'Histórico' },
    { to: '/metrics', icon: <BarChart3 className="w-5 h-5" />, label: 'Métricas' },
    { to: '/import', icon: <FileSpreadsheet className="w-5 h-5" />, label: 'Importar' },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Configurações' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <DemoBanner />
      <div className="flex flex-1">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <Beef className="w-8 h-8 text-sidebar-primary" />
              <span className="text-lg font-bold text-sidebar-foreground">
                ReproGestão
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Farm selector */}
          <div className="p-4 border-b border-sidebar-border">
            <label className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Fazenda
            </label>
            <Select
              value={currentFarm?.id || ''}
              onValueChange={(value) => {
                const farm = farms.find(f => f.id === value);
                if (farm) setCurrentFarm(farm);
              }}
            >
              <SelectTrigger className="mt-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <SelectValue placeholder="Selecione uma fazenda" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/50 text-center">
              Sistema de Gestão Reprodutiva
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
            </h1>
            {currentFarm && (
              <p className="text-sm text-muted-foreground">{currentFarm.name}</p>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      </div>
    </div>
  );
}
