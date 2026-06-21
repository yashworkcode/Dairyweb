import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
    <h1 className="font-display text-5xl font-semibold text-pasture-600 dark:text-gold-400">404</h1>
    <p className="mt-2 text-ink-700/70 dark:text-cream-100/60">This page wandered off the delivery route.</p>
    <Link to="/" className="btn-primary mt-6">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
