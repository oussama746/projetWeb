import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, Briefcase, Wifi } from 'lucide-react';
import * as api from '@/lib/api';

interface Offer {
  id: number;
  title: string;
  organisme: string;
  description: string;
  city: string;
  duration: string;
  domain: string;
  remote: boolean;
  date_depot: string;
  state: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await api.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (offerId: number) => {
    try {
      await api.removeFavorite(offerId);
      setFavorites(favorites.filter(f => f.id !== offerId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const viewOffer = (id: number) => {
    navigate(`/offres/${id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des favoris...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes Favoris</h1>
          <p className="text-muted-foreground">
            Retrouvez toutes les offres de stage que vous avez enregistrées
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun favori</h3>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore ajouté d'offres à vos favoris
              </p>
              <Button onClick={() => navigate('/offres')}>
                Découvrir les offres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((offer) => (
              <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{offer.title}</CardTitle>
                      <CardDescription className="font-semibold text-base">
                        {offer.organisme}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavorite(offer.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {offer.domain && (
                      <Badge variant="secondary">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {offer.domain}
                      </Badge>
                    )}
                    {offer.city && (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {offer.city}
                      </Badge>
                    )}
                    {offer.duration && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {offer.duration}
                      </Badge>
                    )}
                    {offer.remote && (
                      <Badge variant="outline">
                        <Wifi className="h-3 w-3 mr-1" />
                        Télétravail
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {offer.description}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => viewOffer(offer.id)}
                  >
                    Voir l'offre
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
