import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CandidaturesList from "@/components/CandidaturesList";
import { api, StageOffer } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Building2, Calendar, Mail, User, FileText, Clock, Users, Download } from "lucide-react";

const ManagerDashboard = () => {
  const [offers, setOffers] = useState<StageOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<StageOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<StageOffer | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Seuls les responsables d'entreprise peuvent accéder
    if (user.role !== "Responsable") {
      toast({
        title: "Accès refusé",
        description: "Cette page est réservée aux responsables d'entreprise",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    loadOffers();
  }, [user]);

  useEffect(() => {
    filterOffers();
  }, [searchQuery, offers]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await api.getOffers();
      
      // Filtrer UNIQUEMENT les offres où l'email du contact correspond à l'email du user
      const myOffers = data.filter(
        (offer) => offer.contact_email.toLowerCase() === user?.email.toLowerCase()
      );
      
      setOffers(myOffers);
      setFilteredOffers(myOffers);
    } catch (error) {
      console.error("Failed to load offers:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    if (!searchQuery.trim()) {
      setFilteredOffers(offers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = offers.filter(
      (offer) =>
        offer.title.toLowerCase().includes(query) ||
        offer.organisme.toLowerCase().includes(query) ||
        offer.details.toLowerCase().includes(query)
    );
    setFilteredOffers(filtered);
  };

  const getOffersByState = (state: string) => {
    return filteredOffers.filter((offer) => offer.state === state);
  };

  const viewDetails = (offer: StageOffer) => {
    setSelectedOffer(offer);
    setShowDetailDialog(true);
  };

  const handleExportOfferPDF = async (offerId: number, organisme: string) => {
    try {
      const blob = await api.exportOfferPDF(offerId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offre_${offerId}_${organisme.replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export réussi",
        description: "Le PDF a été téléchargé",
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export du PDF",
        variant: "destructive",
      });
    }
  };

  const OfferCard = ({ offer }: { offer: StageOffer }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{offer.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4" />
              {offer.organisme}
            </CardDescription>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              offer.state === "Validée"
                ? "bg-green-100 text-green-800"
                : offer.state === "En attente validation"
                ? "bg-yellow-100 text-yellow-800"
                : offer.state === "Clôturée"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {offer.state}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Contact: {offer.contact_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{offer.contact_email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Déposée {formatDistanceToNow(new Date(offer.date_posted), { addSuffix: true, locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{offer.candidature_count} candidature(s)</span>
          </div>

          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">{offer.details}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => viewDetails(offer)} variant="outline" className="flex-1">
              Voir détails
            </Button>
            <Button
              onClick={() => handleExportOfferPDF(offer.id, offer.organisme)}
              variant="default"
              size="icon"
              title="Exporter en PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const pendingOffers = getOffersByState("En attente validation");
  const validatedOffers = getOffersByState("Validée");
  const refusedOffers = getOffersByState("Refusée");
  const closedOffers = getOffersByState("Clôturée");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mes Offres de Stage</h1>
          <p className="text-muted-foreground">
            Gérez les offres de stage de votre entreprise
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par titre ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl">{pendingOffers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Validées</CardDescription>
              <CardTitle className="text-3xl">{validatedOffers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Refusées</CardDescription>
              <CardTitle className="text-3xl">{refusedOffers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Clôturées</CardDescription>
              <CardTitle className="text-3xl">{closedOffers.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Message si aucune offre */}
        {offers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Aucune offre trouvée</p>
              <p className="text-sm text-muted-foreground mb-4">
                Vous n'avez pas encore d'offres liées à votre email ({user?.email})
              </p>
              <Button onClick={() => navigate("/entreprises")}>
                Déposer une offre
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        {offers.length > 0 && (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                Toutes ({filteredOffers.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                En attente ({pendingOffers.length})
              </TabsTrigger>
              <TabsTrigger value="validated">
                Validées ({validatedOffers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingOffers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground">Aucune offre en attente</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="validated" className="space-y-4">
              {validatedOffers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground">Aucune offre validée</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validatedOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedOffer?.title}</DialogTitle>
              <DialogDescription>Détails de l'offre de stage</DialogDescription>
            </DialogHeader>
            {selectedOffer && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Organisme</h3>
                  <p className="text-muted-foreground">{selectedOffer.organisme}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p className="text-muted-foreground">
                    {selectedOffer.contact_name} - {selectedOffer.contact_email}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">État</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedOffer.state === "Validée"
                        ? "bg-green-100 text-green-800"
                        : selectedOffer.state === "En attente validation"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedOffer.state === "Clôturée"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedOffer.state}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Candidatures</h3>
                  <p className="text-muted-foreground">{selectedOffer.candidature_count} candidature(s)</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Date de dépôt</h3>
                  <p className="text-muted-foreground">
                    {new Date(selectedOffer.date_posted).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description du stage</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedOffer.details}</p>
                </div>

                {/* Candidatures */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Candidatures ({selectedOffer.candidature_count})
                  </h3>
                  <CandidaturesList 
                    offerId={selectedOffer.id} 
                    onStatusChange={loadOffers}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
