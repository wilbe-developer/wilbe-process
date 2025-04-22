
import { supabase } from "@/integrations/supabase/client";
import { SprintSignupAnswers } from "@/types/sprint-signup";

export const useSprintTasksManager = () => {
  const createSprintTasks = async (userId: string, answers: SprintSignupAnswers) => {
    try {
      const sprintTasks = [];
      
      // Create deck task - always required
      sprintTasks.push({
        user_id: userId,
        title: "Create Your Pitch Deck",
        description: answers.deck === 'yes' 
          ? "Review and improve your existing pitch deck" 
          : "Create a pitch deck following our template",
        category: "storytelling",
        required_upload: true,
        order_index: 1,
        status: "pending"
      });
      
      // Team-related task
      if (answers.team === 'solo') {
        sprintTasks.push({
          user_id: userId,
          title: "Develop Team Building Plan",
          description: "Create a hiring plan to address the skills gap in your venture",
          category: "team",
          required_upload: true,
          order_index: 2,
          status: "pending"
        });
      } else {
        sprintTasks.push({
          user_id: userId,
          title: "Team Profile",
          description: "Upload detailed profiles of each team member",
          category: "team",
          required_upload: true,
          order_index: 2,
          status: "pending"
        });
      }
      
      // Add invention-related task
      if (answers.invention === 'yes') {
        sprintTasks.push({
          user_id: userId,
          title: "Scientific Foundation",
          description: "Upload a one-pager that provides the intuition behind your scientific idea",
          category: "science",
          required_upload: true,
          order_index: 3,
          status: "pending"
        });
      }
      
      // IP task
      if (answers.ip === 'tto_yes' || answers.ip === 'tto_no') {
        sprintTasks.push({
          user_id: userId,
          title: "IP Strategy",
          description: "Document your IP strategy and TTO engagement plan",
          category: "ip",
          required_upload: true,
          order_index: 4,
          status: "pending"
        });
      }
      
      // Add rest of standard tasks
      sprintTasks.push(
        {
          user_id: userId,
          title: "Problem Definition",
          description: answers.problem === 'yes' 
            ? "Review and refine your problem statement" 
            : "Create a one-pager explaining the core problem your solution addresses",
          category: "business",
          required_upload: true,
          order_index: 5,
          status: "pending"
        },
        {
          user_id: userId,
          title: answers.customers === 'yes' ? "Customer Insights" : "Customer Discovery",
          description: answers.customers === 'yes'
            ? "Document your customer conversations and key insights"
            : "Develop a plan to engage with potential customers and validate your solution",
          category: "customer",
          required_upload: true,
          order_index: 6,
          status: "pending"
        },
        {
          user_id: userId,
          title: answers.market_known === 'yes' ? "Market Validation" : "Market Analysis",
          description: answers.market_known === 'yes'
            ? "Upload evidence supporting your market analysis and competitive advantage"
            : "Create a comprehensive market analysis and competition overview",
          category: "market",
          required_upload: true,
          order_index: 7,
          status: "pending"
        },
        {
          user_id: userId,
          title: "Financial Strategy",
          description: answers.funding_plan === 'yes'
            ? "Upload your financial plan for review"
            : "Create a financial plan using our template",
          category: "funding",
          required_upload: true,
          order_index: 8,
          status: "pending"
        },
        {
          user_id: userId,
          title: "Milestone Planning",
          description: "Create a technical and commercial milestone plan",
          category: "execution",
          required_upload: true,
          order_index: 9,
          status: "pending"
        },
        {
          user_id: userId,
          title: "Vision Document",
          description: "Create a one-pager explaining your long-term vision and industry impact",
          category: "vision",
          required_upload: true,
          order_index: 10,
          status: "pending"
        }
      );
      
      console.log("About to check if tasks exist for user:", userId);
      
      // Check if tasks already exist for this user
      const { data: existingTasks, error: queryError } = await supabase
        .from('sprint_tasks')
        .select('id')
        .eq('user_id', userId);
      
      if (queryError) {
        console.error('Error querying existing tasks:', queryError);
        return;
      }
        
      console.log("Existing tasks:", existingTasks);
      
      // If tasks already exist, delete them before creating new ones
      if (existingTasks && existingTasks.length > 0) {
        console.log("Deleting existing tasks...");
        const { error: deleteError } = await supabase
          .from('sprint_tasks')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) {
          console.error('Error deleting existing tasks:', deleteError);
        }
      }
      
      console.log("Creating new tasks...");
      
      // Insert all tasks into the database
      for (const task of sprintTasks) {
        const { error } = await supabase
          .from('sprint_tasks')
          .insert(task);
          
        if (error) {
          console.error('Error creating task:', error);
        }
      }
      
      console.log("Created", sprintTasks.length, "tasks for user:", userId);
      
    } catch (error) {
      console.error('Error creating sprint tasks:', error);
      throw error;
    }
  };

  return { createSprintTasks };
};
