import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";

export interface FilterValues {
  sector?: string;
  fundingType?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  deadline?: string;
}

interface FundingFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
}

export function FundingFilters({ onFiltersChange }: FundingFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({});

  const handleInputChange = (key: keyof FilterValues, value: string | number) => {
    const newFilters = { ...filters, [key]: value === "all" ? undefined : value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFiltersChange(filters);
  };

  const handleReset = () => {
    setFilters({});
    onFiltersChange({});
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres de recherche</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="sector" className="text-sm font-medium text-gray-700 mb-2">
              Secteur
            </Label>
            <Select onValueChange={(value) => handleInputChange("sector", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                <SelectItem value="Environnement">Environnement</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Éducation">Éducation</SelectItem>
                <SelectItem value="Santé">Santé</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Digital">Digital</SelectItem>
                <SelectItem value="Biodiversité">Biodiversité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fundingType" className="text-sm font-medium text-gray-700 mb-2">
              Type de financement
            </Label>
            <Select onValueChange={(value) => handleInputChange("fundingType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Don">Don</SelectItem>
                <SelectItem value="Subvention">Subvention</SelectItem>
                <SelectItem value="Prêt">Prêt</SelectItem>
                <SelectItem value="Mixte">Mixte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="minAmount" className="text-sm font-medium text-gray-700 mb-2">
              Montant minimum
            </Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="0"
              value={filters.minAmount || ""}
              onChange={(e) => handleInputChange("minAmount", parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 mb-2">
              Date limite
            </Label>
            <Input
              id="deadline"
              type="date"
              value={filters.deadline || ""}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          <Button onClick={handleSearch} className="bg-primary hover:bg-blue-700">
            <Search className="mr-2 h-4 w-4" />
            Rechercher
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
