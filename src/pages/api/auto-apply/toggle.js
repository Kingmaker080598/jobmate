import { supabase } from '@/lib/supabaseClient';
import cron from 'node-cron';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, enabled } = req.body;

  try {
    if (enabled) {
      startAutoApplyService(userId);
    } else {
      stopAutoApplyService(userId);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Auto-apply toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle auto-apply' });
  }
}

const autoApplyJobs = new Map();

function startAutoApplyService(userId) {
  // Stop existing job if any
  stopAutoApplyService(userId);

  // Schedule auto-apply to run every hour
  const job = cron.schedule('0 * * * *', async () => {
    try {
      console.log(`Running auto-apply for user ${userId}`);
      
      // Get user's auto-apply settings
      const { data: settings } = await supabase
        .from('auto_apply_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!settings || !settings.enabled) {
        return;
      }

      // Get user's profile
      const { data: profile } = await supabase
        .from('application_profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        console.error(`No profile found for user ${userId}`);
        return;
      }

      // Get jobs that match criteria and haven't been applied to
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .not('id', 'in', 
          supabase
            .from('job_applications')
            .select('job_id')
            .eq('user_id', userId)
        )
        .limit(5); // Limit to 5 applications per hour

      if (!jobs || jobs.length === 0) {
        console.log(`No new jobs found for user ${userId}`);
        return;
      }

      // Apply to each job
      for (const job of jobs) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auto-apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job, profile })
          });

          if (response.ok) {
            console.log(`Successfully applied to ${job.title} at ${job.company}`);
          }
        } catch (error) {
          console.error(`Failed to apply to ${job.title}:`, error);
        }

        // Wait between applications to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
      }
    } catch (error) {
      console.error(`Auto-apply error for user ${userId}:`, error);
    }
  }, {
    scheduled: false
  });

  job.start();
  autoApplyJobs.set(userId, job);
  console.log(`Auto-apply service started for user ${userId}`);
}

function stopAutoApplyService(userId) {
  const existingJob = autoApplyJobs.get(userId);
  if (existingJob) {
    existingJob.stop();
    existingJob.destroy();
    autoApplyJobs.delete(userId);
    console.log(`Auto-apply service stopped for user ${userId}`);
  }
}