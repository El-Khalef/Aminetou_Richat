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
  Building,
  BarChart3,
  Calendar,
  Bell,
  Users,
  Target,
  Folder,
  Clock
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

// Configuration des widgets
const widgets = [
  {
    id: "overview",
    title: "Aperçu des dossiers",
    icon: Folder,
    description: "Vue d'ensemble des projets clients"
  },
  {
    id: "analysis",
    title: "Analyse financière",
    icon: BarChart3,
    description: "Scores et viabilité des projets"
  },
  {
    id: "missing-docs",
    title: "Documents manquants",
    icon: AlertCircle,
    description: "Pièces non soumises"
  },
  {
    id: "notifications",
    title: "Notifications récentes",
    icon: Bell,
    description: "Dernières activités"
  },
  {
    id: "ready-projects",
    title: "Projets prêts",
    icon: CheckCircle,
    description: "Dossiers à 100% complétés"
  },
  {
    id: "consultants",
    title: "Consultants actifs",
    icon: Users,
    description: "Assignations en cours"
  },
  {
    id: "calendar",
    title: "Calendrier",
    icon: Calendar,
    description: "Deadlines à venir"
  }
];

export default function Financements() {
  const [activeWidget, setActiveWidget] = useState("overview");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [analysisNotes, setAnalysisNotes] = useState("");

  const { data: applications = [], isLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications"],
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

  // Widgets Components
  const OverviewWidget = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total dossiers</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Projets prêts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === "Prêt pour soumission").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === "En attente de documents").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-3">
        {applications.slice(0, 5).map((application) => (
          <Card key={application.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{application.client.organizationName}</h3>
                    <p className="text-sm text-gray-500">{application.fundingOpportunity.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(application.status)}
                  <div className="w-20">
                    <Progress value={getProgressValue(application.status)} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const AnalysisWidget = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Score moyen de viabilité (à définir avec l'IA)</h3>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(applications.reduce((sum, app) => sum + app.completionScore, 0) / applications.length || 0)}
              </div>
              <span className="text-gray-500">/100</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Montant total demandé</h3>
            <div className="text-3xl font-bold text-blue-600">
              {applications.reduce((sum, app) => sum + (app.requestedAmount || 0), 0).toLocaleString()} €
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Analyse par projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{app.client.organizationName}</h4>
                  <p className="text-sm text-gray-500">{app.fundingOpportunity.fundingProgram}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getViabilityScore(app.completionScore)}
                  </div>
                  <span className="text-sm text-gray-500">({app.completionScore}/100)</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const MissingDocsWidget = () => (
    <div className="space-y-4">
      {applications.map((app) => {
        const missingDocs = getMissingDocuments(app.documents);
        if (missingDocs.length === 0) return null;
        
        return (
          <Card key={app.id} className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">{app.client.organizationName}</h3>
                  <p className="text-sm text-red-700 mt-1">Documents manquants:</p>
                  <ul className="text-sm text-red-600 mt-2 space-y-1">
                    {missingDocs.map((doc) => (
                      <li key={doc} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const NotificationsWidget = () => (
    <div className="space-y-3">
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Nouveau document soumis</p>
              <p className="text-sm text-gray-500">EcoTech Mauritanie - Il y a 2 heures</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Dossier prêt pour soumission</p>
              <p className="text-sm text-gray-500">Association Verte - Il y a 1 jour</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-gray-900">Document expiré</p>
              <p className="text-sm text-gray-500">Startup Solaire - Il y a 3 jours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ReadyProjectsWidget = () => (
    <div className="space-y-3">
      {applications.filter(app => app.status === "Prêt pour soumission").map((app) => (
        <Card key={app.id} className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">{app.client.organizationName}</h3>
                  <p className="text-sm text-green-700">{app.fundingOpportunity.title}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {app.requestedAmount ? `${app.requestedAmount.toLocaleString()} €` : "Montant non spécifié"}
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Soumettre
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ConsultantsWidget = () => (
    <div className="space-y-3">
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Aminetou EL KHALEF</h3>
              <p className="text-sm text-gray-500">5 dossiers assignés</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Consultant N2</h3>
              <p className="text-sm text-gray-500">3 dossiers assignés</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CalendarWidget = () => (
    <div className="space-y-3">
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Deadline GCF</p>
              <p className="text-sm text-gray-500">Dans 5 jours - 15 Jan 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-gray-900">Réunion client</p>
              <p className="text-sm text-gray-500">Demain - 14h00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveWidget = () => {
    switch (activeWidget) {
      case "overview":
        return <OverviewWidget />;
      case "analysis":
        return <AnalysisWidget />;
      case "missing-docs":
        return <MissingDocsWidget />;
      case "notifications":
        return <NotificationsWidget />;
      case "ready-projects":
        return <ReadyProjectsWidget />;
      case "consultants":
        return <ConsultantsWidget />;
      case "calendar":
        return <CalendarWidget />;
      default:
        return <OverviewWidget />;
    }
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
        <div className="flex h-screen">
          <div className="w-80 bg-white border-r border-gray-200 p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex h-screen">
        {/* Barre latérale */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Espace de travail</h1>
              <p className="text-sm text-gray-500">Tableau de bord consultante</p>
            </div>
            
            <div className="space-y-2">
              {widgets.map((widget) => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.id}
                    onClick={() => setActiveWidget(widget.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      activeWidget === widget.id
                        ? "bg-blue-50 border-blue-200 text-blue-900"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activeWidget === widget.id
                          ? "bg-blue-100"
                          : "bg-white"
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          activeWidget === widget.id
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{widget.title}</h3>
                        <p className="text-xs text-gray-500">{widget.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Zone centrale */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {widgets.find(w => w.id === activeWidget)?.title || "Aperçu des dossiers"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {widgets.find(w => w.id === activeWidget)?.description || "Vue d'ensemble des projets clients"}
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              {renderActiveWidget()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialog pour les documents */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="hidden" />
        </DialogTrigger>
        {selectedApplication && <DocumentModal application={selectedApplication} />}
      </Dialog>
    </div>
  );
}