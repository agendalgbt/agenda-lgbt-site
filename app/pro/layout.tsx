import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "Agenda LGBT Pro — Espace organisateurs",
  description: "Soumettez vos événements LGBT+ sur Agenda LGBT et touchez des milliers de personnes en France et en Belgique.",
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
