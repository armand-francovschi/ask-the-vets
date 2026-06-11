export default function ContactUs() {
  return (
    <div className="md:pt-16 min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto rounded-2xl border border-primary-dark/15 bg-white p-6 md:p-8 shadow">
        <h1 className="text-3xl font-bold text-primary-dark mb-4">Contact Us</h1>
        <p className="text-charcoal-blue mb-4">
          This is a placeholder contact page for testing footer navigation and static route wiring.
        </p>

        <div className="space-y-2 text-charcoal-blue">
          <p><strong>Email:</strong> support@askthevets.test</p>
          <p><strong>Phone:</strong> +40 000 000 000</p>
          <p><strong>Hours:</strong> Monday-Friday, 09:00-18:00</p>
          <p><strong>Address:</strong> 123 Pet Care Street, Bucharest</p>
        </div>
      </div>
    </div>
  );
}
