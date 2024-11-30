const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are an AI assistant with blockchain capabilities on the Base network. You can help users with:
- Analyzing wallet transactions and balances
- Providing insights about Base network tokens and protocols
- Explaining blockchain concepts
- Suggesting optimal DeFi strategies
- Monitoring smart contract interactions

Current context: Connected to Base network (Chain ID: 8453)`;

export async function generateResponse(
  prompt: string,
  model: string = 'openai/gpt-4',
  walletAddress?: string
) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: walletAddress 
          ? `[Context: Connected wallet ${walletAddress} on Base network]\n${prompt}`
          : prompt
      }
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Agent Launchpad'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 0.9,
        frequency_penalty: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}