import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItemProduct } from "@/types";

interface CartStore {
  items: CartItemProduct[];
  isOpen: boolean;
  currentUserEmail: string;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItemProduct, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncUserCart: (email?: string | null) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      currentUserEmail: "",

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      syncUserCart: (email?: string | null) => {
        const cleanEmail = (email || "").toLowerCase().trim();
        const prevEmail = get().currentUserEmail;

        if (cleanEmail === prevEmail) return;

        // 1. Save current items to previous user storage
        if (typeof window !== "undefined") {
          try {
            const currentItems = get().items;
            const prevKey = prevEmail ? `ecomweb_cart_${prevEmail}` : "ecomweb_cart_guest";
            localStorage.setItem(prevKey, JSON.stringify(currentItems));

            // 2. Load target user's cart
            const newKey = cleanEmail ? `ecomweb_cart_${cleanEmail}` : "ecomweb_cart_guest";
            const savedCart = localStorage.getItem(newKey);
            if (savedCart) {
              const loadedItems = JSON.parse(savedCart);
              set({ items: loadedItems, currentUserEmail: cleanEmail });
              return;
            } else if (cleanEmail && currentItems.length > 0) {
              // Migrate guest items to newly logged-in user
              localStorage.setItem(newKey, JSON.stringify(currentItems));
              set({ currentUserEmail: cleanEmail });
              return;
            }
          } catch (e) {
            console.warn("[CART_SYNC_WARN]:", e);
          }
        }

        set({ items: cleanEmail ? [] : get().items, currentUserEmail: cleanEmail });
      },

      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        let updatedItems: CartItemProduct[];

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            item.stockQuantity || 99
          );
          updatedItems = currentItems.map((i) =>
            i.id === item.id ? { ...i, quantity: newQuantity } : i
          );
        } else {
          updatedItems = [
            ...currentItems,
            { ...item, quantity: Math.min(quantity, item.stockQuantity || 99) },
          ];
        }

        set({ items: updatedItems });

        // Persist to user-specific cart storage
        if (typeof window !== "undefined") {
          const email = get().currentUserEmail;
          const key = email ? `ecomweb_cart_${email}` : "ecomweb_cart_guest";
          try {
            localStorage.setItem(key, JSON.stringify(updatedItems));
          } catch {}
        }
      },

      removeItem: (id: string) => {
        const updatedItems = get().items.filter((i) => i.id !== id);
        set({ items: updatedItems });

        if (typeof window !== "undefined") {
          const email = get().currentUserEmail;
          const key = email ? `ecomweb_cart_${email}` : "ecomweb_cart_guest";
          try {
            localStorage.setItem(key, JSON.stringify(updatedItems));
          } catch {}
        }
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const updatedItems = get().items.map((item) => {
          if (item.id === id) {
            const safeQty = Math.min(quantity, item.stockQuantity || 99);
            return { ...item, quantity: safeQty };
          }
          return item;
        });

        set({ items: updatedItems });

        if (typeof window !== "undefined") {
          const email = get().currentUserEmail;
          const key = email ? `ecomweb_cart_${email}` : "ecomweb_cart_guest";
          try {
            localStorage.setItem(key, JSON.stringify(updatedItems));
          } catch {}
        }
      },

      clearCart: () => {
        set({ items: [] });
        if (typeof window !== "undefined") {
          const email = get().currentUserEmail;
          const key = email ? `ecomweb_cart_${email}` : "ecomweb_cart_guest";
          try {
            localStorage.setItem(key, JSON.stringify([]));
          } catch {}
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "ecommerce-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, currentUserEmail: state.currentUserEmail }),
    }
  )
);
