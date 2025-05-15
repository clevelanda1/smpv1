import { StoryInput } from '../types';
import { formatStoryText } from '../utils/storyFormatter';

const WEBHOOK_URL = 'https://primary-production-ebd1.up.railway.app/webhook/2187e110-48c7-4a82-9e8f-1caa28cf004c';

export const generateStory = async (storyInput: StoryInput): Promise<string> => {
  try {
    const requestBody = {
      ...storyInput,
      developmentalStage: storyInput.developmentalStage || 'preschool', // Ensure default value if not set
      // Transform character customizations into a format the API expects
      characters: storyInput.characters.map(charId => {
        const customization = storyInput.characterCustomizations?.find(c => c.id === charId);
        if (customization) {
          return {
            id: charId,
            name: customization.name,
            description: customization.description,
            traits: customization.traits,
            icon: customization.icon
          };
        }
        return charId;
      })
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const text = await response.text();
    
    if (!text) {
      throw new Error('Received empty response from server');
    }

    try {
      const data = JSON.parse(text);
      return formatStoryText(data);
    } catch (parseError) {
      if (text.trim()) {
        return text;
      }
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('Error generating story:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate story');
  }
};