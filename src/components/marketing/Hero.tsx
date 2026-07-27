import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8">
          The modern way to <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-500">
            build your startup
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10">
          Everything you need to launch, scale, and manage your business all in one place. Stop switching between tools and start growing.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="flex items-center justify-center gap-2 px-8 py-4 text-white bg-slate-900 hover:bg-slate-800 rounded-full font-medium transition-colors">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-center gap-2 px-8 py-4 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-full font-medium transition-colors shadow-sm">
            <Play className="w-4 h-4" />
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}
