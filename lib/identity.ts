import "server-only";
import type { Prisma } from "@prisma/client";
import { formatIdentityNo } from "@/lib/utils";

/** Assign the next VADA-00N inside the caller's transaction. Numbers are never reused. */
export async function assignIdentityNo(tx: Prisma.TransactionClient) {
  const counter = await tx.identityCounter.update({
    where: { id: 1 },
    data: { next: { increment: 1 } },
  });
  return formatIdentityNo(counter.next - 1);
}
