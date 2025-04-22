import React, { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui";
import SprintProfileShowOrAsk from "../SprintProfileShowOrAsk";

interface TaskLogicProps {
  taskId: string;
}

const SprintTaskLogic: React.FC<TaskLogicProps> = ({ taskId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [question, setQuestion] = useState<string>("");
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isShowingProfile = searchParams.get("showProfile") === "true";
  const isAskingQuestion = searchParams.get("askQuestion") === "true";

  const showProfile = useCallback(() => {
    searchParams.set("showProfile", "true");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const askQuestion = useCallback(() => {
    searchParams.set("askQuestion", "true");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const closeProfile = useCallback(() => {
    searchParams.delete("showProfile");
    searchParams.delete("askQuestion");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const handleQuestionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQuestion(e.target.value);
  };

  const submitQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Question cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/sprint-tasks/${taskId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Question submitted successfully!",
      });
      setQuestion("");
      closeProfile();
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        title: "Error",
        description: "Failed to submit question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!isShowingProfile && !isAskingQuestion && (
        <SprintProfileShowOrAsk onShow={showProfile} onAsk={askQuestion} />
      )}

      {isShowingProfile && (
        <div className="text-center">
          <img
            src={user.avatar}
            alt="User Avatar"
            className="rounded-full w-32 h-32 mx-auto mb-4"
          />
          <p>
            {user.firstName} {user.lastName}
          </p>
          <p>{user.email}</p>
          <Button onClick={closeProfile}>Close Profile</Button>
        </div>
      )}

      {isAskingQuestion && (
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={handleQuestionChange}
          />
          <Button onClick={submitQuestion} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Question"}
          </Button>
          <Button variant="secondary" onClick={closeProfile}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default SprintTaskLogic;
