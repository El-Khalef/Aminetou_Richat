import { Link, useLocation } from "wouter";
import { Search, Bell, User } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-foreground">
                <Search className="inline mr-3 h-5 w-5 text-primary" />
                <span className="text-primary">Richat</span>
                <span className="text-muted-foreground ml-1">Funding Tracker</span>
              </h1>
            </div>
            <div className="hidden md:block ml-12">
              <div className="flex items-baseline space-x-1">
                <Link
                  href="/"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive("/")
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/add-funding"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive("/add-funding")
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  Ajouter un appel
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              <Bell className="inline mr-2 h-4 w-4" />
              Notifications
            </button>
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
