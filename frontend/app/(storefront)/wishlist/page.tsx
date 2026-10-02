import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWishlist } from "@/actions/wishlist";
import { WishlistView } from "@/components/storefront/wishlist-view";

export const metadata = {
  title: "My Wishlist | E Com Web",
  description: "Your saved products and wish list on E Com Web marketplace.",
};

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { items } = await getWishlist();

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          My Wishlist
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {items.length === 0
            ? "Your wishlist is empty. Browse products and save your favourites."
            : `${items.length} saved item${items.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <WishlistView initialItems={items} />
    </div>
  );
}
