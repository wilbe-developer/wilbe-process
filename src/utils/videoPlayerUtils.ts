
// Helper function to get YouTube embed ID from a URL or ID
export const getYoutubeEmbedId = (youtubeIdOrUrl: string) => {
  if (!youtubeIdOrUrl) return '';
  
  if (youtubeIdOrUrl.includes('youtube.com') || youtubeIdOrUrl.includes('youtu.be')) {
    try {
      const urlObj = new URL(youtubeIdOrUrl);
      if (youtubeIdOrUrl.includes('youtube.com/watch')) {
        return urlObj.searchParams.get('v') || '';
      } else if (youtubeIdOrUrl.includes('youtu.be/')) {
        return urlObj.pathname.split('/')[1] || '';
      }
    } catch (error) {
      console.error('Invalid YouTube URL:', youtubeIdOrUrl);
      return youtubeIdOrUrl;
    }
  }
  
  return youtubeIdOrUrl;
};

// Helper function to get module title based on context
export const getModuleTitle = (
  isDeckBuilderVideo: boolean,
  deckBuilderSlide: string | null,
  deckBuilderModuleId: string | undefined,
  moduleTitle: string | undefined,
  allModules: any[]
) => {
  if (isDeckBuilderVideo) {
    if (deckBuilderModuleId) {
      const deckBuilderModule = allModules.find(m => m.id === deckBuilderModuleId);
      if (deckBuilderModule) {
        return deckBuilderModule.title;
      }
    }
    
    if (deckBuilderSlide === "1") {
      return "The Team";
    } else if (deckBuilderSlide === "2 & 3") {
      return "Proposition";
    } else if (deckBuilderSlide === "4 & 5") {
      return "Market";
    } else if (moduleTitle) {
      return moduleTitle;
    } else {
      return 'Deck Builder';
    }
  } else if (moduleTitle) {
    return moduleTitle;
  } else {
    return 'Member Stories';
  }
};

// Get the deck builder template URL
export const DECK_BUILDER_TEMPLATE_URL = "https://www.canva.com/design/DAGIgXCPhJk/DCxXlmbcIlqQiUIOW-GWlw/view?utm_content=DAGIgXCPhJk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview";
