export default function TermsOfService() {
  return (
    <div className="md:pt-16 min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto rounded-2xl border border-primary-dark/15 bg-white p-6 md:p-8 shadow">
        <h1 className="text-3xl font-bold text-primary-dark mb-4">Terms of Service</h1>
        <p className="text-charcoal-blue mb-4">
          Ask The Vets provides informational support and scheduling tools. It does not replace
          urgent emergency veterinary care.
        </p>
        <p className="text-charcoal-blue mb-4">
          By using this platform, you agree to provide accurate account and pet information and to
          use the service lawfully.
        </p>
        <p className="text-charcoal-blue">
          We may update these terms as features evolve. Continued use indicates acceptance.
        </p>
      </div>
    </div>
  );
}
