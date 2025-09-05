// src/app/(dashboard)/shuddle/page.tsx
import prisma from '@/lib/prisma';
import ShuddlePageClient from '@/components/wizard/ShuddlePageClient';
import type { WizardData } from '@/types';
import { fetchAllDataForWizard } from '@/lib/data-fetching/fetch-wizard-data';

export default async function ShuddlePage() {
    
    // fetchAllDataForWizard now fetches data from the database as a fallback
    // if no active draft is found.
    const initialData = await fetchAllDataForWizard();

    // Serialize data to convert Date objects to strings, preventing Redux non-serializable errors.
    const serializableData = JSON.parse(JSON.stringify(initialData));

    return <ShuddlePageClient initialData={serializableData} />;
}
