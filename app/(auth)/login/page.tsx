import { LoginForm } from "@/components/login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - MapTheGap",
  description:
    "Sign in to MapTheGap to explore location networks across multiple countries and industries. View money transfer, retail, ATM, and more service locations on interactive maps.",
};

export default function LoginPage() {
  return <LoginForm />;
}
