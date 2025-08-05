import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { data: files, error } = await supabase
      .from('index_files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    const indexFiles = files.map(file => {
      // Parse index_data if it's a string
      let indexDataObj = file.index_data;
      if (typeof indexDataObj === 'string') {
        try {
          indexDataObj = JSON.parse(indexDataObj);
        } catch (e) {
          indexDataObj = {};
        }
      }
      
      // Access frames through the correct path
      const frames = indexDataObj?.data?.frames || indexDataObj?.frames || [];
      const thumbnailCount = frames.reduce((acc: number, frame: any) =>
        acc + (frame.thumbnails?.length || 0), 0);
      
      return {
        filename: file.id,
        projectId: file.project_id || 'unknown',
        figmaFileKey: file.figma_file_key || 'unknown',
        fileName: file.file_name || 'Unknown File',
        timestamp: file.uploaded_at,
        uploadedAt: file.uploaded_at,
        size: JSON.stringify(file.index_data).length,
        frameCount: frames.length,
        thumbnailCount: thumbnailCount
      };
    });

    res.status(200).json({ success: true, files: indexFiles });
  } catch (error) {
    console.error('Error reading index files:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 