"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-xl font-bold">Da co loi xay ra</h1>
        <p className="text-sm text-muted-foreground">
          Xin loi, he thong gap su co. Vui long thu lai hoac quay ve trang chu.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Thu lai
          </Button>
          <Button onClick={() => (window.location.href = "/")}>
            <Home className="mr-2 h-4 w-4" />
            Trang chu
          </Button>
        </div>
      </div>
    </div>
  );
}
