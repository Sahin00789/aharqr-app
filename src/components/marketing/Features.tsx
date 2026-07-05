import { Zap, Shield, Smartphone, Globe, BarChart3, Layers } from "lucide-react";

const features = [
  { name: "Lightning Fast", description: "Optimized for speed and performance right out of the box.", icon: Zap },
  { name: "Bank-grade Security", description: "Your data is encrypted and stored securely on our enterprise servers.", icon: Shield },
  { name: "Mobile Optimized", description: "Looks and works perfectly on any device, anywhere.", icon: Smartphone },
  { name: "Global CDN", description: "Deliver content to your users instantly, no matter where they are.", icon: Globe },
  { name: "Advanced Analytics", description: "Get deep insights into your users' behavior and engagement.", icon: BarChart3 },
  { name: "Seamless Integrations", description: "Connect with the tools you already use in just a few clicks.", icon: Layers },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful features for modern teams</h2>
          <p className="text-lg text-slate-600">We've thought of everything so you don't have to. Focus on your business while we handle the heavy lifting.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.name}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
