import { useState } from "react";
import PasswordProtection from "@/components/PasswordProtection";
import ArabicLanguagePlatform from "./ArabicLanguagePlatform";

export default function ProtectedArabicLanguagePlatform() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <PasswordProtection onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <ArabicLanguagePlatform />;
}
