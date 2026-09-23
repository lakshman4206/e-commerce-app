import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce
    .number()
    .positive({ message: "Price must be greater than 0." }),
  stockQuantity: z.coerce
    .number()
    .int()
    .min(0, { message: "Stock cannot be negative." }),
  images: z
    .array(z.string().url({ message: "Each image must be a valid URL." }))
    .min(1, { message: "At least one product image is required." }),
  categoryId: z.string().min(1, { message: "Please select a category." }),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productSchema>;
