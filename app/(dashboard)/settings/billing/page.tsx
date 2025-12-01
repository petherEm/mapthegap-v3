import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { Suspense } from "react";

async function BillingContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For getting started",
      features: [
        "Up to 1,000 locations",
        "Basic map views",
        "CSV export",
        "Community support",
      ],
      current: true,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For growing teams",
      features: [
        "Unlimited locations",
        "Advanced analytics",
        "API access",
        "Priority support",
        "Custom branding",
      ],
      current: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "SSO / SAML",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
      ],
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-50">
          Billing & Plans
        </h2>
        <p className="text-sm text-neutral-400">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-400">Current Plan</p>
            <p className="text-xl font-semibold text-neutral-50">Free Plan</p>
          </div>
          <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-sm font-medium rounded-full">
            Active
          </span>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="font-medium text-neutral-50 mb-4">Available Plans</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-neutral-900/50 border rounded-xl p-5 ${
                plan.current ? "border-violet-500" : "border-neutral-800"
              }`}
            >
              <div className="mb-4">
                <h4 className="font-semibold text-neutral-50">{plan.name}</h4>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-neutral-50">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-neutral-400">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-neutral-300"
                  >
                    <Check className="h-4 w-4 text-violet-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.current || plan.name === "Enterprise"}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  plan.current
                    ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                    : plan.name === "Enterprise"
                    ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    : "bg-violet-500 text-white hover:bg-violet-600"
                }`}
              >
                {plan.current
                  ? "Current Plan"
                  : plan.name === "Enterprise"
                  ? "Contact Sales"
                  : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <h3 className="font-medium text-neutral-50 mb-3">Payment Method</h3>
        <p className="text-sm text-neutral-400">
          No payment method on file. Add one when you upgrade to a paid plan.
        </p>
      </div>
    </div>
  );
}

function BillingLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-32 bg-neutral-800 rounded animate-pulse" />
        <div className="h-5 w-64 bg-neutral-800 rounded animate-pulse mt-2" />
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <div className="h-16 bg-neutral-800 rounded animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
            <div className="h-32 bg-neutral-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingLoading />}>
      <BillingContent />
    </Suspense>
  );
}
