import { useState } from "react";
import { Search, Filter, Globe, Building, X, ChevronDown, List, Grid3X3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SearchFilters {
  searchTerm?: string;
  fundingType?: string;
  region?: string;
  fonds?: string;
  sortBy?: string;
  viewMode?: "list" | "grid";
}

interface SearchAndFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
}

export function SearchAndFilters({ onFiltersChange }: SearchAndFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "deadline",
    viewMode: "list"
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    if (value === "title" && filters.sortBy === "title") {
      // Si déjà trié par titre A→Z, basculer vers Z→A
      handleFilterChange("sortBy", "title_desc");
    } else {
      handleFilterChange("sortBy", value);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: "",
      fundingType: "",
      region: "",
      fonds: "",
      sortBy: "deadline",
      viewMode: filters.viewMode
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom de fonds, titre..."
              value={filters.searchTerm || ""}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-300 transition-colors"
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filters.fundingType || ""} onValueChange={(value) => handleFilterChange("fundingType", value)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-50 border-gray-200 focus:bg-white">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <SelectValue placeholder="Type de financement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Don">Don</SelectItem>
                <SelectItem value="Subvention">Subvention</SelectItem>
                <SelectItem value="Prêt">Prêt</SelectItem>
                <SelectItem value="Mixte">Mixte</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.region || ""} onValueChange={(value) => handleFilterChange("region", value)}>
              <SelectTrigger className="w-full sm:w-[160px] bg-gray-50 border-gray-200 focus:bg-white">
                <Globe className="h-4 w-4 text-gray-400 mr-2" />
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                <SelectItem value="mauritanie">Mauritanie</SelectItem>
                <SelectItem value="sahel">Sahel</SelectItem>
                <SelectItem value="afrique-ouest">Afrique de l'Ouest</SelectItem>
                <SelectItem value="global">Global</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.fonds || ""} onValueChange={(value) => handleFilterChange("fonds", value)}>
              <SelectTrigger className="w-full sm:w-[160px] bg-gray-50 border-gray-200 focus:bg-white">
                <Building className="h-4 w-4 text-gray-400 mr-2" />
                <SelectValue placeholder="Fonds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les fonds</SelectItem>
                <SelectItem value="GCF">Guichet permanent du GCF</SelectItem>
                <SelectItem value="GEF">Fonds GEF</SelectItem>
                <SelectItem value="CIF">Programme CIF</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-normal"
            >
              <X className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          </div>
        </div>
      </div>

      {/* Barre de tri et affichage */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trier par :</span>
          <Select value={filters.sortBy || "deadline"} onValueChange={handleSortChange}>
            <SelectTrigger className="w-auto min-w-[200px] bg-transparent border-none shadow-none text-sm text-gray-600">
              <SelectValue />
              <ChevronDown className="h-4 w-4 ml-2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline">Date limite (plus urgent)</SelectItem>
              <SelectItem value="amount">Montant (plus élevé)</SelectItem>
              <SelectItem value="recent">Plus récent</SelectItem>
              <SelectItem value="title">Nom {filters.sortBy === "title" ? "(A→Z)" : filters.sortBy === "title_desc" ? "(Z→A)" : ""}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Affichage :</span>
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => handleFilterChange("viewMode", "list")}
              className={`p-2 rounded-md transition-colors ${
                filters.viewMode === "list"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleFilterChange("viewMode", "grid")}
              className={`p-2 rounded-md transition-colors ${
                filters.viewMode === "grid"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}