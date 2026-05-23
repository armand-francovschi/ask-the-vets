import { Link } from "react-router-dom";

const forumFaqs = [
  {
    question: "How fast do vets usually respond online?",
    answer: "Most responses arrive within a few minutes, depending on demand.",
  },
  {
    question: "Can I ask follow-up questions after a consultation?",
    answer: "Yes, follow-up questions are supported within your active consultation.",
  },
  {
    question: "Should I use online consultation for emergencies?",
    answer: "No. For emergencies, contact a local emergency clinic immediately.",
  },
  {
    question: "Can I upload photos or records before chatting?",
    answer: "Yes, uploading relevant notes and images helps vets assess faster.",
  },
  {
    question: "Do I need an account to join the forums?",
    answer: "You can browse content freely; posting and booking require login.",
  },
  {
    question: "Are forum posts reviewed by professionals?",
    answer: "Some articles are vet-authored; community posts should not replace diagnosis.",
  },
];

export default function Forum() {
  return (
    <div className="md:ml-64 min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Forum & FAQs</h1>
        <p className="text-gray-700 mb-8">Browse short FAQs from veterinarians and the Ask The Vets team.</p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-primary-dark mb-3">Frequently Asked Questions</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {forumFaqs.map(faq => (
              <div key={faq.question} className="bg-primary-light rounded-xl border p-4">
                <h3 className="text-lg font-semibold text-primary-dark">{faq.question}</h3>
                <p className="text-gray-700 mt-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-primary-light rounded-xl border p-5 md:p-6 text-center">
          <p className="text-gray-700">For more info, and topics, check out the forum.</p>
          <Link
            to="/forum/topics"
            className="inline-flex mt-4 px-5 py-2 rounded-lg bg-primary-dark text-white hover:opacity-90 font-semibold"
          >
            To Forums
          </Link>
        </div>
      </div>
    </div>
  );
}
