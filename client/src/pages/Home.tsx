export default function Home() {
  return (
    <div className="md:ml-64 min-h-screen bg-background p-8 flex flex-col items-center">
      {/* Hero / Introduction */}
      <h1 className="text-4xl font-bold text-primary-dark mb-4 text-center">
        Welcome to Ask The Vets
      </h1>

      <p className="max-w-2xl text-center text-gray-700 mb-8">
        Ask The Vets is your go-to platform for pet health and care. Connect with qualified veterinarians, update your pets' medical records, chat live, and explore our forum and FAQs to stay informed and keep your pets happy and healthy.
      </p>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-4 gap-6 w-full max-w-6xl">
        <div className="bg-primary-light rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1598136495196-03d81bb499f7?auto=format&fit=crop&w=200&q=80"
            alt="Consult a vet"
            className="rounded mb-4"
          />
          <h2 className="font-semibold text-lg mb-2 text-primary-dark">Consult a Vet</h2>
          <p className="text-gray-700 text-center">
            Reach out to licensed veterinarians quickly and securely.
          </p>
        </div>

        <div className="bg-primary-light rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=200&q=80"
            alt="Medical info"
            className="rounded mb-4"
          />
          <h2 className="font-semibold text-lg mb-2 text-primary-dark">Update Medical Info</h2>
          <p className="text-gray-700 text-center">
            Keep your pet's health records up-to-date easily.
          </p>
        </div>

        <div className="bg-primary-light rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=200&q=80"
            alt="Live chat"
            className="rounded mb-4"
          />
          <h2 className="font-semibold text-lg mb-2 text-primary-dark">Live Chat</h2>
          <p className="text-gray-700 text-center">
            Chat in real-time with veterinarians for quick advice.
          </p>
        </div>

        <div className="bg-primary-light rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1601758123927-9c7b59a04929?auto=format&fit=crop&w=200&q=80"
            alt="Forum"
            className="rounded mb-4"
          />
          <h2 className="font-semibold text-lg mb-2 text-primary-dark">Forum & FAQs</h2>
          <p className="text-gray-700 text-center">
            Discuss with other pet owners and read answers to common questions.
          </p>
        </div>
      </div>

      {/* Optional Footer / Call to Action */}
      <p className="mt-12 max-w-2xl text-center text-gray-600">
        Explore the sidebar to navigate through features. Stay informed and keep your pets healthy with Ask The Vets!
      </p>
    </div>
  );
}
