
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

  // Get deck builder modules
  const deckBuilderModules = modules.filter(m => m.isDeckBuilderModule)
    .sort((a, b) => {
      // Use the orderIndex property for sorting if available
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });

  console.log("Deck Builder Modules:", deckBuilderModules.map(m => ({ 
    id: m.id, 
    title: m.title, 
    slug: m.slug,
    videoCount: m.videos?.length || 0
  })));

  // Find introduction module (MVD Introduction)
  const introModule = deckBuilderModules.find(m => m.slug === "mvd-introduction");
  const introVideos = introModule ? modules.find(m => m.id === introModule.id)?.videos || [] : [];

  console.log("Introduction Module:", introModule?.slug, "with", introVideos.length, "videos");

  // Team module (Slide 1)
  const teamModule = deckBuilderModules.find(m => m.slug === "the-team");
  const teamVideos = teamModule ? modules.find(m => m.id === teamModule.id)?.videos || [] : [];
  
  console.log("Team Module:", teamModule?.slug, "with", teamVideos.length, "videos");

  // Proposition module (Slides 2 & 3)
  const propositionModule = deckBuilderModules.find(m => m.slug === "mvd-proposition");
  const propositionVideos = propositionModule ? modules.find(m => m.id === propositionModule.id)?.videos || [] : [];
  
  console.log("Proposition Module:", propositionModule?.slug, "with", propositionVideos.length, "videos");

  // Market module (Slides 4 & 5)
  const marketModule = deckBuilderModules.find(m => m.slug === "mvd-market");
  const marketVideos = marketModule ? modules.find(m => m.id === marketModule.id)?.videos || [] : [];
  
  console.log("Market Module:", marketModule?.slug, "with", marketVideos.length, "videos");

  // Fundraising module
  const fundraisingModule = deckBuilderModules.find(m => m.slug === "fundraising-101");
  const fundraisingVideos = fundraisingModule ? modules.find(m => m.id === fundraisingModule.id)?.videos || [] : [];
  
  console.log("Fundraising Module:", fundraisingModule?.slug, "with", fundraisingVideos.length, "videos");

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
        videos={introVideos}
        moduleId={introModule?.id}
      />

      <DeckBuilderSection
        title="Slide 1"
        subtitle="The Team"
        description="When pitching your startup, you will be evaluated heavily on team. So give it some thought! What will be your role in the team as founder? How do you build a healthy team?"
        videos={teamVideos}
        slideNumbers="1"
        moduleId={teamModule?.id}
      />

      <DeckBuilderSection
        title="Slides 2 & 3"
        subtitle="Proposition"
        description="First things first: what do you do? This question is not as straightforward as you may think and it's crucial to get right, especially as a scientist founder. It means translating the functional proposition into a value proposition."
        videos={propositionVideos}
        slideNumbers="2 & 3"
        moduleId={propositionModule?.id}
      />

      <DeckBuilderSection
        title="Slides 4 & 5"
        subtitle="Market"
        description="Ok, so if you've got interest in the team, and people get what you're trying to do, you need to proof that you've got a market. This is a vital piece of the puzzle."
        videos={marketVideos}
        slideNumbers="4 & 5"
        moduleId={marketModule?.id}
      />

      <DeckBuilderSection
        title="Fundraising 101"
        subtitle="How to secure the right investors"
        description="Starting to fundraise can be overwhelming, especially if you're not prepared for the different types of investors out there. A quick masterclass from Ale."
        videos={fundraisingVideos}
        moduleId={fundraisingModule?.id}
      />
    </div>
  );
};

export default BuildYourDeckPage;
