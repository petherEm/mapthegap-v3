import { SignupForm } from "@/components/signup";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - MapTheGap",
  description:
    "Create a MapTheGap account to explore location networks across multiple countries and industries. View money transfer, retail, ATM, and more service locations on interactive maps.",
};

export default function SignupPage() {
  return <SignupForm />;
}
