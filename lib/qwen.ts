const BASE_URL = (
  process.env.DASHSCOPE_BASE_URL ?? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
).replace(/\/$/, '');
const MODEL = process.env.QWEN_MODEL ?? 'qwen-max';

interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function chat(messages: QwenMessage[]): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY is not set');

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Qwen API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

export interface PostSummaryInput {
  topicTitle: string;
  posts: Array<{ author: string; text?: string | null; hasImage: boolean }>;
}

export async function summarisePosts(input: PostSummaryInput): Promise<string> {
  const postLines = input.posts
    .map((p) => {
      const img = p.hasImage ? '[image]' : '';
      return `- ${p.author}: ${[p.text, img].filter(Boolean).join(' ')}`;
    })
    .join('\n');

  const prompt = `You are summarising a collaborative topic thread.

Topic: "${input.topicTitle}"

Posts:
${postLines}

Write a concise summary (3-5 bullet points) of the key themes, moments, and sentiments shared in this topic. Be warm and conversational.`;

  return chat([{ role: 'user', content: prompt }]);
}

export async function generateSocialPost(input: PostSummaryInput, platform: 'wechat' | 'xhs'): Promise<string> {
  const postLines = input.posts
    .map((p) => {
      const img = p.hasImage ? '[image]' : '';
      return `- ${p.author}: ${[p.text, img].filter(Boolean).join(' ')}`;
    })
    .join('\n');

  const platformGuide =
    platform === 'xhs'
      ? 'Xiaohongshu (Little Red Book) style: use plenty of emojis, line breaks, 3-5 relevant hashtags at the end, warm and personal tone, around 150-200 characters.'
      : 'WeChat Moments style: casual, personal, warm, 1-3 sentences, minimal hashtags, no more than 100 characters.';

  const prompt = `You are a social media copywriter. Based on the following topic thread, write a ${platformGuide}

Topic: "${input.topicTitle}"

Posts:
${postLines}

Write the post in Chinese if any posts are in Chinese, otherwise in English. Output ONLY the post text, nothing else.`;

  return chat([{ role: 'user', content: prompt }]);
}
