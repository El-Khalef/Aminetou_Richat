import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
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
  Edit3,
  User,
  Building
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
  "En attente de documents": { color: "bg-yellow-50 text-yellow-700 border-yellow-200", progress: 20 },
  "En cours d'analyse": { color: "bg-blue-50 text-blue-700 border-blue-200", progress: 50 },
  "Complet": { color: "bg-green-50 text-green-700 border-green-200", progress: 80 },
  "Prêt pour soumission": { color: "bg-purple-50 text-purple-700 border-purple-200", progress: 95 },
  "Soumis au bailleur": { color: "bg-indigo-50 text-indigo-700 border-indigo-200", progress: 100 },
  "Accepté": { color: "bg-emerald-50 text-emerald-700 border-emerald-200", progress: 100 },
  "Refusé": { color: "bg-red-50 text-red-700 border-red-200", progress: 100 }
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

export default function Financements() {
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
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-50 text-gray-700 border-gray-200", progress: 0 };
    return <Badge className={`${config.color} border font-medium`}>{status}</Badge>;
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
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-gray-900">
          {application.client.organizationName} - {application.fundingOpportunity.title}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-8">
        {/* Documents soumis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <FileText className="w-5 h-5 text-blue-600" />
            Documents soumis
          </h3>
          <div className="space-y-3">
            {application.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.documentType}</p>
                    <p className="text-sm text-gray-500">{doc.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={doc.status === "Validé" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}>
                    {doc.status}
                  </Badge>
                  <Button size="sm" variant="outline" className="border-gray-300">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents manquants */}
        {getMissingDocuments(application.documents).length > 0 && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Documents manquants
            </h3>
            <div className="space-y-3">
              {getMissingDocuments(application.documents).map((docType) => (
                <div key={docType} className="flex items-center gap-3 p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">{docType}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyse financière */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Analyse financière
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Viabilité économique</Label>
                <div className="flex items-center gap-2">
                  {getViabilityScore(application.completionScore)}
                  <span className="text-sm text-gray-500">({application.completionScore}/100)</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Cohérence budget/activité</Label>
                <div className="flex items-center gap-2">
                  {getViabilityScore(85)}
                  <span className="text-sm text-gray-500">(85/100)</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Capacité de cofinancement</Label>
                <div className="flex items-center gap-2">
                  {getViabilityScore(70)}
                  <span className="text-sm text-gray-500">(70/100)</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Alignement critères fonds</Label>
                <div className="flex items-center gap-2">
                  {getViabilityScore(90)}
                  <span className="text-sm text-gray-500">(90/100)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Notes d'analyse</Label>
              <Textarea 
                value={analysisNotes || application.notes || ""}
                onChange={(e) => setAnalysisNotes(e.target.value)}
                placeholder="Saisir votre analyse financière détaillée..."
                className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord consultante</h1>
            </div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse border-gray-200">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord consultante</h1>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Rechercher par organisation ou projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
          </div>

          {/* Tableau de bord des projets */}
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Client et projet */}
                    <div className="lg:col-span-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{application.client.organizationName}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{application.fundingOpportunity.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{application.client.contactPerson}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Type et montant */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-gray-900">{application.fundingType || "Subvention"}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {application.requestedAmount ? `${application.requestedAmount?.toLocaleString()} €` : "Non spécifié"}
                        </p>
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        {getStatusBadge(application.status)}
                        <p className="text-xs text-gray-500">
                          Assigné à: {application.assignedConsultant || "Non assigné"}
                        </p>
                      </div>
                    </div>

                    {/* Avancement */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Avancement</span>
                            <span className="text-sm text-gray-600">{getProgressValue(application.status)}%</span>
                          </div>
                          <Progress value={getProgressValue(application.status)} className="h-2" />
                        </div>
                        <div className="flex items-center gap-1">
                          {getViabilityScore(application.completionScore)}
                          <span className="text-xs text-gray-500 ml-1">({application.completionScore}/100)</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-3">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="border-gray-300" onClick={() => setSelectedApplication(application)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir documents
                            </Button>
                          </DialogTrigger>
                          {selectedApplication && <DocumentModal application={selectedApplication} />}
                        </Dialog>
                        
                        <Button size="sm" variant="outline" className="border-gray-300">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Documents manquants */}
                  {getMissingDocuments(application.documents).length > 0 && (
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Documents manquants: {getMissingDocuments(application.documents).join(", ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Aucun dossier trouvé</p>
                <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}