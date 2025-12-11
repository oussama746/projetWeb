import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, Candidature } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Mail, Phone, FileText, Calendar, Download, CheckCircle, XCircle } from "lucide-react";

interface CandidaturesListProps {
  offerId: number;
  onStatusChange?: () => void;
}

const CandidaturesList = ({ offerId, onStatusChange }: CandidaturesListProps) => {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCandidatures();
  }, [offerId]);

  const loadCandidatures = async () => {
    try {
      setLoading(true);
      const data = await api.getOfferCandidates(offerId);
      setCandidatures(data);
    } catch (error) {
      console.error("Failed to load candidatures:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidatures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (candidatureId: number, newStatus: 'Acceptée' | 'Refusée') => {
    try {
      await api.updateCandidatureStatus(candidatureId, newStatus);
      toast({
        title: "Statut mis à jour",
        description: `Candidature ${newStatus.toLowerCase()}`,
      });
      loadCandidatures();
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const viewDetails = (candidature: Candidature) => {
    setSelectedCandidature(candidature);
    setShowDetailDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Acceptée':
        return <Badge className="bg-green-500">Acceptée</Badge>;
      case 'Refusée':
        return <Badge variant="destructive">Refusée</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const getInitials = (user: any) => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-4">Chargement...</p>;
  }

  if (candidatures.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <User className="w-12 h-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Aucune candidature pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {candidatures.map((candidature) => (
          <Card key={candidature.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(candidature.student)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {candidature.student.first_name} {candidature.student.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {candidature.student.email}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(candidature.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Candidaté {formatDistanceToNow(new Date(candidature.date_candidature), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>

                {candidature.student_profile?.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{candidature.student_profile.phone}</span>
                  </div>
                )}

                {candidature.student_profile?.bio && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {candidature.student_profile.bio}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    onClick={() => viewDetails(candidature)} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    Voir le profil
                  </Button>
                  
                  {candidature.status === 'En attente' && (
                    <>
                      <Button 
                        onClick={() => updateStatus(candidature.id, 'Acceptée')} 
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accepter
                      </Button>
                      <Button 
                        onClick={() => updateStatus(candidature.id, 'Refusée')} 
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Profil de {selectedCandidature?.student.first_name} {selectedCandidature?.student.last_name}
            </DialogTitle>
            <DialogDescription>Informations détaillées du candidat</DialogDescription>
          </DialogHeader>
          {selectedCandidature && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-xl">
                    {getInitials(selectedCandidature.student)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedCandidature.student.first_name} {selectedCandidature.student.last_name}
                  </h3>
                  <p className="text-muted-foreground">{selectedCandidature.student.email}</p>
                </div>
              </div>

              {selectedCandidature.student_profile?.phone && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </h4>
                  <p className="text-muted-foreground">{selectedCandidature.student_profile.phone}</p>
                </div>
              )}

              {selectedCandidature.student_profile?.bio && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Présentation
                  </h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedCandidature.student_profile.bio}
                  </p>
                </div>
              )}

              {selectedCandidature.student_profile?.cv && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    CV
                  </h4>
                  <Button 
                    onClick={() => window.open(selectedCandidature.student_profile?.cv!, '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le CV
                  </Button>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de candidature
                </h4>
                <p className="text-muted-foreground">
                  {new Date(selectedCandidature.date_candidature).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Statut de la candidature</h4>
                {getStatusBadge(selectedCandidature.status)}
              </div>

              {selectedCandidature.status === 'En attente' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      updateStatus(selectedCandidature.id, 'Acceptée');
                      setShowDetailDialog(false);
                    }} 
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accepter la candidature
                  </Button>
                  <Button 
                    onClick={() => {
                      updateStatus(selectedCandidature.id, 'Refusée');
                      setShowDetailDialog(false);
                    }} 
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Refuser la candidature
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CandidaturesList;
