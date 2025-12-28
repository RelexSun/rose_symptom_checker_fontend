"use server";

import { revalidatePath } from "next/cache";

/**
 * Server action to revalidate diagnosis history page
 * This should be called after creating a new diagnosis
 */
export async function revalidateDiagnosisHistory() {
  revalidatePath("/diagnosis/history");
  revalidatePath("/"); // Also revalidate home page in case it shows recent diagnoses
}
