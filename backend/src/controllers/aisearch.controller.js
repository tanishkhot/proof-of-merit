import { parseSkills } from '../services/groq.service.js';

export const parse = async (req, res) => {
  console.log('AI search request received. Body:', req.body);
  const { input } = req.body;

  if (!input) {
    console.log('Request body is missing "input" field.');
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const skills = await parseSkills(input);
    res.status(200).json(skills);
  } catch (error) {
    console.error('Error calling parseSkills service:', error);
    res.status(500).json({ error: 'Failed to parse input', details: error.message });
  }
};
