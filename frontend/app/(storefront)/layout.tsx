import { auth } from "@/lib/auth";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
