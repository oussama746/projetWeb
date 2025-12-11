import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Users, Briefcase, Filter } from "lucide-react";
import { api, StageOffer } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Internships = () => {
  const [offers, setOffers] = useState<StageOffer[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    duration: "",
    domain: "",
    remote: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.city) params.append('city', filters.city);
      if (filters.duration && filters.duration !== 'all') params.append('duration', filters.duration);
      if (filters.domain && filters.domain !== 'all') params.append('domain', filters.domain);
      if (filters.remote && filters.remote !== 'all') params.append('remote', filters.remote);
      
      const data = await api.getOffers(params.toString() ? `?${params.toString()}` : '');
      setOffers(data);
    } catch (error: any) {
      console.error("Failed to load offers:", error);
      if (error.message.includes("Authentication")) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour voir les offres",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOffers();
  };

  const handleApply = async (offerId: number) => {
    try {
      await api.applyToOffer(offerId);
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été enregistrée avec succès",
      });
      loadOffers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de candidater",
        variant: "destructive",
      });
    }
  };

  const getStateBadge = (state: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Validée": "default",
      "En attente validation": "secondary",
      "Clôturée": "outline",
      "Refusée": "destructive",
    };
    return <Badge variant={variants[state] || "default"}>{state}</Badge>;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Offres de Stage</h1>
          <p className="text-muted-foreground">
            {user ? `Bienvenue ${user.username}` : "Connectez-vous pour voir les offres"}
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher par titre, entreprise, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
            <Button type="submit">Rechercher</Button>
          </div>
          
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtres avancés</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ville</label>
                  <Input
                    placeholder="Ex: Paris"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Durée</label>
                  <Select
                    value={filters.duration}
                    onValueChange={(value) => setFilters({ ...filters, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="1-3 mois">1-3 mois</SelectItem>
                      <SelectItem value="3-6 mois">3-6 mois</SelectItem>
                      <SelectItem value="6+ mois">6+ mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Domaine</label>
                  <Select
                    value={filters.domain}
                    onValueChange={(value) => setFilters({ ...filters, domain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Télétravail</label>
                  <Select
                    value={filters.remote}
                    onValueChange={(value) => setFilters({ ...filters, remote: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="true">Oui</SelectItem>
                      <SelectItem value="false">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFilters({ city: "", duration: "", domain: "", remote: "" });
                    loadOffers();
                  }}
                >
                  Réinitialiser
                </Button>
                <Button
                  type="button"
                  onClick={loadOffers}
                >
                  Appliquer les filtres
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Aucune offre disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{offer.title}</CardTitle>
                    {getStateBadge(offer.state)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {offer.organisme}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {offer.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {offer.city && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {offer.city}
                      </Badge>
                    )}
                    {offer.duration && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {offer.duration}
                      </Badge>
                    )}
                    {offer.domain && (
                      <Badge variant="outline" className="text-xs">
                        {offer.domain}
                      </Badge>
                    )}
                    {offer.remote && (
                      <Badge variant="secondary" className="text-xs">
                        🏠 Remote
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(offer.date_depot), { addSuffix: true, locale: fr })}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {offer.candidature_count} candidature(s)
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {user?.role === "Etudiant" && offer.state === "Validée" && (
                    <Button
                      className="w-full"
                      onClick={() => handleApply(offer.id)}
                      disabled={offer.has_applied || offer.candidature_count >= 5}
                    >
                      {offer.has_applied ? "Déjà candidaté" : offer.candidature_count >= 5 ? "Complet" : "Candidater"}
                    </Button>
                  )}
                  {!user && (
                    <Button className="w-full" variant="outline" onClick={() => window.location.href = "/login"}>
                      Connectez-vous pour candidater
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Internships;
