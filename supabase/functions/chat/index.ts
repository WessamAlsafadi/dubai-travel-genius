
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  language: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language }: ChatRequest = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    // Create system message based on language
    const systemMessage = {
      role: 'system' as const,
      content: `You are Dwntwna AI Concierge, a knowledgeable and friendly travel assistant specializing in Downtown Dubai and the UAE. You help tourists and visitors with:

- Destination recommendations in Downtown Dubai (Burj Khalifa, Dubai Mall, Dubai Fountain, etc.)
- Budget planning and cost estimates
- Restaurant and dining suggestions
- Transportation options (Metro, taxi, car rentals)
- Cultural insights and local customs
- Weather information
- Shopping recommendations
- Event and activity suggestions
- Accommodation advice

Always respond in ${language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : language === 'hi' ? 'Hindi' : language === 'ur' ? 'Urdu' : language === 'zh' ? 'Chinese' : language === 'ru' ? 'Russian' : 'English'}.

Be helpful, enthusiastic, and provide practical, actionable advice. Keep responses conversational and engaging.`
    };

    // Filter messages to only include role and content, remove timestamp and other properties
    const filteredMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    // Prepare messages for Groq
    const groqMessages = [
      systemMessage,
      ...filteredMessages
    ];

    console.log('Sending request to Groq with messages:', groqMessages);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Groq response:', data);

    const reply = data.choices?.[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again.';

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ 
        reply: 'I\'m sorry, I\'m experiencing technical difficulties. Please try again later.',
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
