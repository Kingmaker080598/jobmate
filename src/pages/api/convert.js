// pages/api/convert.js

import CloudConvert from 'cloudconvert';
import fetch from 'node-fetch';



const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { docxUrl, outputFileName } = req.body;

  if (!docxUrl || !outputFileName) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const job = await cloudConvert.jobs.create({
      tasks: {
        import_docx: {
          operation: 'import/url',
          url: docxUrl
        },
        convert: {
          operation: 'convert',
          input: 'import_docx',
          output_format: 'pdf'
        },
        export_pdf: {
          operation: 'export/url',
          input: 'convert'
        }
      }
    });

    const completedJob = await cloudConvert.jobs.wait(job.id); // Wait for job to complete
    const exportTask = completedJob.tasks.find(task => task.name === 'export_pdf');
    const fileUrl = exportTask.result.files[0].url;

    // Pipe the PDF directly to client for download
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();

    res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({ error: 'Conversion failed.' });
  }
}
