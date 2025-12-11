import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, StageOffer, Candidature } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Briefcase, Calendar, Mail, User, Phone, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

const CompanyDashboard = () => {
  const [myOffers, setMyOffers] = useState<StageOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<StageOffer | null>(null);
  const [candidates, setCandidates] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCandidatesDialog, setShowCandidatesDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "Entreprise") {
      toast({
        title: "Accès refusé",
        description: "Cette page est réservée aux entreprises",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    loadMyOffers();
  }, [user]);

  const loadMyOffers = async () => {
    try {
      setLoading(true);
      // Récupérer toutes les offres
      const allOffers = await api.getOffers();
      
      // Filtrer par l'email du user connecté
      const myEmail = user?.email?.toLowerCase();
      const filtered = allOffers.filter(
        (offer) => offer.contact_email.toLowerCase() === myEmail
      );
      
      setMyOffers(filtered);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos offres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (offer: StageOffer) => {
    try {
      const data = await api.getOfferCandidates(offer.id);
      setCandidates(data);
      setSelectedOffer(offer);
      setShowCandidatesDialog(true);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidatures",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCandidatureStatus = async (
    candidatureId: number,
    status: "Acceptée" | "Refusée"
  ) => {
    try {
      await api.updateCandidatureStatus(candidatureId, status);
      toast({
        title: "Statut mis à jour",
        description: `Candidature ${status === "Acceptée" ? "acceptée" : "refusée"}`,
      });
      // Recharger les candidatures
      if (selectedOffer) {
        loadCandidates(selectedOffer);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "En attente validation":
        return "warning";
      case "Validée":
        return "success";
      case "Refusée":
        return "destructive";
      case "Clôturée":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En attente":
        return "warning";
      case "Acceptée":
        return "success";
      case "Refusée":
        return "destructive";
      default:
        return "default";
    }
  };

  const OfferCard = ({ offer }: { offer: StageOffer }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{offer.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Déposée {formatDistanceToNow(new Date(offer.date_depot), { locale: fr, addSuffix: true })}
            </CardDescription>
          </div>
          <Badge variant={getStateColor(offer.state)}>{offer.state}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {offer.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              {offer.candidature_count} candidature{offer.candidature_count > 1 ? "s" : ""}
            </div>
            {offer.candidature_count > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadCandidates(offer)}
              >
                Voir les candidats
              </Button>
            )}
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

  const pendingOffers = myOffers.filter((o) => o.state === "En attente validation");
  const activeOffers = myOffers.filter((o) => o.state === "Validée");
  const closedOffers = myOffers.filter((o) => o.state === "Clôturée");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mes Offres de Stage</h1>
          <p className="text-muted-foreground">
            Gérez vos offres et consultez les candidatures
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Email de gestion : {user?.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total offres</CardDescription>
              <CardTitle className="text-3xl">{myOffers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl">{pendingOffers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Actives</CardDescription>
              <CardTitle className="text-3xl">{activeOffers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Clôturées</CardDescription>
              <CardTitle className="text-3xl">{closedOffers.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {myOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-4">
                Aucune offre trouvée pour votre email
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Les offres déposées avec l'email <strong>{user?.email}</strong> apparaîtront ici
              </p>
              <Button onClick={() => navigate("/entreprises")}>
                Déposer une offre
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                Toutes ({myOffers.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                En attente ({pendingOffers.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Actives ({activeOffers.length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Clôturées ({closedOffers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myOffers.map((offer) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {activeOffers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground">Aucune offre active</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              {closedOffers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <XCircle className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground">Aucune offre clôturée</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {closedOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Candidates Dialog */}
        <Dialog open={showCandidatesDialog} onOpenChange={setShowCandidatesDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Candidatures pour : {selectedOffer?.title}</DialogTitle>
              <DialogDescription>
                {candidates.length} candidature{candidates.length > 1 ? "s" : ""} reçue{candidates.length > 1 ? "s" : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {candidates.map((candidature) => (
                <Card key={candidature.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="w-5 h-5" />
                          {candidature.student_username}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4" />
                          {candidature.student_email}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(candidature.status)}>
                        {candidature.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Candidature déposée {formatDistanceToNow(new Date(candidature.date_candidature), { locale: fr, addSuffix: true })}
                      </div>
                      
                      {candidature.student_profile && (
                        <div className="space-y-2 pt-2 border-t">
                          {candidature.student_profile.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4" />
                              {candidature.student_profile.phone}
                            </div>
                          )}
                          {candidature.student_profile.bio && (
                            <div className="text-sm">
                              <strong>Présentation :</strong>
                              <p className="mt-1 text-muted-foreground">{candidature.student_profile.bio}</p>
                            </div>
                          )}
                          {candidature.student_profile.cv && (
                            <div>
                              <a
                                href={candidature.student_profile.cv}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Télécharger le CV
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {candidature.status === "En attente" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCandidatureStatus(candidature.id, "Acceptée")}
                            className="flex-1 gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateCandidatureStatus(candidature.id, "Refusée")}
                            className="flex-1 gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Refuser
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;
