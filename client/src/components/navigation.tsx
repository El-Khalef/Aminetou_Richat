import { Link, useLocation } from "wouter";
import { Search, Bell, User } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary">
                <Search className="inline mr-2 h-5 w-5" />
                Mauritanie Funding Tracker
              </h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  href="/"
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive("/")
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/funding"
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive("/funding")
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  Tous les appels
                </Link>
                <Link
                  href="/add-funding"
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive("/add-funding")
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  Ajouter manuellement
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              <Bell className="inline mr-2 h-4 w-4" />
              Notifications
            </button>
            <div className="relative">
              <User className="h-8 w-8 rounded-full bg-gray-200 p-1" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
