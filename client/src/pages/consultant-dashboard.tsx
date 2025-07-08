import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Star,
  Edit3
} from "lucide-react";

interface ApplicationWithDetails {
  id: number;
  client: {
    id: number;
    organizationName: string;
    contactPerson: string;
    email: string;
    phone?: string;
  };
  fundingOpportunity: {
    id: number;
    title: string;
    fundingProgram: string;
  };
  status: string;
  submissionDate: string;
  assignedConsultant?: string;
  completionScore: number;
  notes?: string;
  requestedAmount?: number;
  fundingType?: string;
  documents: Array<{
    id: number;
    documentType: string;
    fileName: string;
    fileType?: string;
    uploadDate: string;
    isRequired: boolean;
    status: string;
  }>;
}

const statusConfig = {
  "En attente de documents": { color: "bg-yellow-100 text-yellow-800", progress: 20 },
  "En cours d'analyse": { color: "bg-blue-100 text-blue-800", progress: 50 },
  "Complet": { color: "bg-green-100 text-green-800", progress: 80 },
  "Prêt pour soumission": { color: "bg-purple-100 text-purple-800", progress: 95 },
  "Soumis au bailleur": { color: "bg-indigo-100 text-indigo-800", progress: 100 },
  "Accepté": { color: "bg-emerald-100 text-emerald-800", progress: 100 },
  "Refusé": { color: "bg-red-100 text-red-800", progress: 100 }
};

const requiredDocuments = [
  "Statuts juridiques",
  "Budget prévisionnel",
  "Business plan",
  "Pitch deck",
  "Lettre d'intention",
  "Étude de faisabilité",
  "Annexes",
  "Preuves de cofinancement"
];

export default function ConsultantDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [analysisNotes, setAnalysisNotes] = useState("");

  const { data: applications = [], isLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications"],
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.client.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.fundingOpportunity.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "tous" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-100 text-gray-800", progress: 0 };
    return <Badge className={config.color}>{status}</Badge>;
  };

  const getProgressValue = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.progress || 0;
  };

  const getMissingDocuments = (documents: ApplicationWithDetails['documents']) => {
    const submittedTypes = documents.map(doc => doc.documentType);
    return requiredDocuments.filter(reqDoc => !submittedTypes.includes(reqDoc));
  };

  const getViabilityScore = (score: number) => {
    const stars = Math.round(score / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const DocumentModal = ({ application }: { application: ApplicationWithDetails }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          Dossier: {application.client.organizationName} - {application.fundingOpportunity.title}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Documents soumis */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents soumis
          </h3>
          <div className="grid gap-2">
            {application.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{doc.documentType}</p>
                    <p className="text-sm text-gray-600">{doc.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status === "Validé" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents manquants */}
        {getMissingDocuments(application.documents).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Documents manquants
            </h3>
            <div className="grid gap-2">
              {getMissingDocuments(application.documents).map((docType) => (
                <div key={docType} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">{docType}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyse financière */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analyse financière
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Viabilité économique</Label>
                <div className="flex items-center gap-2">
                  {getViabilityScore(application.completionScore)}
                  <span className="text-sm text-gray-600">({application.completionScore}/100)</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cohérence budget/activité</Label>
                <div className="flex items-center gap-2">
                  {getViabilityScore(85)}
                  <span className="text-sm text-gray-600">(85/100)</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Capacité de cofinancement</Label>
                <div className="flex items-center gap-2">
                  {getViabilityScore(70)}
                  <span className="text-sm text-gray-600">(70/100)</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alignement critères fonds</Label>
                <div className="flex items-center gap-2">
                  {getViabilityScore(90)}
                  <span className="text-sm text-gray-600">(90/100)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes d'analyse</Label>
              <Textarea 
                value={analysisNotes || application.notes || ""}
                onChange={(e) => setAnalysisNotes(e.target.value)}
                placeholder="Saisir votre analyse financière détaillée..."
                className="min-h-[120px]"
              />
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tableau de bord consultante</h1>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord consultante</h1>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par organisation ou projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="En attente de documents">En attente de documents</SelectItem>
            <SelectItem value="En cours d'analyse">En cours d'analyse</SelectItem>
            <SelectItem value="Complet">Complet</SelectItem>
            <SelectItem value="Prêt pour soumission">Prêt pour soumission</SelectItem>
            <SelectItem value="Soumis au bailleur">Soumis au bailleur</SelectItem>
            <SelectItem value="Accepté">Accepté</SelectItem>
            <SelectItem value="Refusé">Refusé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tableau de bord des projets */}
      <div className="grid gap-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                {/* Client et projet */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-lg">{application.client.organizationName}</h3>
                  <p className="text-sm text-gray-600">{application.fundingOpportunity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{application.client.contactPerson}</p>
                </div>

                {/* Type et montant */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{application.fundingType || "Subvention"}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {application.requestedAmount ? `${application.requestedAmount?.toLocaleString()} €` : "Non spécifié"}
                  </p>
                </div>

                {/* Statut */}
                <div>
                  {getStatusBadge(application.status)}
                  <p className="text-xs text-gray-500 mt-1">
                    Assigné à: {application.assignedConsultant || "Non assigné"}
                  </p>
                </div>

                {/* Avancement */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={getProgressValue(application.status)} className="flex-1" />
                    <span className="text-sm font-medium">{getProgressValue(application.status)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getViabilityScore(application.completionScore)}
                    <span className="text-xs text-gray-500 ml-1">({application.completionScore}/100)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedApplication(application)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                    </DialogTrigger>
                    {selectedApplication && <DocumentModal application={selectedApplication} />}
                  </Dialog>
                  
                  <Button size="sm" variant="outline">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </div>

              {/* Documents manquants */}
              {getMissingDocuments(application.documents).length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Documents manquants: {getMissingDocuments(application.documents).join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Aucun dossier trouvé pour les critères sélectionnés.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}