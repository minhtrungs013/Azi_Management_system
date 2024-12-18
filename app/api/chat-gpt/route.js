import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
export async function POST(request) {
    const params = await request.json();
    const apiKey = 'pk-nCCxJaLwhGzAeFILtnEgqZCFRQCIWmOreBbDKLwncWIyBukT';
  
    try {
      const response = await axios.post(
        'https://api.pawan.krd/pai-001/v1/chat/completions',
        {
          model: 'pai-001',
          messages: [
            {
              role: 'system',
              content: 'You are a poetic assistant, skilled in explaining complex programming concepts with creative flair.',
            },
            {
              role: 'user',
              content: params.prompt,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }), // Disable SSL check (not recommended for production)
        }
      );
  
      return NextResponse.json(response.data);
    } catch (error) {
      console.error('Error calling the external API:', error);
      return NextResponse.json({ error: 'Failed to fetch response from the external API' }, { status: 500 });
    }
  }
