export default function DashboardPreview() {
  return (
    <section className="py-10 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl md:rounded-[2rem] bg-slate-900 p-2 md:p-4 shadow-2xl overflow-hidden border border-slate-800">
          {/* Faux browser header */}
          <div className="flex items-center gap-2 px-4 pb-4 pt-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* Faux app interface */}
          <div className="bg-slate-950 rounded-xl md:rounded-2xl border border-slate-800 aspect-video flex flex-col items-center justify-center relative overflow-hidden">
             {/* Gradient glow effect inside the dashboard */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full"></div>
             
             {/* Replace this div with an actual <img> tag of your dashboard */}
             <div className="relative z-10 text-center">
                <p className="text-slate-400 font-medium tracking-wide">YOUR APP DASHBOARD IMAGE HERE</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
