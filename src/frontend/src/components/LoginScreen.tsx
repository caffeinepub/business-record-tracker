import { Button } from "@/components/ui/button";
import { Loader2, Shield, Smartphone, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginScreen() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 bg-background">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mb-6"
        >
          <div className="w-20 h-20 card-gradient-teal rounded-2xl flex items-center justify-center shadow-fab mx-auto">
            <span className="text-white font-bold text-3xl">₹</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Business Record Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Track daily sales, expenses, profits & credit (Udhaar) — free,
            private, and secure.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full space-y-3 mb-8"
        >
          <FeaturePill
            icon={<TrendingUp className="h-4 w-4" />}
            text="Track sales, expenses & profit daily"
          />
          <FeaturePill
            icon={<Shield className="h-4 w-4" />}
            text="100% private — your data, your control"
          />
          <FeaturePill
            icon={<Smartphone className="h-4 w-4" />}
            text="Mobile-first, works like an app"
          />
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full"
        >
          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-fab"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              "Get Started — Free"
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Secured by Internet Identity · No password required
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-positive" />
          <p className="text-xs text-muted-foreground font-medium">
            No ads · No premium plans · No data sharing
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}

function FeaturePill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-accent rounded-xl px-4 py-3">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
        {icon}
      </div>
      <p className="text-sm font-medium text-accent-foreground">{text}</p>
    </div>
  );
}
