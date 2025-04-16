
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Video } from "@/types";
import VideoRelatedList from './VideoRelatedList';

interface VideoMobileTabsProps {
  description: string;
  duration: string;
  moduleTitle: string;
  relatedVideos: Video[];
  isDeckBuilderVideo: boolean;
  deckBuilderSlide?: string | null;
}

const VideoMobileTabs = ({
  description,
  duration,
  moduleTitle,
  relatedVideos,
  isDeckBuilderVideo,
  deckBuilderSlide
}: VideoMobileTabsProps) => {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="questions">Questions</TabsTrigger>
        <TabsTrigger value="playlist">Playlist</TabsTrigger>
      </TabsList>
      
      <TabsContent value="about" className="py-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {moduleTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{description}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://creativecommons.org/images/deed/cc-logo.jpg"
                alt="Creative Commons License"
                className="h-4"
              />
              <span className="text-gray-500 text-xs">
                BY-NC-SA 4.0 LICENSE
              </span>
            </div>
            <div className="text-gray-500 text-sm">{duration}</div>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="questions" className="py-4">
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">Watch this video and complete the questions.</p>
            <div className="mt-6">
              <Button className="bg-pink-600 hover:bg-pink-700">
                Go to Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="playlist" className="py-4">
        <div className="space-y-4">
          <VideoRelatedList 
            relatedVideos={relatedVideos}
            isDeckBuilderVideo={isDeckBuilderVideo}
            deckBuilderSlide={deckBuilderSlide}
            title=""
            subtitle=""
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default VideoMobileTabs;
