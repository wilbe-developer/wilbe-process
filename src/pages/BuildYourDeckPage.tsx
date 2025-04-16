
import { useEffect } from "react";
import { useVideos } from "@/hooks/useVideos";
import DeckBuilderSection from "@/components/deck-builder/DeckBuilderSection";

const BuildYourDeckPage = () => {
  const { videos, loading, modules } = useVideos();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get regular modules
  const regularModules = modules.filter(m => !m.isDeckBuilderModule);

  // Get deck builder modules
  const deckBuilderModules = modules.filter(m => m.isDeckBuilderModule)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  // Sort videos by created_at if available
  const sortedVideos = [...videos].sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return (a.order || 0) - (b.order || 0);
  });

  // Find introduction module (MVD Introduction)
  const introModule = deckBuilderModules.find(m => m.title === "MVD Introduction");
  const introVideos = introModule ? sortedVideos.filter(v => v.moduleId === introModule.id) : [];

  // If no intro videos in deck builder module, find a fallback video
  const fallbackIntroVideo = !introVideos.length ? sortedVideos.find(v => 
    v.title.toLowerCase().includes("science to product") || 
    v.title.toLowerCase().includes("minimum viable deck")
  ) : null;

  // Team module (Slide 1)
  const teamModule = deckBuilderModules.find(m => m.title === "The Team");
  let teamVideos = teamModule ? sortedVideos.filter(v => v.moduleId === teamModule.id) : [];
  
  // If no videos in the team deck builder module, find fallback videos
  if (!teamVideos.length) {
    teamVideos = sortedVideos.filter(v => 
      v.title.toLowerCase().includes("two ways of doing ventures") || 
      v.title.toLowerCase().includes("company culture and team building")
    );
  }

  // Proposition module (Slides 2 & 3)
  const propositionModule = deckBuilderModules.find(m => m.title === "Proposition");
  let propositionVideos = propositionModule ? sortedVideos.filter(v => v.moduleId === propositionModule.id) : [];
  
  // If no proposition videos in deck builder module, find videos in regular proposition module
  if (!propositionVideos.length) {
    const regularPropositionModule = regularModules.find(m => m.title.toLowerCase() === "proposition");
    if (regularPropositionModule) {
      propositionVideos = sortedVideos.filter(v => v.moduleId === regularPropositionModule.id);
    }
  }

  // Market module (Slides 4 & 5)
  const marketModule = deckBuilderModules.find(m => m.title === "Market");
  let marketVideos = marketModule ? sortedVideos.filter(v => v.moduleId === marketModule.id) : [];
  
  // If no market videos in deck builder module, find videos in regular market module
  if (!marketVideos.length) {
    const regularMarketModule = regularModules.find(m => 
      m.title.toLowerCase() === "your market" || 
      m.slug.toLowerCase() === "your-market"
    );
    if (regularMarketModule) {
      marketVideos = sortedVideos.filter(v => v.moduleId === regularMarketModule.id);
    }
  }

  // Fundraising module
  const fundraisingModule = deckBuilderModules.find(m => m.title === "Fundraising 101");
  let fundraisingVideos = fundraisingModule ? sortedVideos.filter(v => v.moduleId === fundraisingModule.id) : [];
  
  // If no fundraising videos in deck builder module, find videos in regular fundraising module
  if (!fundraisingVideos.length) {
    const regularFundraisingModule = regularModules.find(m => 
      m.title.toLowerCase() === "fundraising 101" || 
      m.slug.toLowerCase() === "fundraising-101"
    );
    if (regularFundraisingModule) {
      fundraisingVideos = sortedVideos.filter(v => v.moduleId === regularFundraisingModule.id);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-gray-100 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Building the Minimum Viable Deck (MVD)
        </h1>
        <p className="text-gray-600">
          Our Wilbe instructors, experienced in building science companies, are sharing practical insights that
          will guide you in building a pitch deck for your startup idea.
        </p>
      </div>

      <DeckBuilderSection
        title="Introduction"
        subtitle="The MVD"
        description="Get an overview of what we mean with a minimum viable deck."
        videos={introVideos.length ? introVideos : (fallbackIntroVideo ? [fallbackIntroVideo] : [])}
      />

      <DeckBuilderSection
        title="Slide 1"
        subtitle="The Team"
        description="When pitching your startup, you will be evaluated heavily on team. So give it some thought! What will be your role in the team as founder? How do you build a healthy team?"
        videos={teamVideos}
        slideNumbers="1"
      />

      <DeckBuilderSection
        title="Slides 2 & 3"
        subtitle="Proposition"
        description="First things first: what do you do? This question is not as straightforward as you may think and it's crucial to get right, especially as a scientist founder. It means translating the functional proposition into a value proposition."
        videos={propositionVideos}
        slideNumbers="2 & 3"
      />

      <DeckBuilderSection
        title="Slides 4 & 5"
        subtitle="Market"
        description="Ok, so if you've got interest in the team, and people get what you're trying to do, you need to proof that you've got a market. This is a vital piece of the puzzle."
        videos={marketVideos}
        slideNumbers="4 & 5"
      />

      <DeckBuilderSection
        title="Fundraising 101"
        subtitle="How to secure the right investors"
        description="Starting to fundraise can be overwhelming, especially if you're not prepared for the different types of investors out there. A quick masterclass from Ale."
        videos={fundraisingVideos}
      />
    </div>
  );
};

export default BuildYourDeckPage;
