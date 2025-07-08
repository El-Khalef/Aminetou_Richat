import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { StatisticsCards } from "@/components/statistics-cards";
import { FundingFilters, FilterValues } from "@/components/funding-filters";
import { FundingCard } from "@/components/funding-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { FundingOpportunity } from "@shared/schema";

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: opportunities, isLoading } = useQuery<FundingOpportunity[]>({
    queryKey: ["/api/funding-opportunities", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/funding-opportunities?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch funding opportunities");
      }
      return response.json();
    },
  });

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Tableau de bord des financements
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Découvrez et gérez les opportunités de financement disponibles pour la Mauritanie. 
              Utilisez les filtres pour trouver les appels qui correspondent à vos projets.
            </p>
          </div>
        </div>

        <StatisticsCards />

        <FundingFilters onFiltersChange={handleFiltersChange} />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="card-shadow border-0">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : opportunities?.length === 0 ? (
            <div className="col-span-full">
              <Card className="card-shadow border-0">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Aucun appel trouvé
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Aucun appel à projet ne correspond aux filtres sélectionnés. 
                      Essayez de modifier vos critères de recherche.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            opportunities?.map((opportunity) => (
              <FundingCard key={opportunity.id} opportunity={opportunity} />
            ))
          )}
        </div>

        {opportunities && opportunities.length > 6 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex space-x-2">
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Précédent
              </button>
              <button className="px-3 py-2 text-sm bg-primary text-white rounded-md">
                1
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
