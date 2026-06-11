export default function CookiePolicy() {
  return (
    <div className="md:pt-16 min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto rounded-2xl border border-primary-dark/15 bg-white p-6 md:p-8 shadow">
        <h1 className="text-3xl font-bold text-primary-dark mb-4">Cookie Policy</h1>
        <p className="text-charcoal-blue mb-4">
          We use essential cookies and local storage for authentication, session continuity,
          and core app functionality.
        </p>
        <p className="text-charcoal-blue mb-4">
          Analytics and optional cookies may be introduced in future updates and will be
          documented here.
        </p>
        <p className="text-charcoal-blue">
          You can clear browser storage at any time, but this may sign you out of the platform.
        </p>
      </div>
    </div>
  );
}
