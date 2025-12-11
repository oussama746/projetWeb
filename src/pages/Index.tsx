import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Building2, GraduationCap, Shield, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative gradient-hero min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-up leading-tight">
              Trouvez le stage{" "}
              <span className="text-gradient bg-gradient-to-r from-primary to-accent">
                idéal
              </span>{" "}
              pour lancer votre carrière
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Plateforme de gestion des offres de stages pour l'IUT d'Orsay. 
              Connectez entreprises, étudiants et responsables en un seul endroit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate(user ? "/offres" : "/register")}
                className="gap-2"
              >
                <Briefcase className="w-5 h-5" />
                {user ? "Voir les offres" : "Commencer"}
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/entreprises")}
                className="bg-background/10 backdrop-blur-sm border-primary-foreground/20 hover:bg-background/20"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Déposer une offre
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Une plateforme pour tous
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stage Connect simplifie la gestion des stages en offrant des outils adaptés à chaque profil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Entreprises</CardTitle>
                <CardDescription>
                  Déposez vos offres et gérez vos candidatures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate("/entreprises")}>
                  Déposer une offre
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle>Étudiants</CardTitle>
                <CardDescription>
                  Consultez les offres et candidatez en un clic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate(user ? "/etudiant" : "/login")}>
                  {user?.role === "Etudiant" ? "Mon espace" : "Se connecter"}
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle>Responsables</CardTitle>
                <CardDescription>
                  Validez et gérez les offres de stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate(user ? "/offres" : "/login")}>
                  {user?.role === "Responsable" ? "Valider offres" : "Se connecter"}
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle>Administrateurs</CardTitle>
                <CardDescription>
                  Tableau de bord et statistiques complètes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate(user?.role === "Administrateur" ? "/admin" : "/login")}>
                  {user?.role === "Administrateur" ? "Dashboard" : "Se connecter"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {user && (
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Bienvenue, {user.username}
              </h2>
              <p className="text-muted-foreground mb-8">
                Rôle : {user.role || "Utilisateur"}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/offres")}>
                  Voir les offres
                </Button>
                {user.role === "Etudiant" && (
                  <Button variant="outline" onClick={() => navigate("/etudiant")}>
                    Mes candidatures
                  </Button>
                )}
                {user.role === "Administrateur" && (
                  <Button variant="outline" onClick={() => navigate("/admin")}>
                    Tableau de bord
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
