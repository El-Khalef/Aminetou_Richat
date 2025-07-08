import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, DollarSign, Calendar } from "lucide-react";

export function StatisticsCards() {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["/api/funding-statistics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K€`;
    }
    return `${amount}€`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Appels ouverts</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.totalOpen || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">À venir</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.totalPending || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(statistics?.totalAmount || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cette semaine</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.thisWeek || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
