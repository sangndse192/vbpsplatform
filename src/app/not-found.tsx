import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold">Trang khong ton tai</h1>
        <p className="text-sm text-muted-foreground">
          Trang ban dang tim khong ton tai hoac da bi xoa.
        </p>
        <Link href="/">
          <Button>Quay ve trang chu</Button>
        </Link>
      </div>
    </div>
  );
}
