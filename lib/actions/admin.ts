'use server';

import { revalidatePath } from 'next/cache';

export async function publishModel(modelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: 'Configuration error' };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/publish-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ model_id: modelId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to publish model' };
    }

    revalidatePath('/admin/models');
    revalidatePath(`/admin/models/${modelId}`);
    revalidatePath('/cars');

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createIngestionJob(sourceUrl?: string): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: 'Configuration error' };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/run-ingestion-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        source_url: sourceUrl,
        job_type: 'manual',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to create job' };
    }

    const data = await response.json();

    revalidatePath('/admin/jobs');

    return { success: true, jobId: data.job_id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
