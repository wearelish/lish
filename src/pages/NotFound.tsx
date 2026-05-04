import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen hero-bg flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-serif text-6xl text-gradient mb-4">404</h1>
        <p className="text-muted-foreground mb-6">Page not found.</p>
        <Button onClick={() => navigate("/")} className="rounded-full bg-foreground text-background border-0">Go Home</Button>
      </div>
    </div>
  );
}
