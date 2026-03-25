import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Store,
  FileText,
  Leaf,
  Settings,
  LogOut,
  Radio,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Deliveries", href: "/dashboard/deliveries", icon: Package },
  { name: "Drones", href: "/dashboard/drones", icon: Radio },
  { name: "Vendors", href: "/dashboard/vendors", icon: Store },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Environmental Monitoring", href: "/dashboard/environmental", icon: Leaf },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-[#8A1538] text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#751130] justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Radio className="w-6 h-6 text-[#8A1538]" />
              </div>
              <div>
                <div className="font-semibold text-lg">EcoDrone</div>
                <div className="text-xs text-white/70">ASEM Agile 5</div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto">
              <Radio className="w-6 h-6 text-[#8A1538]" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-white text-[#8A1538]"
                    : "text-white/90 hover:bg-[#751130]"
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#751130] space-y-3">
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white/90 hover:bg-[#751130] ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? "Expand menu" : "Collapse menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
          <div className="text-xs text-white/60 text-center">{isCollapsed ? '©' : '© 2026 Agile5'}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h2 className="text-xl" style={{ color: '#8A1538' }}>
              Admin Dashboard
            </h2>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#8A1538] flex items-center justify-center">
                <span className="text-white text-sm">AD</span>
              </div>
              <div className="text-left">
                <div className="text-sm">Admin User</div>
                <div className="text-xs text-gray-500">admin@ashesi.edu.gh</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/')}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}