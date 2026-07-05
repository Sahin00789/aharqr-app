import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "Can I cancel my subscription at any time?", answer: "Yes! You can cancel your subscription at any time from your account settings. You will retain access to the platform until the end of your billing period." },
  { question: "Do you offer a free trial?", answer: "We offer a 14-day free trial on all paid plans. No credit card is required to sign up and start testing our features." },
  { question: "Can I switch plans later?", answer: "Absolutely. You can upgrade or downgrade your plan at any time. Prorated charges or credits will automatically be applied to your account." },
  { question: "Is my data safe?", answer: "Security is our top priority. All data is encrypted at rest and in transit. We are fully compliant with GDPR and SOC2 standards." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently asked questions</h2>
          <p className="text-lg text-slate-600">Everything you need to know about the product and billing.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-600 border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
