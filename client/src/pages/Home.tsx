import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveChatContext } from "../context/LiveChatContext";

const rotatingWords = ["health", "comfort", "care", "support"];

const features = [
  {
    title: "Contact a Vet",
    description: "Reach out to licensed veterinarians quickly and securely.",
    route: "/contact-vet",
    action: "Consult Now",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Pet Medical Info",
    description: "Keep your pet's health records up-to-date easily.",
    route: "/update-medical",
    action: "Update Records",
    image:
      "https://images.unsplash.com/photo-1516734212186-65266f13073a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Live Chat",
    description: "Discuss with other pet owners and read answers to common questions.",
    route: "/",
    isChat: true,
    action: "Start Chat",
    image:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Forum & FAQs",
    description: "Find frequently asked questions and share your own experiences with the community.",
    route: "/forum/topics",
    action: "Explore Forum",
    image:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80",
  },
];

const faqFacts = [
  {
    question: "How often should my pet have a routine checkup?",
    answer: "Most pets benefit from a yearly exam, while seniors or pets with chronic conditions may need more frequent visits.",
  },
  {
    question: "What signs mean I should contact a vet immediately?",
    answer: "Difficulty breathing, repeated vomiting, collapse, seizure, or sudden severe pain are urgent signs that need fast assessment.",
  },
  {
    question: "Is it safe to use human medicine for pets?",
    answer: "Do not give human medications unless your vet explicitly prescribes them. Many are unsafe for pets.",
  },
  {
    question: "What should I prepare before an online vet consultation?",
    answer: "Have symptom notes, recent behavior changes, medication history, and clear photos or videos ready before the call.",
  },
];

export default function Home() {
  const { openChat } = useLiveChatContext();
  const [wordIndex, setWordIndex] = useState(0);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const activeFeature = features[activeFeatureIndex];

  const goToPreviousFeature = () => {
    setActiveFeatureIndex(prev => (prev - 1 + features.length) % features.length);
  };

  const goToNextFeature = () => {
    setActiveFeatureIndex(prev => (prev + 1) % features.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % features.length);
    }, 3200);

    return () => clearInterval(carouselInterval);
  }, []);

  return (
    <div className="md:ml-64 min-h-screen bg-background px-4 py-8 md:px-10 md:py-10 relative overflow-hidden">
      <div className="home-float absolute -top-20 left-[18%] w-40 h-40 rounded-full bg-primary-light/35 pointer-events-none" />
      <div className="home-float-delayed absolute top-[38%] right-0 w-52 h-52 rounded-full bg-accent/60 pointer-events-none" />
      <div className="home-float absolute -bottom-10 left-[45%] w-32 h-32 rounded-full bg-primary-light/30 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="home-fade-up text-center">
          <p className="text-sm md:text-base font-semibold tracking-wide text-primary-dark/80 mb-2">
            Trusted online support for pet owners
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-dark mb-3">
            Welcome to Ask The Vets
          </h1>
          <p className="text-xl md:text-2xl font-medium text-primary-dark/90 mb-5 min-h-[2rem]">
            Better pet{" "}
            <span key={rotatingWords[wordIndex]} className="home-word-swap inline-block font-semibold text-primary-dark">
              {rotatingWords[wordIndex]}
            </span>
            , every day.
          </p>
          <p className="mx-auto max-w-3xl text-primary-dark/80 leading-relaxed">
            Ask The Vets is your go-to platform for pet health and care. Connect with qualified
            veterinarians, update your pets medical records, chat live, and explore our forum and
            FAQs to stay informed and keep your pets happy and healthy.
          </p>
        </header>

        <section className="home-card-enter mt-8 md:mt-10">
          <div className="relative rounded-3xl border border-primary-dark/12 bg-accent/70 shadow-xl overflow-hidden">
            <article key={activeFeature.title} className="p-5 md:p-8 lg:p-10 grid md:grid-cols-[1.08fr_1fr] gap-6 md:gap-8 items-center">
              <div className="relative rounded-2xl border border-primary-dark/10 bg-background/55 min-h-[220px] md:min-h-[280px] overflow-hidden">
                <img
                  src={activeFeature.image}
                  alt={activeFeature.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary-dark/12" />
              </div>

              <div className="flex flex-col gap-3 md:gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-dark/75">Ask The Vets Feature</p>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-dark leading-tight">{activeFeature.title}</h2>
                <p className="text-base md:text-lg text-primary-dark/80 leading-relaxed">{activeFeature.description}</p>
                <div className="pt-1">
                  {activeFeature.isChat ? (
                    <button
                      type="button"
                      onClick={openChat}
                      className="inline-flex items-center rounded-lg bg-primary-dark px-5 py-2.5 text-white font-semibold hover:opacity-90"
                    >
                      {activeFeature.action}
                    </button>
                  ) : (
                    <Link
                      to={activeFeature.route}
                      className="inline-flex items-center rounded-lg bg-primary-dark px-5 py-2.5 text-white font-semibold hover:opacity-90"
                    >
                      {activeFeature.action}
                    </Link>
                  )}
                </div>
              </div>
            </article>

            <button
              type="button"
              aria-label="Previous feature"
              onClick={goToPreviousFeature}
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-primary-dark/20 bg-accent/90 text-primary-dark flex items-center justify-center hover:bg-accent"
            >
              &#8249;
            </button>
            <button
              type="button"
              aria-label="Next feature"
              onClick={goToNextFeature}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-primary-dark/20 bg-accent/90 text-primary-dark flex items-center justify-center hover:bg-accent"
            >
              &#8250;
            </button>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-primary-dark/15 bg-primary-light/50 px-3 py-2">
              {features.map((feature, index) => (
                <button
                  key={feature.title}
                  aria-label={`Go to ${feature.title}`}
                  onClick={() => setActiveFeatureIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeFeatureIndex === index ? "w-8 bg-primary-dark" : "w-2.5 bg-primary-dark/35"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 md:mt-14 max-w-5xl mx-auto">
          <div className="text-center mb-5">
            <p className="text-sm md:text-base font-semibold tracking-wide text-primary-dark/80">Forum & FAQs</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mt-1">Helpful FAQ Facts</h2>
          </div>

          <div className="space-y-3">
            {faqFacts.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <article key={faq.question} className="rounded-xl border border-primary-dark/10 bg-white/70 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    className="w-full text-left px-4 md:px-5 py-4 flex items-center justify-between gap-4"
                    onClick={() => setOpenFaqIndex(prev => (prev === index ? -1 : index))}
                    aria-expanded={isOpen}
                  >
                    <span className="text-base md:text-lg font-semibold text-primary-dark">{faq.question}</span>
                    <span className={`text-primary-dark text-xl leading-none transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`}>
                      &#8964;
                    </span>
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-4 md:px-5 pb-4 text-primary-dark/80 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-7 flex justify-center">
            <Link to="/forum/topics" className="px-6 py-3 rounded-lg bg-primary-dark text-white hover:opacity-90 font-semibold">
              To Forums
            </Link>
          </div>
        </section>

        <p className="home-fade-up mt-10 max-w-3xl mx-auto text-center text-primary-dark/75">
          Use the top navigation to move between features quickly. Ask The Vets helps you stay informed and
          provide better care to your pets.
        </p>
      </div>
    </div>
  );
}
