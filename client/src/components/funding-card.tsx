import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Euro, Tag, Eye, ExternalLink, Building2 } from "lucide-react";
import type { FundingOpportunity } from "@shared/schema";

interface FundingCardProps {
  opportunity: FundingOpportunity;
  onOpenModal: (opportunity: FundingOpportunity) => void;
  viewMode?: "list" | "grid";
}

export function FundingCard({ opportunity, onOpenModal, viewMode = "grid" }: FundingCardProps) {
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

  if (viewMode === "list") {
    return (
      <Card className="card-shadow hover:card-shadow-hover transition-all duration-300 border-0 group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                      {opportunity.title}
                    </h3>
                    <Badge className={`${getStatusColor(opportunity.status)} font-medium px-2 py-1 text-xs ml-3 flex-shrink-0`}>
                      {opportunity.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{opportunity.fundingProgram}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3 text-primary" />
                      <span>{formatDate(opportunity.deadline)}</span>
                    </div>
                    <div className="flex items-center">
                      <Euro className="mr-1 h-3 w-3 text-primary" />
                      <span>{formatAmount(opportunity.minAmount, opportunity.maxAmount)}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="mr-1 h-3 w-3 text-primary" />
                      <span>{opportunity.fundingType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    onClick={() => onOpenModal(opportunity)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Détails
                  </Button>
                  {opportunity.externalLink && (
                    <Button variant="outline" size="sm" asChild className="border-border hover:bg-accent">
                      <a href={opportunity.externalLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow hover:card-shadow-hover transition-all duration-300 border-0 group">
      <CardContent className="p-6">
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                {opportunity.title}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="mr-2 h-4 w-4" />
                <span>{opportunity.fundingProgram}</span>
              </div>
            </div>
            <Badge className={`${getStatusColor(opportunity.status)} font-medium px-3 py-1`}>
              {opportunity.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-3 h-4 w-4 text-primary" />
              <span className="font-medium">Date limite:</span>
              <span className="ml-2">{formatDate(opportunity.deadline)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Euro className="mr-3 h-4 w-4 text-primary" />
              <span className="font-medium">Montant:</span>
              <span className="ml-2">{formatAmount(opportunity.minAmount, opportunity.maxAmount)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Tag className="mr-3 h-4 w-4 text-primary" />
              <span className="font-medium">Type:</span>
              <span className="ml-2">{opportunity.fundingType}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {opportunity.sectors.map((sector, index) => (
              <Badge key={index} variant="outline" className="text-xs font-medium bg-accent/50 text-accent-foreground border-accent">
                {sector}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={() => onOpenModal(opportunity)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </Button>
            {opportunity.externalLink && (
              <Button variant="outline" size="icon" asChild className="border-border hover:bg-accent">
                <a href={opportunity.externalLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
