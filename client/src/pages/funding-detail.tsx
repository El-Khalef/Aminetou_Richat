import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { FundingOpportunity } from "@shared/schema";

export default function FundingDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: opportunity, isLoading } = useQuery<FundingOpportunity>({
    queryKey: [`/api/funding-opportunities/${id}`],
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ouvert":
        return "status-open";
      case "À venir":
        return "status-pending";
      case "Fermé":
        return "status-closed";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Non spécifié";
    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)}`;
    if (min) return `À partir de ${formatNumber(min)}`;
    if (max) return `Jusqu'à ${formatNumber(max)}`;
    return "Non spécifié";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M€`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K€`;
    }
    return `${num}€`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Appel à projet non trouvé</p>
              <Button asChild className="mt-4">
                <Link href="/">Retour au tableau de bord</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Link>
                </Button>
                <CardTitle className="text-xl">{opportunity.title}</CardTitle>
              </div>
              <Badge className={getStatusColor(opportunity.status)}>
                {opportunity.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Informations générales</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Fonds:</span>
                    <span className="text-sm text-gray-900 ml-2">{opportunity.fundingProgram}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <span className="text-sm text-gray-900 ml-2">{opportunity.fundingType}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Montant:</span>
                    <span className="text-sm text-gray-900 ml-2">
                      {formatAmount(opportunity.minAmount, opportunity.maxAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Date limite:</span>
                    <span className="text-sm text-gray-900 ml-2">{formatDate(opportunity.deadline)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Secteurs prioritaires</h4>
                <div className="flex flex-wrap gap-2">
                  {opportunity.sectors.map((sector, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Description détaillée</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Critères d'éligibilité</h4>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {opportunity.eligibilityCriteria}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Documents requis</h4>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {opportunity.requiredDocuments}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>
              {opportunity.externalLink && (
                <Button asChild>
                  <a href={opportunity.externalLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visiter le site
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
