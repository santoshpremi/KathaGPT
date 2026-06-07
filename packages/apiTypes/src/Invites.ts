import { z } from "zod";

export const ApiEmailInvite = z.object({
  email: z.string().email(),
});

export type ApiEmailInvite = z.infer<typeof ApiEmailInvite>;
