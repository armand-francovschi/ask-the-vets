import { useEffect } from "react";
import { Link } from "react-router-dom";
import { forumArticles } from "../data/forumArticles";

const FORUM_TOPICS_SCROLL_KEY = "forum-topics-scroll-y";

export default function ForumTopics() {
  const sortedArticles = [...forumArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  useEffect(() => {
    const savedScrollY = sessionStorage.getItem(FORUM_TOPICS_SCROLL_KEY);
    if (savedScrollY) {
      window.scrollTo(0, Number(savedScrollY));
    }

    return () => {
      sessionStorage.setItem(FORUM_TOPICS_SCROLL_KEY, String(window.scrollY));
    };
  }, []);

  const persistCurrentScroll = () => {
    sessionStorage.setItem(FORUM_TOPICS_SCROLL_KEY, String(window.scrollY));
  };

  return (
    <div className="md:ml-64 min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Forum Topics</h1>
        <p className="text-gray-700 mb-8">Explore article topics from veterinarians and the Ask The Vets team.</p>

        <div className="space-y-4">
          {sortedArticles.map(article => (
            <article key={article.slug} className="bg-primary-light rounded-xl border p-5 md:p-6">
              <p className="text-xs uppercase tracking-wider text-primary-dark/70">Article</p>
              <h2 className="text-2xl font-semibold text-primary-dark mt-1">{article.title}</h2>
              <p className="text-sm text-gray-700 mt-1">
                By <span className="font-semibold">{article.author}</span> • {new Date(article.publishedAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mt-3">{article.summary}</p>

              <Link
                to={`/forum/${article.slug}`}
                onClick={persistCurrentScroll}
                className="inline-flex mt-4 px-4 py-2 rounded-lg bg-primary-dark text-white hover:opacity-90"
              >
                Read Article
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
