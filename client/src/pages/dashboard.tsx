import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { StatisticsCards } from "@/components/statistics-cards";
import { FundingFilters, FilterValues } from "@/components/funding-filters";
import { FundingCard } from "@/components/funding-card";
import { Skeleton } from "@/components/ui/skeleton";
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tableau de bord des financements
          </h2>
          <p className="text-gray-600">
            Consultez et gérez les appels à projets éligibles pour la Mauritanie
          </p>
        </div>

        <StatisticsCards />

        <FundingFilters onFiltersChange={handleFiltersChange} />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            ))
          ) : opportunities?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                Aucun appel à projet trouvé avec les filtres actuels
              </p>
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
