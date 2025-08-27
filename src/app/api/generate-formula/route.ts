import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert Excel and Google Sheets formula generator. 
          Generate ONLY the formula starting with = and a brief explanation.
          Keep formulas simple and practical.`
        },
        {
          role: "user",
          content: `Generate an Excel/Google Sheets formula for: ${prompt}`
        }
      ],
      max_tokens: 200,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Extract formula and explanation
    const lines = response.split('\n');
    const formula = lines.find(line => line.startsWith('=')) || lines[0];
    const explanation = lines.filter(line => !line.startsWith('=')).join(' ').trim() || 'Formula generated successfully.';

    return NextResponse.json({
      formula,
      explanation
    });

  } catch (error) {
    console.error('Error generating formula:', error);
    return NextResponse.json(
      { error: 'Failed to generate formula' },
      { status: 500 }
    );
  }
}