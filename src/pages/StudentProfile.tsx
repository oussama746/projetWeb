import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, FileText, Phone, Mail, Upload } from "lucide-react";

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    bio: "",
    phone: "",
    cv: null as File | null,
  });
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile({
          bio: data.bio || "",
          phone: data.phone || "",
          cv: null,
        });
        if (data.cv) {
          setCvUrl(data.cv);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "Le fichier ne doit pas dépasser 5 Mo",
          variant: "destructive",
        });
        return;
      }
      setProfile({ ...profile, cv: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("bio", profile.bio);
      formData.append("phone", profile.phone);
      if (profile.cv) {
        formData.append("cv", profile.cv);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été enregistrées avec succès",
        });
        loadProfile();
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Mon Profil</h1>
            <p className="text-muted-foreground">
              Complétez vos informations pour les entreprises
            </p>
          </div>

          <div className="grid gap-6">
            {/* Info utilisateur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Ces informations sont issues de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom d'utilisateur</Label>
                    <div className="mt-1 px-3 py-2 bg-secondary rounded-md">
                      {user?.username}
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="mt-1 px-3 py-2 bg-secondary rounded-md flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom</Label>
                    <div className="mt-1 px-3 py-2 bg-secondary rounded-md">
                      {user?.first_name || "Non renseigné"}
                    </div>
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <div className="mt-1 px-3 py-2 bg-secondary rounded-md">
                      {user?.last_name || "Non renseigné"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulaire profil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Profil étudiant
                </CardTitle>
                <CardDescription>
                  Informations visibles par les entreprises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie / Présentation</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      placeholder="Parlez de vous, vos compétences, vos aspirations..."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      CV (PDF, max 5 Mo)
                    </Label>
                    <Input
                      id="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    {cvUrl && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <a
                          href={cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Voir le CV actuel
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/etudiant")}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentProfile;
