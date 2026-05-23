export interface ForumArticle {
  slug: string;
  title: string;
  author: string;
  publishedAt: string;
  summary: string;
  content: string[];
}

export const forumArticles: ForumArticle[] = [
  {
    slug: "understanding-your-pets-annual-checkup",
    title: "Understanding Your Pet’s Annual Checkup",
    author: "Dr. Amelia Hayes",
    publishedAt: "2026-03-12",
    summary:
      "A practical guide to what veterinarians assess during yearly visits and how to prepare your pet for a stress-free exam.",
    content: [
      "Annual checkups are preventive, not just reactive. A routine visit helps detect issues early and builds a baseline for your pet’s long-term health.",
      "During a standard exam, vets evaluate weight trends, skin and coat quality, oral health, heart and lung sounds, and joint mobility. These observations often reveal subtle changes owners may miss at home.",
      "Bring a short timeline of appetite changes, activity level, bathroom habits, and any new behaviors. Clear notes help your vet make faster and more accurate decisions.",
      "If your pet gets anxious at the clinic, ask for low-stress handling strategies or scheduling tips. Early preparation can significantly improve visit quality for both pets and owners."
    ]
  },
  {
    slug: "safe-home-remedies-vs-when-to-call-the-vet",
    title: "Safe Home Remedies vs. When to Call the Vet",
    author: "Dr. Noah Bennett",
    publishedAt: "2026-02-26",
    summary:
      "How to separate minor issues you can monitor at home from symptoms that require immediate veterinary care.",
    content: [
      "Mild digestive upset can sometimes be observed for a short period if your pet remains hydrated, alert, and comfortable. Persistent vomiting, bloody stool, or lethargy should never be delayed.",
      "Do not administer human pain medications unless specifically prescribed by a veterinarian. Many over-the-counter drugs are toxic to dogs and cats even in small amounts.",
      "Small skin irritations may be manageable with vet-approved cleansing routines, but swelling, heat, discharge, or rapid spread can indicate infection and needs timely evaluation.",
      "When in doubt, contact a professional. Tele-consult guidance can help you decide whether home monitoring is appropriate or if a same-day visit is safer."
    ]
  },
  {
    slug: "nutrition-basics-for-dogs-and-cats",
    title: "Nutrition Basics for Dogs and Cats",
    author: "Dr. Elena Ward",
    publishedAt: "2026-01-30",
    summary:
      "Core feeding principles, portion awareness, and common mistakes that affect your pet’s weight and energy.",
    content: [
      "Balanced nutrition depends on species, age, activity level, and medical history. Puppies and kittens have different caloric and nutrient demands compared with senior pets.",
      "Treats should generally stay within 10% of daily calorie intake. Overfeeding, even with healthy snacks, can contribute to long-term weight gain and joint stress.",
      "Use measured portions rather than free-pouring food. Consistent measuring makes weight management and diet adjustments much easier.",
      "If your pet has recurring digestive issues, coat changes, or fluctuating weight, discuss a diet review with your vet to identify whether formula changes or diagnostic tests are needed."
    ]
  },
  {
    slug: "post-vaccination-care-what-to-expect",
    title: "Post-Vaccination Care: What to Expect",
    author: "Dr. Liam Foster",
    publishedAt: "2025-12-19",
    summary:
      "Common normal reactions after vaccines and warning signs that should prompt a prompt clinical follow-up.",
    content: [
      "Mild tiredness or temporary tenderness at the injection site can be normal within the first 24 hours. Most pets recover quickly with rest and hydration.",
      "Monitor appetite, breathing, and facial appearance. Vomiting, hives, facial swelling, or difficulty breathing require urgent veterinary attention.",
      "Avoid intense physical activity the same day as vaccination if your pet seems low-energy. A calm recovery window supports comfort.",
      "Keep vaccine records organized by date and product when possible. Accurate history helps your care team plan future boosters appropriately."
    ]
  }
];
