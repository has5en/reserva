
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/ui/calendar';

const Index = () => {
  const {
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/e07bb06a-cd83-4b82-83c6-f09e7cd9588c.png" 
              alt="Logo Militaire" 
              className="h-8 w-auto mr-2"
            />
            <h1 className="text-2xl font-bold">Reserva</h1>
            <img 
              src="/lovable-uploads/6a16ef00-89af-4197-a128-918fd7f4bc64.png" 
              alt="Drapeau Tunisien" 
              className="h-8 w-auto ml-2"
            />
          </div>
          <Button variant="outline" onClick={() => navigate('/login')} className="border-white hover:bg-white text-slate-950">
            Connexion
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/e07bb06a-cd83-4b82-83c6-f09e7cd9588c.png" 
              alt="Logo Militaire" 
              className="h-32 w-auto"
            />
          </div>
          
          <h2 className="text-4xl font-bold mb-6">Plateforme de Réservation Intelligente</h2>
          <p className="text-xl mb-8">
            Simplifiez la gestion des ressources pédagogiques avec notre solution centralisée.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Réservation de Salles</h3>
              <p className="text-gray-600">
                Réservez des salles et laboratoires en quelques clics, avec visualisation de la disponibilité en temps réel.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Demande de Matériel</h3>
              <p className="text-gray-600">
                Demandez du matériel pédagogique pour vos cours et suivez l'état de votre demande en temps réel.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Demande d'Impression</h3>
              <p className="text-gray-600">
                Soumettez vos demandes d'impression et suivez leur traitement de manière entièrement numérique et transparente.
              </p>
            </div>
          </div>

          <Button size="lg" className="bg-primary text-white" onClick={() => navigate('/login')}>
            Commencer maintenant
          </Button>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-6">
        <div className="container mx-auto text-center">
          <p>© 2025 Salle Smart Reserva. Tous droits réservés.</p>
        </div>
      </footer>
    </div>;
};

export default Index;
