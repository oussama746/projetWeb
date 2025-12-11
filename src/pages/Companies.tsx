import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

const Companies = () => {
  const [formData, setFormData] = useState({
    organisme: "",
    contact_name: "",
    contact_email: "",
    title: "",
    description: "",
    city: "",
    duration: "",
    domain: "",
    remote: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createOffer(formData);
      toast({
        title: "Offre déposée",
        description: "Votre offre a été soumise et est en attente de validation",
      });
      setFormData({
        organisme: "",
        contact_name: "",
        contact_email: "",
        title: "",
        description: "",
        city: "",
        duration: "",
        domain: "",
        remote: false,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de déposer l'offre",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Déposer une Offre de Stage</h1>
            <p className="text-muted-foreground">
              Remplissez le formulaire ci-dessous pour publier votre offre
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations de l'offre</CardTitle>
              <CardDescription>
                Votre offre sera vérifiée avant d'être publiée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organisme">Nom de l'entreprise *</Label>
                  <Input
                    id="organisme"
                    required
                    value={formData.organisme}
                    onChange={(e) =>
                      setFormData({ ...formData, organisme: e.target.value })
                    }
                    placeholder="Ex: TechCorp"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Nom du contact *</Label>
                    <Input
                      id="contact_name"
                      required
                      value={formData.contact_name}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_name: e.target.value })
                      }
                      placeholder="Jean Dupont"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email du contact *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      required
                      value={formData.contact_email}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_email: e.target.value })
                      }
                      placeholder="contact@entreprise.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre du stage *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Stage Développeur Web Full Stack"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description du stage *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Décrivez les missions, compétences requises, environnement de travail..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="Ex: Paris, Lyon..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée du stage</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) =>
                        setFormData({ ...formData, duration: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une durée" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3 mois">1-3 mois</SelectItem>
                        <SelectItem value="3-6 mois">3-6 mois</SelectItem>
                        <SelectItem value="6+ mois">6+ mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={(value) =>
                      setFormData({ ...formData, domain: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Développement Web">Développement Web</SelectItem>
                      <SelectItem value="Développement Mobile">Développement Mobile</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Cybersécurité">Cybersécurité</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="IA/Machine Learning">IA/Machine Learning</SelectItem>
                      <SelectItem value="Réseau">Réseau</SelectItem>
                      <SelectItem value="Base de données">Base de données</SelectItem>
                      <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={formData.remote}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, remote: checked as boolean })
                    }
                  />
                  <Label htmlFor="remote" className="cursor-pointer">
                    Stage en télétravail possible
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Envoi..." : "Déposer l'offre"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Companies;
