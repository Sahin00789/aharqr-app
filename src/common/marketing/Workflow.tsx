const steps = [
  { step: "01", title: "Create your account", description: "Sign up in seconds. No credit card required to start your free trial." },
  { step: "02", title: "Connect your tools", description: "Sync your existing stack with our one-click native integrations." },
  { step: "03", title: "Start growing", description: "Deploy your first campaign and watch the analytics roll in immediately." },
];

export default function Workflow() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg text-slate-600">Get up and running in three simple steps.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-slate-100 z-0"></div>
          
          {steps.map((item, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-6 shadow-lg ring-8 ring-white">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 max-w-xs">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
