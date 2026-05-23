import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { forumArticles } from "../data/forumArticles";

export default function ForumArticleView() {
  const { slug } = useParams();
  const article = forumArticles.find(item => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <div className="md:ml-64 min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto bg-primary-light rounded-2xl border p-6">
          <h1 className="text-3xl font-bold text-primary-dark">Article not found</h1>
          <p className="text-gray-700 mt-3">The article you are trying to view does not exist.</p>
          <Link
            to="/forum/topics"
            className="inline-flex mt-5 px-5 py-2 rounded-lg bg-primary-dark text-white hover:opacity-90"
          >
            Back to Forums
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="md:ml-64 min-h-screen bg-background p-8">
      <article className="max-w-4xl mx-auto bg-primary-light rounded-2xl border p-6 md:p-8">
        <div className="mb-6 border-b border-primary-dark/15 pb-5">
          <p className="text-sm uppercase tracking-wider text-primary-dark/70">Forum Article</p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mt-2">{article.title}</h1>
          <p className="text-gray-700 mt-2">
            By <span className="font-semibold">{article.author}</span> • {new Date(article.publishedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-4 text-gray-800 leading-relaxed">
          {article.content.map((paragraph, index) => (
            <p key={`${article.slug}-${index}`}>{paragraph}</p>
          ))}
        </div>

        <Link
          to="/forum/topics"
          className="inline-flex mt-8 px-5 py-2 rounded-lg bg-primary-dark text-white hover:opacity-90"
        >
          Back to Forums
        </Link>
      </article>
    </div>
  );
}
