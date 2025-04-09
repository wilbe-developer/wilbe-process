
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { PATHS } from "@/lib/constants";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Welcome to Wilbe{user ? `, ${user.firstName}` : ""}</h1>
        <p className="text-lg mb-6">
          Your professional network for scientists exploring alternative careers in innovation and entrepreneurship.
        </p>
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
      
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recommended Videos</h2>
          <Link to={PATHS.KNOWLEDGE_CENTER} className="text-brand-pink hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <Link to={`${PATHS.VIDEO}/1`}>
              <div className="relative">
                <img 
                  src="/lovable-uploads/e63aae6f-8753-4509-aff4-323cac4af598.png" 
                  alt="Video thumbnail"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                  27:51
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">Member Stories</div>
                <h3 className="font-medium text-base mb-1 line-clamp-2">
                  Conversations at the Crossroads: Navigating Technological and Societal Forces
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  with Albert Wenger
                </p>
                <div className="text-sm text-brand-pink">View Class</div>
              </div>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <Link to={`${PATHS.VIDEO}/2`}>
              <div className="relative">
                <img 
                  src="/lovable-uploads/86efc3b2-8104-4252-9196-0b3226d6247a.png" 
                  alt="Video thumbnail"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                  47:00
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">Member Stories</div>
                <h3 className="font-medium text-base mb-1 line-clamp-2">
                  The Entrepreneurial Mindset: An Insider's Guide
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  with Chris O'Neill
                </p>
                <div className="text-sm text-brand-pink">View Class</div>
              </div>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <Link to={`${PATHS.VIDEO}/3`}>
              <div className="relative">
                <img 
                  src="/lovable-uploads/210c5ab3-0cd0-4587-a643-df2b47e5ab1e.png" 
                  alt="Video thumbnail"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                  35:51
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">Member Stories</div>
                <h3 className="font-medium text-base mb-1 line-clamp-2">
                  Building the Future of Science: The Arcadia Way
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  with Prachee Avasthi
                </p>
                <div className="text-sm text-brand-pink">View Class</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
