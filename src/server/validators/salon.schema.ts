import { z } from "zod";

export const createSalonSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  category: z.enum([
    "COIFFEUR",
    "BARBIER",
    "INSTITUT_BEAUTE",
    "SPA",
    "ONGLES",
    "MAQUILLAGE",
    "EPILATION",
    "MASSAGE",
    "AUTRE",
  ]),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  postalCode: z.string().optional(),
  phone: z.string().min(10, "Numero de telephone invalide"),
  email: z.string().email("Email invalide").optional(),
  description: z.string().max(2000).optional(),
});

export const createServiceSchema = z.object({
  salonId: z.string().min(1),
  name: z.string().min(2, "Le nom du service est requis"),
  price: z.number().min(0, "Le prix doit etre positif"),
  duration: z.number().min(5, "La duree minimum est de 5 minutes"),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  isOnlineBookable: z.boolean().default(true),
});

export type CreateSalonInput = z.infer<typeof createSalonSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
