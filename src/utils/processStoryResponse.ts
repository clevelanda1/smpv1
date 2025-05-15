/**
 * Utility function to clean and process the webhook response
 * This will fix common formatting issues in the JSON response
 */
export function processStoryResponse(rawResponse: any) {
  try {
    // If the response is already a JavaScript object, return it
    if (typeof rawResponse === 'object' && rawResponse !== null) {
      return rawResponse;
    }
    
    // Step 1: Remove any code block markers
    let cleanedResponse = rawResponse.replace(/```json|```/g, '');
    
    // Step 2: Remove any tab character at the end
    cleanedResponse = cleanedResponse.replace(/\t+$/g, '');
    
    // Step 3: Handle escaped newlines - replace with actual newlines
    cleanedResponse = cleanedResponse.replace(/\\n/g, '\n');
    
    // Step 4: Remove any double backslashes
    cleanedResponse = cleanedResponse.replace(/\\\\/g, '\\');
    
    // Step 5: Try to parse the JSON
    const parsedJSON = JSON.parse(cleanedResponse);
    
    // Step 6: Process each chapter's content to ensure proper formatting
    if (parsedJSON.chapters && Array.isArray(parsedJSON.chapters)) {
      parsedJSON.chapters.forEach(chapter => {
        if (chapter.content) {
          // Clean up any remaining escape characters in content
          chapter.content = chapter.content
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
        }
      });
    }
    
    return parsedJSON;
  } catch (error) {
    console.error('Error processing story response:', error);
    
    // If JSON parsing fails, try a more aggressive approach
    try {
      // Look for the basic structure and extract it
      const titleMatch = rawResponse.match(/"title":\s*"([^"]*)"/);
      const readingTimeMatch = rawResponse.match(/"readingTime":\s*"([^"]*)"/);
      const chaptersMatch = rawResponse.match(/"chapters":\s*(\[[\s\S]*\])/);
      
      if (titleMatch && readingTimeMatch && chaptersMatch) {
        // Manually construct a valid JSON object
        const manualJSON = {
          title: titleMatch[1],
          readingTime: readingTimeMatch[1],
          chapters: JSON.parse(chaptersMatch[1].replace(/\\n/g, '\n'))
        };
        
        return manualJSON;
      }
    } catch (secondError) {
      console.error('Failed backup parsing attempt:', secondError);
    }
    
    // If all else fails, return null
    return null;
  }
}