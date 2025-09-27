import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const parseSkills = async (input) => {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are an expert skill extraction AI. Your task is to analyze a given text and extract all mentioned skills and their corresponding proficiency levels.

        **Your output MUST follow these rules strictly:**

        1.  **Format:** Return a single, valid JSON array of objects.
        2.  **Object Structure:** Each object must contain exactly two keys: a "skill" (string) and a "level" (integer).
        3.  **Proficiency Scale:** The "level" must be an integer between 1 (beginner) and 5 (expert).
        4.  **No Extra Text:** Your entire response must be ONLY the raw JSON array. Do not include any explanations, introductory sentences, or markdown code fences like \`\`\`json.

        **Example:**

        User's Text:
        "I am an expert in React and have been using it for over 5 years. I've recently started learning Go and would say I'm a beginner. I am proficient with Node.js."

        Your Response:
        [
          {
            "skill": "React",
            "level": 5
          },
          {
            "skill": "Go",
            "level": 1
          },
          {
            "skill": "Node.js",
            "level": 4
          }
        ]`,
      },
      {
        role: 'user',
        content: `Extract the skills and proficiency levels from the following text:\n\n${input}`,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
    response_format: { type: 'json_object' },
    stop: null,
  });

  const result = chatCompletion.choices[0]?.message?.content;

  if (!result) {
    throw new Error('Failed to get a valid response from the model');
  }

  try {
    return JSON.parse(result);
  } catch (error) {
    console.error('Failed to parse JSON response from GROQ:', result);
    throw new Error('The model returned an invalid JSON format');
  }
};