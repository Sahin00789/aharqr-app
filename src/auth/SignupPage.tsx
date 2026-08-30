import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  registerRestaurantAdmin,
  verifyGoogleCode,
} from "../services/auth.service";
import { Button, ErrorBanner, Input } from "../common/ui";
import { GoogleAuthButton } from "../common/ui/GoogleAuthButton";
import { AuthLayout } from "./LoginPage";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface SignupStage {
  registrationTicket: string;
  profile: { sub: string; email: string; name?: string; picture?: string };
}

export function SignupPage() {
  const navigate = useNavigate();

  const [stage, setStage] = useState<SignupStage | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleCredential(credential: string) {
    setError("");
    const verified = await verifyGoogleCode(credential);
    setStage(verified);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stage) return;
    setError("");
    setLoading(true);
    try {
      await registerRestaurantAdmin({
        registrationTicket: stage.registrationTicket,
        restaurantName: restaurantName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      toast.success("Restaurant created — welcome aboard!");
      navigate("/app", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create your restaurant</h1>
        <p className="text-sm text-zinc-500">
          You'll be the admin — invite staff once you're in.
        </p>
      </header>

      {!stage ? (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <ErrorBanner message={error} />
          <p className="text-sm text-zinc-500">
            First, verify your Google account to prove you own this email.
          </p>
          <GoogleAuthButton
            onCredential={handleGoogleCredential}
            onError={setError}
            label="Verify with Google"
            loadingLabel="Verifying with Google…"
          />
          <p className="text-xs text-zinc-400">
            Already registered?{" "}
            <Link to="/auth" className="font-medium text-accent-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <ErrorBanner message={error} />

          <div className="flex items-center gap-3 rounded-lg bg-accent-50 px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-600 to-accent2-600 text-white">
              {stage.profile.picture ? (
                <img
                  src={stage.profile.picture}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ShieldCheck size={16} />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{stage.profile.name}</p>
              <p className="truncate text-xs text-zinc-500">{stage.profile.email}</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 uppercase">
              Verified
            </span>
          </div>

          <Input
            id="restaurantName"
            label="Restaurant name"
            required
            minLength={2}
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Smoke & Spice Kitchen"
            autoFocus
          />
          <Input
            id="phone"
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
          <Input
            id="address"
            label="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="12 MG Road, Bengaluru"
          />

          <Button
            type="submit"
            loading={loading}
            loadingText="Creating your restaurant…"
            className="w-full"
          >
            Create restaurant account
          </Button>
          <p className="text-center text-xs text-zinc-400">
            Ticket expires in 10 minutes — just restart the flow if it does.
          </p>
        </form>
      )}

      <p className="text-center text-sm text-zinc-500">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-zinc-700 hover:underline">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </p>
    </AuthLayout>
  );
}
