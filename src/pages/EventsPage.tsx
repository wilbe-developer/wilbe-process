
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar } from "lucide-react";

const EventsPage = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Science Meetups & Innovation Events</h1>
        <p className="text-gray-600 max-w-2xl">
          Join our vibrant community for in-person events across research hubs, connecting with fellow scientists and innovators.
        </p>
      </div>

      <div className="rounded-lg border shadow-sm bg-white overflow-hidden">
        <div className="relative w-full h-[600px] md:h-[800px]">
          <iframe
            src="https://lu.ma/embed/calendar/cal-DLkKXePQ5aA3GHL/events?light=true"
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
