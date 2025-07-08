import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Tag, Eye, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { FundingOpportunity } from "@shared/schema";

interface FundingCardProps {
  opportunity: FundingOpportunity;
}

export function FundingCard({ opportunity }: FundingCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
            <p className="text-sm text-gray-600">{opportunity.fundingProgram}</p>
          </div>
          <Badge className={getStatusColor(opportunity.status)}>
            {opportunity.status}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>Date limite: {formatDate(opportunity.deadline)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="mr-2 h-4 w-4 text-primary" />
            <span>Montant: {formatAmount(opportunity.minAmount, opportunity.maxAmount)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Tag className="mr-2 h-4 w-4 text-primary" />
            <span>Type: {opportunity.fundingType}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">{opportunity.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.sectors.map((sector, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {sector}
            </Badge>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button asChild className="flex-1">
            <Link href={`/funding/${opportunity.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Voir détails
            </Link>
          </Button>
          {opportunity.externalLink && (
            <Button variant="outline" asChild>
              <a href={opportunity.externalLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
