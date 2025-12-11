import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getStats, getOffers, validateOffer, refuseOffer, type StageOffer, type DashboardStats } from '../lib/api';
import { api } from '../lib/api';
import Layout from '../components/layout/Layout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { CheckCircle, XCircle, Clock, TrendingUp, Users, Briefcase, FileText, Search, Download } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingOffers, setPendingOffers] = useState<StageOffer[]>([]);
  const [allOffers, setAllOffers] = useState<StageOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<StageOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<StageOffer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, offersData] = await Promise.all([
        getStats(),
        getOffers()
      ]);
      setStats(statsData);
      
      const pending = offersData.filter((offer: StageOffer) => offer.state === 'En attente validation');
      setPendingOffers(pending);
      setAllOffers(offersData);
      setFilteredOffers(offersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredOffers(allOffers);
    } else {
      const filtered = allOffers.filter(offer => 
        offer.title.toLowerCase().includes(query.toLowerCase()) ||
        offer.company.toLowerCase().includes(query.toLowerCase()) ||
        offer.description.toLowerCase().includes(query.toLowerCase()) ||
        offer.contact_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOffers(filtered);
    }
  };

  const handleValidate = async (offerId: number) => {
    try {
      await validateOffer(offerId);
      await loadData();
      setSelectedOffer(null);
    } catch (error) {
      console.error('Failed to validate offer:', error);
    }
  };

  const handleRefuse = async (offerId: number) => {
    try {
      await refuseOffer(offerId);
      await loadData();
      setSelectedOffer(null);
    } catch (error) {
      console.error('Failed to refuse offer:', error);
    }
  };

  const handleExportAllPDF = async () => {
    try {
      const blob = await api.exportAllCandidaturesPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidatures_rapport_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Erreur lors de l\'export du PDF');
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement des statistiques...</div>
      </div>
    );
  }

  const candidaturesLineData = {
    labels: stats.candidatures_by_month.map(d => d.month),
    datasets: [
      {
        label: 'Candidatures',
        data: stats.candidatures_by_month.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const offersLineData = {
    labels: stats.offers_by_month.map(d => d.month),
    datasets: [
      {
        label: 'Offres reçues',
        data: stats.offers_by_month.map(d => d.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const topOffersData = {
    labels: stats.top_offers.map(d => d.title.length > 30 ? d.title.substring(0, 30) + '...' : d.title),
    datasets: [
      {
        label: 'Nombre de candidatures',
        data: stats.top_offers.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const offersStateData = {
    labels: ['En attente', 'Validées', 'Clôturées', 'Refusées'],
    datasets: [
      {
        data: [
          stats.pending_offers,
          stats.validated_offers,
          stats.closed_offers,
          stats.refused_offers,
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const candidaturesStatusData = {
    labels: ['En attente', 'Acceptées', 'Refusées'],
    datasets: [
      {
        data: [
          stats.pending_candidatures,
          stats.accepted_candidatures,
          stats.refused_candidatures,
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
              <p className="text-gray-600 mt-2">Bienvenue, {user?.username}</p>
            </div>
            <button
              onClick={handleExportAllPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Exporter toutes les candidatures (PDF)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Offres</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_offers}</p>
                </div>
                <Briefcase className="h-12 w-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Offres en attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending_offers}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Candidatures</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_candidatures}</p>
                </div>
                <Users className="h-12 w-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Offres Validées</p>
                  <p className="text-3xl font-bold text-green-600">{stats.validated_offers}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Candidatures sur 12 mois</h2>
              <div className="h-80">
                <Line data={candidaturesLineData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Offres reçues sur 12 mois</h2>
              <div className="h-80">
                <Line data={offersLineData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Répartition des offres par état</h2>
              <div className="h-80">
                <Doughnut data={offersStateData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Répartition des candidatures</h2>
              <div className="h-80">
                <Pie data={candidaturesStatusData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Top 5 des offres les plus populaires</h2>
              <div className="h-80">
                <Bar data={topOffersData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Offres en attente de validation ({pendingOffers.length})</h2>
            </div>
            <div className="p-6">
              {pendingOffers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune offre en attente de validation</p>
              ) : (
                <div className="space-y-4">
                  {pendingOffers.map((offer) => (
                    <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {offer.organisme} • {offer.contact_name} ({offer.contact_email})
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Déposée le {new Date(offer.date_depot).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => setSelectedOffer(offer)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            Voir détails
                          </button>
                          <button
                            onClick={() => handleValidate(offer.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Valider
                          </button>
                          <button
                            onClick={() => handleRefuse(offer.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Refuser
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedOffer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">{selectedOffer.title}</h2>
                    <button
                      onClick={() => setSelectedOffer(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Organisme</h3>
                      <p className="text-gray-900">{selectedOffer.organisme}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700">Contact</h3>
                      <p className="text-gray-900">{selectedOffer.contact_name}</p>
                      <p className="text-gray-600">{selectedOffer.contact_email}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700">Date de dépôt</h3>
                      <p className="text-gray-900">
                        {new Date(selectedOffer.date_depot).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700">Détail du stage</h3>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedOffer.detail}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => handleValidate(selectedOffer.id)}
                      className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider l'offre
                    </button>
                    <button
                      onClick={() => handleRefuse(selectedOffer.id)}
                      className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser l'offre
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Liste de toutes les offres */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-500" />
              Toutes les offres de stage
            </h2>
            
            {/* Barre de recherche */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher par titre, entreprise, description ou contact..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-600">
                  {filteredOffers.length} résultat(s) trouvé(s)
                </p>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organisme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      État
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de dépôt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOffers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {searchQuery ? 'Aucune offre ne correspond à votre recherche' : 'Aucune offre disponible'}
                      </td>
                    </tr>
                  ) : (
                    filteredOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{offer.company_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{offer.contact_name}</div>
                        <div className="text-sm text-gray-500">{offer.contact_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          offer.state === 'Validée' ? 'bg-green-100 text-green-800' :
                          offer.state === 'En attente validation' ? 'bg-yellow-100 text-yellow-800' :
                          offer.state === 'Refusée' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOffer(offer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
