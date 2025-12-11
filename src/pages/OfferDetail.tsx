import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, MapPin, Calendar, Clock, Building, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";

interface Offer {
  id: number;
  organisme: string;
  contact_name: string;
  contact_email: string;
  created_at: string;
  titre: string;
  details: string;
  status: string;
  ville?: string;
  type_stage?: string;
  duree?: string;
  domaine?: string;
  candidatures_count: number;
}

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffer();
  }, [id]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const data = await api.getOffer(Number(id));
      setOffer(data as any);
    } catch (error) {
      console.error("Failed to load offer:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'offre",
        variant: "destructive",
      });
      navigate("/offres");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      "en_attente": { variant: "secondary", label: "En attente" },
      "validee": { variant: "default", label: "Validée" },
      "refusee": { variant: "destructive", label: "Refusée" },
      "cloturee": { variant: "outline", label: "Clôturée" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!offer) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/offres")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux offres
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-3xl">{offer.titre}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-lg">
                  <Building className="h-5 w-5" />
                  {offer.organisme}
                </CardDescription>
              </div>
              {getStatusBadge(offer.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offer.ville && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Ville:</span>
                  <span>{offer.ville}</span>
                </div>
              )}
              
              {offer.duree && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Durée:</span>
                  <span>{offer.duree}</span>
                </div>
              )}
              
              {offer.type_stage && (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Type:</span>
                  <span>{offer.type_stage}</span>
                </div>
              )}
              
              {offer.domaine && (
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Domaine:</span>
                  <span>{offer.domaine}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Date de dépôt:</span>
                <span>{new Date(offer.created_at).toLocaleDateString("fr-FR")}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Candidatures:</span>
                <span>{offer.candidatures_count} / 5</span>
              </div>
            </div>

            {/* Contact */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Contact</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Nom:</span> {offer.contact_name}</p>
                <p><span className="font-medium">Email:</span> {offer.contact_email}</p>
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Description du stage</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{offer.details}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
