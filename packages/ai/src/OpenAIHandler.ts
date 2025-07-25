import OpenAI from 'openai';

export interface OpenAIHandlerOptions {
  apiKey: string;
}

export class OpenAIHandler {
  private openai: OpenAI;

  constructor(options: OpenAIHandlerOptions) {
    this.openai = new OpenAI({ apiKey: options.apiKey });
  }

  async complete(prompt: string, model: string = 'gpt-3.5-turbo') {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0]?.message?.content || '';
  }
} 