const testimonials = [
  { name: "Sarah Jenkins", role: "CTO at TechFlow", content: "This product has completely transformed how our engineering team operates. We've cut our deployment times in half.", avatar: "https://i.pravatar.cc/150?u=sarah" },
  { name: "Michael Chen", role: "Founder, StartupX", content: "The easiest tool I've ever used. The interface is intuitive, and the customer support is absolutely unparalleled.", avatar: "https://i.pravatar.cc/150?u=michael" },
  { name: "Elena Rodriguez", role: "Product Manager", content: "I was skeptical at first, but the ROI has been incredible. It paid for itself within the first two weeks of use.", avatar: "https://i.pravatar.cc/150?u=elena" },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">Loved by builders worldwide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((review, index) => (
            <div key={index} className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-slate-700 mb-6 italic">"{review.content}"</p>
              <div className="flex items-center gap-4">
                <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-slate-900">{review.name}</h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
