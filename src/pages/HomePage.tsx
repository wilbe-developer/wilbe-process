import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import VideoCarousel from "@/components/VideoCarousel";
import MemberPreview from "@/components/MemberPreview";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-4">Welcome to Wilbe{user ? `, ${user.firstName}` : ""}</h1>
        <p className="text-lg mb-6">
          Your professional network for scientists exploring alternative careers in innovation and entrepreneurship.
        </p>
      </section>
      
      <section className="mb-12 allow-overflow-x">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Latest Videos</h2>
          <Link to={PATHS.KNOWLEDGE_CENTER} className="text-brand-pink hover:underline">
            View All
          </Link>
        </div>
        
        <VideoCarousel />
      </section>
      
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Knowledge Center</h2>
            <p className="text-gray-600 mb-4">
              Access expert insights and stories from scientists who have successfully navigated career transitions.
            </p>
            <Button asChild>
              <Link to={PATHS.KNOWLEDGE_CENTER}>
                Explore Videos
              </Link>
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Member Directory</h2>
            <p className="text-gray-600 mb-4">
              Connect with like-minded scientists and entrepreneurs from around the world.
            </p>
            <Button asChild>
              <Link to={PATHS.MEMBER_DIRECTORY}>
                Browse Members
              </Link>
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Upcoming Events</h2>
            <p className="text-gray-600 mb-4">
              Join virtual and in-person events focused on science entrepreneurship and innovation.
            </p>
            <Button asChild>
              <Link to={PATHS.EVENTS}>
                View Calendar
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Community Members</h2>
          <Link to={PATHS.MEMBER_DIRECTORY} className="text-brand-pink hover:underline">
            View All
          </Link>
        </div>
        
        <MemberPreview />
      </section>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">⚡ Ready to accelerate your science startup?</h2>
        <p className="mb-4">Join our Founder Sprint program and get personalized guidance to turn your scientific breakthrough into a successful venture.</p>
        <Link to={PATHS.SPRINT_SIGNUP}>
          <Button>Start Your Founder Sprint</Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
