import { processStoryResponse } from './processStoryResponse';

export const formatStoryText = (rawStory: string | object): string => {
  try {
    const processedResponse = processStoryResponse(rawStory);
    
    if (!processedResponse) {
      // If processing fails, handle the raw story based on its type
      if (typeof rawStory === 'string') {
        return rawStory;
      }
      return JSON.stringify(rawStory, null, 2);
    }

    // If we have a structured story with chapters
    if (processedResponse.chapters && Array.isArray(processedResponse.chapters)) {
      return processedResponse.chapters
        .map((chapter, index) => {
          const chapterNum = chapter.chapterNumber || (index + 1);
          const title = chapter.chapterTitle || `Chapter ${chapterNum}`;
          return `${title}\n\n${chapter.content}`;
        })
        .join('\n\n');
    }

    // If we have a title/story structure
    if (processedResponse.title && processedResponse.story) {
      return `${processedResponse.title}\n\n${processedResponse.story}`;
    }

    // If we just have a string
    if (typeof processedResponse === 'string') {
      return processedResponse;
    }

    // Fallback to stringifying the response
    return JSON.stringify(processedResponse, null, 2);
  } catch (error) {
    console.error('Error formatting story:', error);
    // Return the original content if formatting fails
    return typeof rawStory === 'string' ? rawStory : JSON.stringify(rawStory, null, 2);
  }
};