import { prisma } from "../config/prisma.js";

export function withTx(tx, work) {
  if (tx) {
    return work(tx);
  }
  return prisma.$transaction(work);
}
