import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { BreedIdentifier } from "./components/BreedIdentifier";
import { IdentificationHistory } from "./components/IdentificationHistory";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 md:p-8 bg-cream relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 md:w-64 md:h-64 rounded-full bg-terracotta/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 md:w-80 md:h-80 rounded-full bg-forest/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-terracotta/10 mb-4 md:mb-6 border-2 border-terracotta/30">
            <span className="text-3xl md:text-4xl">🐕</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal mb-2 md:mb-3">Canine Codex</h1>
          <p className="font-body text-charcoal/60 text-sm md:text-base">Your pocket breed encyclopedia</p>
        </div>

        {/* Auth card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-charcoal/10">
          <h2 className="font-display text-xl md:text-2xl text-charcoal mb-6 text-center">
            {flow === "signIn" ? "Welcome Back" : "Join the Pack"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-sm text-charcoal/70 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-cream border border-charcoal/20 font-body text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-all"
                placeholder="good.boy@email.com"
              />
            </div>
            <div>
              <label className="block font-body text-sm text-charcoal/70 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg bg-cream border border-charcoal/20 font-body text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-all"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <p className="text-sm text-red-600 font-body text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 bg-terracotta text-white font-body font-semibold rounded-lg hover:bg-terracotta/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-terracotta/20"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : flow === "signIn" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal/10">
            <button
              onClick={() => signIn("anonymous")}
              className="w-full py-3 bg-forest/10 text-forest font-body font-medium rounded-lg hover:bg-forest/20 transition-all"
            >
              Continue as Guest
            </button>
          </div>

          <p className="mt-6 text-center font-body text-sm text-charcoal/60">
            {flow === "signIn" ? "New here? " : "Already have an account? "}
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-terracotta hover:underline font-semibold"
            >
              {flow === "signIn" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { signOut } = useAuthActions();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-cream relative flex flex-col">
      {/* Background texture */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <header className="relative z-10 border-b border-charcoal/10 bg-white/60 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-terracotta/10 flex items-center justify-center border border-terracotta/30">
              <span className="text-lg md:text-xl">🐕</span>
            </div>
            <h1 className="font-display text-lg md:text-2xl text-charcoal">Canine Codex</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 md:px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                showHistory
                  ? "bg-forest text-white"
                  : "bg-forest/10 text-forest hover:bg-forest/20"
              }`}
            >
              <span className="hidden sm:inline">{showHistory ? "New Scan" : "History"}</span>
              <span className="sm:hidden">{showHistory ? "📷" : "📚"}</span>
            </button>
            <button
              onClick={() => signOut()}
              className="px-3 md:px-4 py-2 rounded-lg bg-charcoal/5 text-charcoal/70 font-body text-sm hover:bg-charcoal/10 transition-all"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">👋</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-12">
        {showHistory ? <IdentificationHistory /> : <BreedIdentifier />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-charcoal/10 bg-white/40 backdrop-blur-sm py-4 md:py-6">
        <p className="text-center font-body text-xs md:text-sm text-charcoal/40">
          Requested by <a href="https://twitter.com/PauliusX" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">@PauliusX</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">@clonkbot</a>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🐕</span>
          </div>
          <p className="font-body text-charcoal/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <MainApp />;
}
