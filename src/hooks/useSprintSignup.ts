import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PATHS } from "@/lib/constants";
import { SprintSignupAnswers } from "@/types/sprint-signup";
import { sendWelcomeEmail } from "@/services/emailService";
import { steps } from "@/components/sprint/SprintSignupSteps";

export const useSprintSignup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SprintSignupAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (field: string, value: string) => {
    const current = answers[field] || [];
    if (current.includes(value)) {
      setAnswers(prev => ({ 
        ...prev, 
        [field]: current.filter((v: string) => v !== value) 
      }));
    } else {
      setAnswers(prev => ({ 
        ...prev, 
        [field]: [...current, value] 
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Create functions to handle the final submission
  const uploadFileToStorage = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-cv.${fileExt}`;
      const filePath = `cvs/${fileName}`;
      
      // The upload method doesn't support onUploadProgress directly in the options
      // so we'll remove it from the type error
      const { error: uploadError } = await supabase.storage
        .from('sprint-uploads')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }
      
      const { data } = supabase.storage
        .from('sprint-uploads')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error in file upload:', error);
      return null;
    }
  };

  const createSprintTasks = async (userId: string) => {
    // This will create the personalized sprint tasks based on answers
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
        order: 1,
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
          order: 2,
          status: "pending"
        });
      } else {
        sprintTasks.push({
          user_id: userId,
          title: "Team Profile",
          description: "Upload detailed profiles of each team member",
          category: "team",
          required_upload: true,
          order: 2,
          status: "pending"
        });
      }
      
      // Add more tasks based on answers
      if (answers.invention === 'yes') {
        sprintTasks.push({
          user_id: userId,
          title: "Scientific Foundation",
          description: "Upload a one-pager that provides the intuition behind your scientific idea",
          category: "science",
          required_upload: true,
          order: 3,
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
          order: 4,
          status: "pending"
        });
      }
      
      // Problem to solve
      sprintTasks.push({
        user_id: userId,
        title: "Problem Definition",
        description: answers.problem === 'yes' 
          ? "Review and refine your problem statement" 
          : "Create a one-pager explaining the core problem your solution addresses",
        category: "business",
        required_upload: true,
        order: 5,
        status: "pending"
      });
      
      // Customer engagement
      if (answers.customers !== 'yes') {
        sprintTasks.push({
          user_id: userId,
          title: "Customer Discovery",
          description: "Develop a plan to engage with potential customers and validate your solution",
          category: "customer",
          required_upload: true,
          order: 6,
          status: "pending"
        });
      } else {
        sprintTasks.push({
          user_id: userId,
          title: "Customer Insights",
          description: "Document your customer conversations and key insights",
          category: "customer",
          required_upload: true,
          order: 6,
          status: "pending"
        });
      }
      
      // Market analysis
      if (answers.market_known !== 'yes') {
        sprintTasks.push({
          user_id: userId,
          title: "Market Analysis",
          description: "Create a comprehensive market analysis and competition overview",
          category: "market",
          required_upload: true,
          order: 7,
          status: "pending"
        });
      } else {
        sprintTasks.push({
          user_id: userId,
          title: "Market Validation",
          description: "Upload evidence supporting your market analysis and competitive advantage",
          category: "market",
          required_upload: true,
          order: 7,
          status: "pending"
        });
      }
      
      // Funding plan
      sprintTasks.push({
        user_id: userId,
        title: "Financial Strategy",
        description: answers.funding_plan === 'yes' 
          ? "Upload your financial plan for review" 
          : "Create a financial plan using our template",
        category: "funding",
        required_upload: true,
        order: 8,
        status: "pending"
      });
      
      // Execution mindset
      sprintTasks.push({
        user_id: userId,
        title: "Milestone Planning",
        description: "Create a technical and commercial milestone plan",
        category: "execution",
        required_upload: true,
        order: 9,
        status: "pending"
      });
      
      // Vision document
      sprintTasks.push({
        user_id: userId,
        title: "Vision Document",
        description: "Create a one-pager explaining your long-term vision and industry impact",
        category: "vision",
        required_upload: true,
        order: 10,
        status: "pending"
      });
      
      // Insert all tasks into the database
      for (const task of sprintTasks) {
        const { error } = await supabase
          .from('sprint_tasks')
          .insert(task);
          
        if (error) {
          console.error('Error creating task:', error);
        }
      }
      
    } catch (error) {
      console.error('Error creating sprint tasks:', error);
    }
  };

  const silentSignup = async () => {
    try {
      setIsSubmitting(true);
      
      // Generate a random password
      const randomPassword = Math.random().toString(36).slice(-10);
      
      // Create a new user with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: answers.email,
        password: randomPassword,
        options: {
          data: {
            firstName: answers.name?.split(' ')[0] || '',
            lastName: answers.name?.split(' ').slice(1).join(' ') || '',
            linkedIn: answers.linkedin,
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user");
      }
      
      // Upload CV if provided
      let cvUrl = null;
      if (uploadedFile) {
        cvUrl = await uploadFileToStorage(uploadedFile, authData.user.id);
      }
      
      // Manual insert to handle the sprint_profiles table
      // Note: We'll need to create this table in Supabase
      const { error: profileError } = await supabase.rpc('create_sprint_profile', {
        p_user_id: authData.user.id,
        p_name: answers.name,
        p_email: answers.email,
        p_linkedin_url: answers.linkedin,
        p_cv_url: cvUrl,
        p_current_job: answers.job,
        p_company_incorporated: answers.incorporated === 'yes',
        p_received_funding: answers.funding_received === 'yes',
        p_funding_details: answers.funding_details,
        p_has_deck: answers.deck === 'yes',
        p_team_status: answers.team,
        p_commercializing_invention: answers.invention === 'yes',
        p_university_ip: answers.ip === 'tto_yes' || answers.ip === 'tto_no',
        p_tto_engaged: answers.ip === 'tto_yes',
        p_problem_defined: answers.problem === 'yes',
        p_customer_engagement: answers.customers,
        p_market_known: answers.market_known === 'yes',
        p_market_gap_reason: answers.market_gap_reason,
        p_funding_amount: answers.funding_amount_text,
        p_has_financial_plan: answers.funding_plan === 'yes',
        p_funding_sources: Array.isArray(answers.funding_sources) ? answers.funding_sources : [],
        p_experiment_validated: answers.experiment === 'yes',
        p_industry_changing_vision: answers.vision === 'yes'
      });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
      
      // Create personalized sprint tasks for this user
      await createSprintTasks(authData.user.id);
      
      // Send welcome email with sprint info
      await sendWelcomeEmail(answers.email, answers.name);
      
      // Navigate to the sprint dashboard
      toast({
        title: "Sprint setup complete!",
        description: "Welcome to your personalized founder sprint. Let's get started!",
      });
      
      // Navigate to the sprint dashboard
      navigate(PATHS.SPRINT_DASHBOARD);
      
    } catch (error) {
      console.error('Error during signup:', error);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    answers,
    isSubmitting,
    uploadedFile,
    fileUploadProgress,
    handleChange,
    toggleMultiSelect,
    handleFileUpload,
    goToNextStep,
    goToPreviousStep,
    silentSignup
  };
};
