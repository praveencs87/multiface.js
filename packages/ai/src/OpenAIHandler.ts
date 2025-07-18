import { Configuration, OpenAIApi } from 'openai';

export interface OpenAIHandlerOptions {
  apiKey: string;
}

export class OpenAIHandler {
  private openai: OpenAIApi;

  constructor(options: OpenAIHandlerOptions) {
    const configuration = new Configuration({ apiKey: options.apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  async complete(prompt: string, model: string = 'gpt-3.5-turbo') {
    const response = await this.openai.createChatCompletion({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.data.choices[0]?.message?.content || '';
  }
} 