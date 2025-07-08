import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  User, 
  Calendar, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Download,
  UserPlus,
  Search,
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
    structureType?: string;
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

const REQUIRED_DOCUMENTS = [
  "Statuts juridiques",
  "Budget prévisionnel",
  "Plan d'affaires",
  "Preuves de cofinancement",
  "Relevé d'identité bancaire",
  "Identité du représentant légal",
  "Annexes techniques"
];

export default function Dossiers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);

  const { data: applications = [], isLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications"],
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.client.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.fundingOpportunity.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCompletionBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Prêt pour soumission</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Documents presque complets</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">En cours de finalisation</Badge>;
    return <Badge className="bg-red-100 text-red-800">Documents incomplets</Badge>;
  };

  const getScoreStars = (score: number) => {
    const stars = Math.round(score / 20);
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
    ));
  };

  const getMissingDocuments = (documents: ApplicationWithDetails['documents']) => {
    const submittedTypes = documents.map(doc => doc.documentType);
    return REQUIRED_DOCUMENTS.filter(reqDoc => !submittedTypes.includes(reqDoc));
  };

  const DocumentModal = ({ application }: { application: ApplicationWithDetails }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents - {application.client.organizationName}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Informations du dossier */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Appel à projet</p>
            <p className="font-medium">{application.fundingOpportunity.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Score de complétude</p>
            <div className="flex items-center gap-2">
              <div className="flex">{getScoreStars(application.completionScore)}</div>
              <span className="text-sm font-medium">{application.completionScore}/100</span>
            </div>
          </div>
        </div>

        {/* Documents soumis */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Documents soumis</h3>
          <div className="space-y-2">
            {application.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{doc.fileName}</p>
                    <p className="text-sm text-gray-600">{doc.documentType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status === "Soumis" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents manquants */}
        {getMissingDocuments(application.documents).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-red-700">Documents manquants</h3>
            <div className="space-y-2">
              {getMissingDocuments(application.documents).map((docType) => (
                <div key={docType} className="flex items-center gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700">{docType}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );

  // Fonction pour formater le type de structure
  const getStructureTypeBadge = (structureType: string | undefined) => {
    if (!structureType) return null;
    
    const configs = {
      'État': { label: 'État', variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'Institution publique': { label: 'Institution publique', variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200' },
      'Privé': { label: 'Privé : ONG / PME / Coopérative', variant: 'outline' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' },
    };
    
    const config = configs[structureType as keyof typeof configs] || configs['Privé'];
    
    return (
      <Badge variant={config.variant} className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers de candidature</h1>
          <p className="text-gray-600 mt-1">Gérez les candidatures clients et leur documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredApplications.length} dossier{filteredApplications.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par organisation ou appel à projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="En cours">En cours</SelectItem>
            <SelectItem value="Prêt">Prêt</SelectItem>
            <SelectItem value="Soumis">Soumis</SelectItem>
            <SelectItem value="Approuvé">Approuvé</SelectItem>
            <SelectItem value="Rejeté">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des dossiers */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">{application.client.organizationName}</h3>
                    {getStructureTypeBadge(application.client.structureType)}
                    <Badge variant="outline">{application.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Appel à projet</p>
                      <p className="font-medium">{application.fundingOpportunity.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium">{application.client.contactPerson}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Score :</span>
                      <div className="flex">{getScoreStars(application.completionScore)}</div>
                      <span className="text-sm font-medium">{application.completionScore}/100</span>
                    </div>
                    {getCompletionBadge(application.completionScore)}
                  </div>

                  {application.assignedConsultant && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Assigné à : {application.assignedConsultant}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Voir les documents
                      </Button>
                    </DialogTrigger>
                    <DocumentModal application={application} />
                  </Dialog>

                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    à définir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun dossier trouvé</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all" 
              ? "Essayez de modifier vos critères de recherche" 
              : "Aucun dossier de candidature n'a été soumis pour le moment"}
          </p>
        </div>
      )}
    </div>
  );
}