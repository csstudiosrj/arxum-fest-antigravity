import EscolaShell from "../_components/EscolaShell";

export default function GrupoProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A autenticação já foi feita no layout pai (/grupo/layout.tsx)
  // Este componente só serve para aplicar o shell visual (EscolaShell)
  return <EscolaShell>{children}</EscolaShell>;
}