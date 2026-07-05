import { Link } from "react-router-dom";

export default function RestaurantOnboarding() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome to AharQR 👋
          </h1>

          <p className="mt-3 text-slate-400">
            Before you can access the dashboard, create your restaurant.
            This only takes a couple of minutes.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-lg font-semibold text-white">
            Restaurant Setup
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            You'll be asked for:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
            <li>Restaurant name</li>
            <li>Restaurant type</li>
            <li>Address</li>
            <li>Phone number</li>
            <li>Logo (optional)</li>
          </ul>

          <button
            className="mt-8 w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
            onClick={() => {
              // TODO:
              // Open onboarding form or navigate to multi-step setup.
            }}
          >
            Create Restaurant
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            to="/login"
            className="text-sm text-slate-400 hover:text-white"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}