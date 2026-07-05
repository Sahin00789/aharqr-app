import { Check } from "lucide-react";

const tiers = [
  { name: "Starter", price: "$19", description: "Perfect for individuals.", features: ["Up to 5 projects", "Basic analytics", "24-hour support response time"] },
  { name: "Pro", price: "$49", description: "Best for growing teams.", isPopular: true, features: ["Unlimited projects", "Advanced analytics", "Custom domains", "1-hour support response time"] },
  { name: "Enterprise", price: "$99", description: "For large scale operations.", features: ["Everything in Pro", "Dedicated success manager", "Custom contracts", "SSO Authentication"] },
];

export default function Pricing() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-slate-600">Choose the perfect plan for your needs. No hidden fees.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier, index) => (
            <div key={index} className={`relative p-8 bg-white rounded-3xl shadow-sm border ${tier.isPopular ? 'border-blue-600 shadow-xl md:-translate-y-4' : 'border-slate-200'}`}>
              {tier.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium tracking-wide">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">{tier.name}</h3>
              <p className="text-slate-500 mb-6">{tier.description}</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-slate-900">{tier.price}</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3 text-slate-700">
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${tier.isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
