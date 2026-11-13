import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  ScanLine,
  UserPlus,
  Printer,
  Receipt,
  Users,
  CircleCheck,
  QrCode,
} from "lucide-react";
import { Button } from "../../components";
import { PublicShell } from "../../layouts/PublicShell";

const QUICK_CONTACT = [
  {
    icon: Mail,
    label: "Email support",
    value: "support@aharqr.test",
    action: () => (window.location.href = "mailto:support@aharqr.test"),
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Message us on WhatsApp",
    action: () => window.open("https://wa.me/", "_blank"),
  },
  {
    icon: Phone,
    label: "Phone support",
    value: "Contact your restaurant admin",
    action: () => {},
  },
];

const GUIDES = [
  {
    icon: ScanLine,
    title: "Scan to order",
    body: "Point your phone camera at the QR sticker on the table — the menu opens directly in your browser. Browse categories, add items to your cart and tap Place Order.",
  },
  {
    icon: Printer,
    title: "Print QR stickers",
    body: "Admins go to Settings → Tables & QR, select tables and print the A4 2×2 sticker sheet right from the browser — no design tool needed.",
  },
  {
    icon: UserPlus,
    title: "Invite staff",
    body: "Admins go to Staff Management and add Captain or Chef accounts. Invited staff sign in with Google and are assigned their workspace automatically.",
  },
  {
    icon: Receipt,
    title: "Settle and track revenue",
    body: "As captains mark orders served and completed, revenue is recognised automatically in the finance ledger. Admins can review every entry under Payments.",
  },
];

const FAQ = [
  {
    question: "How do guests place an order?",
    answer:
      "Guests scan the table QR code with any phone camera, which opens the AharQR menu directly in their browser — no app download needed. They browse categories, add items to a cart, choose dine-in or takeaway, and tap Place Order. The order immediately appears in the kitchen queue.",
  },
  {
    question: "How do I print QR stickers for my tables?",
    answer:
      "Admins can go to Settings → Tables & QR, create or edit tables with a name, section and seat count, then generate and print an A4 2×2 sticker sheet directly from the browser. Each sticker contains a unique QR code that resolves to the correct table.",
  },
  {
    question: "Why don't I see orders appearing in the kitchen?",
    answer:
      "Orders update in real time via WebSockets. If you don't see updates, check that the device is connected to the same Wi-Fi network as the server. Try refreshing the page — orders should appear within seconds of being placed.",
  },
  {
    question: "How do I manage the menu?",
    answer:
      "Admins manage categories, dishes and photos from Settings → Dishes. Each dish has a name, price, veg/non-veg type, category and optional photos. Changes appear on the guest menu immediately, and the Menu tab gives staff a quick preview of what is available.",
  },
  {
    question: "What happens when an order is cancelled?",
    answer:
      "Orders can be cancelled from any active state by an admin or captain. AharQR records the cancellation in the order trail and reverses any revenue that had already been recognised, so the finance ledger always stays accurate.",
  },
  {
    question: "How do staff members sign in?",
    answer:
      "AharQR signs staff in with Google or a one-time code emailed to their work address — there are no passwords to manage. If an email code never arrives, check the address with your restaurant admin from Staff Management, then request a new code from the login screen.",
  },
  {
    question: "What roles are available and what can they do?",
    answer:
      "Admins have full access - menus, tables, staff, orders and finance. Captains manage floor orders, tables and seating. Chefs manage the kitchen queue and prep status. Guests order from their table QR.",
  },
];

function ContactCard({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-accent-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-accent-500/50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 transition group-hover:bg-accent-100 dark:bg-accent-500/15 dark:text-accent-400">
        <Icon size={20} />
      </span>
      <div className="min-w-0 text-left">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
        <p className="truncate text-xs text-zinc-400">{value}</p>
      </div>
    </button>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <HelpCircle size={18} className="shrink-0 text-accent-600 dark:text-accent-400" />
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{question}</span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="flex flex-col items-center py-16 text-center sm:py-20">
        <span className="mb-4 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-semibold tracking-wide text-accent-700 uppercase dark:border-accent-500/30 dark:bg-accent-500/15 dark:text-accent-300">
          Support
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          How can{" "}
          <span className="text-accent-600 dark:text-accent-400">we help</span>{" "}
          you?
        </h1>
        <p className="mt-5 max-w-xl text-base text-zinc-500 sm:text-lg dark:text-zinc-400">
          Quick answers for guests, restaurant staff and owners.
        </p>
      </section>

      {/* Quick contact */}
      <section className="pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_CONTACT.map((item) => (
            <ContactCard key={item.label} {...item} onClick={item.action} />
          ))}
        </div>
      </section>

      {/* Getting Started guides */}
      <section className="pb-16">
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Getting started
        </p>
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          AharQR in four steps
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="relative rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="absolute top-4 right-4 text-xs font-bold text-zinc-200 dark:text-zinc-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16">
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Frequently asked questions
        </p>
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Common questions
        </h2>
        <div className="mx-auto max-w-2xl space-y-3">
          {FAQ.map((item) => (
            <FaqItem key={item.question} {...item} />
          ))}
        </div>
      </section>

      {/* Role overview */}
      <section className="pb-16">
        <div className="rounded-2xl bg-zinc-900 p-8 text-white sm:p-12 dark:bg-zinc-100 dark:text-zinc-900">
          <h2 className="text-2xl font-bold sm:text-3xl">Role quick reference</h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base dark:text-zinc-600">
            AharQR gives each team member the exact workspace their job needs.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                role: "Admin",
                icon: QrCode,
                duties: "Full access · tables · staff · orders · finance",
              },
              {
                role: "Captain",
                icon: Users,
                duties: "Floor orders · table status · payments · billing",
              },
              {
                role: "Chef",
                icon: CircleCheck,
                duties: "Kitchen queue · menu availability · prep status",
              },
              {
                role: "Guest",
                icon: ScanLine,
                duties: "Scan QR · browse menu · place order · track status",
              },
            ].map(({ role, icon: Icon, duties }) => (
              <div key={role} className="rounded-xl bg-zinc-800 p-4 dark:bg-white">
                <div className="mb-2 flex items-center gap-2">
                  <Icon size={18} className="text-accent-400 dark:text-accent-600" />
                  <p className="font-semibold">{role}</p>
                </div>
                <p className="text-xs leading-relaxed text-zinc-400 dark:text-zinc-600">{duties}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="rounded-2xl bg-gradient-to-br from-accent-600 to-accent2-600 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Still need help?</h2>
          <p className="mt-3 max-w-md mx-auto text-sm text-white/80 sm:text-base">
            Reach out directly and our team will get back to you within one
            business day.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="bg-white text-zinc-900 hover:bg-zinc-100 px-6 py-3 text-base"
              onClick={() => (window.location.href = "mailto:support@aharqr.test")}
            >
              <Mail size={18} /> support@aharqr.test
            </Button>
            <Button
              variant="ghost"
              className="border border-white/30 text-white hover:bg-white/10 px-6 py-3 text-base"
              onClick={() => window.open("https://wa.me/", "_blank")}
            >
              <MessageCircle size={18} /> WhatsApp us
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}