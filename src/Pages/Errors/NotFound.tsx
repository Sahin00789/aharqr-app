import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-extrabold tracking-tight text-white">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-bold text-slate-100">
          Page Not Found
        </h2>

        <p className="mt-4 text-slate-400">
          The page you're looking for doesn't exist, has been moved, or the URL
          is incorrect.
        </p>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}