import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Euro, TrendingUp } from "lucide-react";

export function StatisticsCards() {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["/api/funding-statistics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse card-shadow">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-muted rounded-xl"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
      <Card className="card-shadow hover:card-shadow-hover transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Appels ouverts</p>
              <p className="text-3xl font-bold text-foreground">{statistics?.totalOpen || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow hover:card-shadow-hover transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">À venir</p>
              <p className="text-3xl font-bold text-foreground">{statistics?.totalPending || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow hover:card-shadow-hover transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Euro className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Montant total</p>
              <p className="text-3xl font-bold text-foreground">
                {formatAmount(statistics?.totalAmount || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow hover:card-shadow-hover transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Cette semaine</p>
              <p className="text-3xl font-bold text-foreground">{statistics?.thisWeek || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
