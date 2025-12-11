import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, Candidature } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Briefcase, Calendar, Building2, XCircle, User } from "lucide-react";

const StudentDashboard = () => {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "Etudiant") {
      toast({
        title: "Accès refusé",
        description: "Cette page est réservée aux étudiants",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    loadCandidatures();
  }, [user]);

  const loadCandidatures = async () => {
    try {
      setLoading(true);
      const data = await api.getCandidatures();
      setCandidatures(data);
    } catch (error) {
      console.error("Failed to load candidatures:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos candidatures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cette candidature ?")) return;
    
    try {
      await api.withdrawCandidature(id);
      toast({
        title: "Candidature retirée",
        description: "Votre candidature a été retirée avec succès",
      });
      loadCandidatures();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de retirer la candidature",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "En attente": "secondary",
      "Acceptée": "default",
      "Refusée": "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mes Candidatures</h1>
            <p className="text-muted-foreground">
              Suivez l'état de vos candidatures
            </p>
          </div>
          <Button onClick={() => navigate("/etudiant/profil")} variant="outline" className="gap-2">
            <User className="w-4 h-4" />
            Mon Profil
          </Button>
        </div>

        {candidatures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-4">Aucune candidature</p>
              <Button onClick={() => navigate("/offres")}>
                Voir les offres disponibles
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidatures.map((candidature) => (
              <Card key={candidature.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {candidature.offer.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {candidature.offer.organisme}
                      </CardDescription>
                    </div>
                    {getStatusBadge(candidature.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Candidaté{" "}
                      {formatDistanceToNow(new Date(candidature.date_candidature), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                    <p className="text-muted-foreground mt-4">
                      {candidature.offer.description}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {candidature.status === "En attente" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleWithdraw(candidature.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Retirer ma candidature
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
