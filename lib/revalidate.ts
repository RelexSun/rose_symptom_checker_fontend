// Revalidation utilities for Next.js App Router
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidate diagnosis-related pages
 */
export async function revalidateDiagnosisPages() {
  // Revalidate diagnosis history page
  revalidatePath('/diagnosis/history');
  
  // Revalidate the home page (in case it shows recent diagnoses)
  revalidatePath('/');
}

/**
 * Revalidate a specific diagnosis detail page
 */
export async function revalidateDiagnosisDetail(id: string | number) {
  revalidatePath(`/diagnosis/history/${id}`);
}

/**
 * Revalidate all diagnosis pages
 */
export async function revalidateAllDiagnosisPages() {
  revalidatePath('/diagnosis/history');
  revalidatePath('/diagnosis/check');
  revalidatePath('/');
}

