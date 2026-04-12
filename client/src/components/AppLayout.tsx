import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  const navItems = [
    { label: "Register Student", path: "/register", icon: "👤" },
    { label: "Live Attendance", path: "/attendance", icon: "📹" },
    { label: "Attendance History", path: "/history", icon: "📊" },
    { label: "About/Explainer", path: "/about", icon: "ℹ️" },
  ];

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-accent">SmartAttend</h1>
                <p className="text-xs text-muted-foreground">Face Recognition</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          {user ? (
            <div className="space-y-2">
              {sidebarOpen && (
                <div className="px-2 py-2">
                  <p className="text-xs text-muted-foreground">Logged in as</p>
                  <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="w-full justify-center gap-2"
              >
                <LogOut size={16} />
                {sidebarOpen && "Logout"}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              {sidebarOpen ? "Login" : "🔐"}
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
