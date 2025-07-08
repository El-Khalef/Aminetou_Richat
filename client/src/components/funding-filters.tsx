import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, Filter } from "lucide-react";

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
    <Card className="mb-12 card-shadow border-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Filtres de recherche</h3>
            <p className="text-sm text-muted-foreground">Trouvez les appels qui correspondent à vos critères</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sector" className="text-sm font-medium text-foreground">
              Secteur d'activité
            </Label>
            <Select onValueChange={(value) => handleInputChange("sector", value)}>
              <SelectTrigger className="bg-background border-border">
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

          <div className="space-y-2">
            <Label htmlFor="fundingType" className="text-sm font-medium text-foreground">
              Type de financement
            </Label>
            <Select onValueChange={(value) => handleInputChange("fundingType", value)}>
              <SelectTrigger className="bg-background border-border">
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

          <div className="space-y-2">
            <Label htmlFor="minAmount" className="text-sm font-medium text-foreground">
              Montant minimum (€)
            </Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="Ex: 50 000"
              className="bg-background border-border"
              value={filters.minAmount || ""}
              onChange={(e) => handleInputChange("minAmount", parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium text-foreground">
              Date limite avant le
            </Label>
            <Input
              id="deadline"
              type="date"
              className="bg-background border-border"
              value={filters.deadline || ""}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            <Search className="mr-2 h-4 w-4" />
            Rechercher les appels
          </Button>
          <Button onClick={handleReset} variant="outline" className="border-border hover:bg-accent">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
