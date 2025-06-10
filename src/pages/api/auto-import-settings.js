import { supabase } from '@/lib/supabaseClient';
import cron from 'node-cron';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { enabled, criteria, sources } = req.body;

  try {
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Save auto-import settings
    const { error } = await supabase
      .from('auto_import_settings')
      .upsert({
        user_id: session.user.id,
        enabled,
        criteria,
        sources,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Schedule or unschedule the cron job
    if (enabled) {
      scheduleAutoImport(session.user.id, criteria, sources);
    } else {
      unscheduleAutoImport(session.user.id);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Auto-import settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

const scheduledJobs = new Map();

function scheduleAutoImport(userId, criteria, sources) {
  // Unschedule existing job if any
  unscheduleAutoImport(userId);

  // Schedule new job to run daily at 9 AM
  const job = cron.schedule('0 9 * * *', async () => {
    try {
      console.log(`Running auto-import for user ${userId}`);
      
      // Call the import-jobs API
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/import-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'all',
          criteria,
          sources,
          userId
        })
      });

      if (response.ok) {
        console.log(`Auto-import completed for user ${userId}`);
      } else {
        console.error(`Auto-import failed for user ${userId}`);
      }
    } catch (error) {
      console.error(`Auto-import error for user ${userId}:`, error);
    }
  }, {
    scheduled: false
  });

  job.start();
  scheduledJobs.set(userId, job);
}

function unscheduleAutoImport(userId) {
  const existingJob = scheduledJobs.get(userId);
  if (existingJob) {
    existingJob.stop();
    existingJob.destroy();
    scheduledJobs.delete(userId);
  }
}