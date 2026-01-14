const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]" dir="ltr">
      <div className="max-w-lg w-full mx-4 text-center bg-white rounded-[2rem] shadow-2xl shadow-brand-teal/10 border border-gray-100 px-10 py-12">
        <div className="mb-8">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center">
            <span className="text-3xl font-black text-brand-teal">GF</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
            Gaz Flow
          </h1>
          <p className="text-lg font-semibold text-gray-500">
            Système de gestion et de distribution du gaz
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-gray-600 text-base">
            Cette page est une page d'accueil technique. 
          </p>
          <p className="text-gray-600 text-base">
            Pour utiliser l'application, accédez à la page de connexion principale.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
