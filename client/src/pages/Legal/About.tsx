export default function About() {
  return (
    <div className="md:pt-16 min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto rounded-2xl border border-primary-dark/15 bg-white p-6 md:p-8 shadow">
        <h1 className="text-3xl font-bold text-primary-dark mb-4">About Ask The Vets</h1>
        <p className="text-charcoal-blue mb-4">
          Ask The Vets is a veterinary support platform designed to help pet owners connect with
          professionals, manage appointments, and keep medical records organized.
        </p>
        <p className="text-charcoal-blue mb-4">
          This demo page is intentionally simple for testing and can be replaced later with your
          full company story, team details, and mission statement.
        </p>
        <p className="text-charcoal-blue">
          We are committed to making pet care guidance easier to access and easier to trust.
        </p>
      </div>
    </div>
  );
}
