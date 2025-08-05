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
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'ID parameter is required' });
    }

    const { data: file, error } = await supabase
      .from('index_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Parse index_data if it's a string
    if (typeof file.index_data === 'string') {
      try {
        file.index_data = JSON.parse(file.index_data);
      } catch (e) {
        file.index_data = {};
      }
    }

    // Ensure frames are accessible through the correct path
    if (file.index_data && !file.index_data.frames && file.index_data.data?.frames) {
      file.index_data.frames = file.index_data.data.frames;
    }

    res.status(200).json({ success: true, data: file });
  } catch (error) {
    console.error('Error reading index data:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 