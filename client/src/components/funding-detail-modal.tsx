import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Euro, Tag, ExternalLink, Building2, FileText, X, Bookmark, BookmarkCheck } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import type { FundingOpportunity } from "@shared/schema";

interface FundingDetailModalProps {
  opportunity: FundingOpportunity | null;
  open: boolean;
  onClose: () => void;
}

export function FundingDetailModal({ opportunity, open, onClose }: FundingDetailModalProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  
  if (!opportunity) return null;
  
  const isBookmarked = isFavorite(opportunity.id);

  const formatAmount = (min?: number, max?: number) => {
    if (!min && !max) return "Non spécifié";
    if (!max) return `À partir de ${min?.toLocaleString()}€`;
    if (!min) return `Jusqu'à ${max?.toLocaleString()}€`;
    if (min === max) return `${min?.toLocaleString()}€`;
    return `${min?.toLocaleString()}€ - ${max?.toLocaleString()}€`;
  };

  const formatDate = (date: string) => {
    if (!date) return "Date non spécifiée";
    // Retourner le texte tel quel sans formater comme une date
    return date;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ouvert":
        return "bg-green-100 text-green-800 border-green-200";
      case "À venir":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Fermé":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-xl font-semibold text-foreground leading-tight pr-8">
                {opportunity.title}
              </DialogTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="mr-2 h-4 w-4" />
                <span>{opportunity.fundingProgram}</span>
              </div>
            </div>
            <Badge className={`${getStatusColor(opportunity.status)} font-medium px-3 py-1`}>
              {opportunity.status}
            </Badge>
          </div>

        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Calendar className="mr-3 h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Date limite:</span>
                <span className="ml-2 text-muted-foreground">{formatDate(opportunity.deadline)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Euro className="mr-3 h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Montant:</span>
                <span className="ml-2 text-muted-foreground">{formatAmount(opportunity.minAmount, opportunity.maxAmount)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Tag className="mr-3 h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Type:</span>
                <span className="ml-2 text-muted-foreground">{opportunity.fundingType}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Secteurs concernés</h4>
                <div className="flex flex-wrap gap-2">
                  {opportunity.sectors.map((sector, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-medium bg-accent/50 text-accent-foreground border-accent">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-3 flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Description du programme
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          {opportunity.eligibilityCriteria && (
            <div className="border-t border-border pt-6">
              <h4 className="font-medium text-foreground mb-3">Critères d'éligibilité</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {opportunity.eligibilityCriteria}
              </p>
            </div>
          )}

          {opportunity.requiredDocuments && (
            <div className="border-t border-border pt-6">
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                📎 Documents à soumettre
              </h4>
              <ul className="space-y-2">
                {opportunity.requiredDocuments.split(';').map((doc, index) => (
                  <li key={index} className="flex items-start text-sm text-muted-foreground">
                    <span className="mr-2 mt-0.5">•</span>
                    <span className="leading-relaxed">{doc.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <div className="flex gap-3">
              {opportunity.externalLink && (
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  <a href={opportunity.externalLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Consulter l'appel officiel
                  </a>
                </Button>
              )}
              <Button 
                onClick={() => toggleFavorite(opportunity.id)}
                size="sm"
                className={`font-medium ${
                  isBookmarked 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                }`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="mr-2 h-4 w-4" />
                ) : (
                  <Bookmark className="mr-2 h-4 w-4" />
                )}
                {isBookmarked ? "Appel sauvegardé ✅" : "Sauvegarder cet appel"}
              </Button>
              <Button variant="outline" onClick={onClose} className="border-border hover:bg-accent">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}