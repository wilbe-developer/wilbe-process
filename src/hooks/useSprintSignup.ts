
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PATHS } from "@/lib/constants";
import { SprintSignupAnswers } from "@/types/sprint-signup";
import { sendWelcomeEmail } from "@/services/emailService";
import { steps } from "@/components/sprint/SprintSignupSteps";
import { useAuth } from "@/hooks/useAuth";

export const useSprintSignup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SprintSignupAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pre-fill data from authenticated user if available
  useEffect(() => {
    if (isAuthenticated && user) {
      setAnswers(prev => ({
        ...prev,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '',
        email: user.email || '',
        linkedin: user.linkedIn || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (field: string, value: string) => {
    const current = answers[field] || [];
    if (Array.isArray(current) && current.includes(value)) {
      setAnswers(prev => ({ 
        ...prev, 
        [field]: current.filter((v: string) => v !== value) 
      }));
    } else {
      setAnswers(prev => ({ 
        ...prev, 
        [field]: [...(Array.isArray(current) ? current : []), value] 
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const goToNextStep = () => {
    // Special handling for the funding_details step
    if (steps[currentStep].id === 'funding_received') {
      // If the user hasn't selected "yes" for funding received, we can skip the funding_details step
      const fundingReceived = answers['funding_received'];
      if (fundingReceived !== 'yes') {
        setCurrentStep(currentStep + 2); // Skip to the step after funding_details
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    // Special handling when going back from a step after funding_details
    if (currentStep > 1 && steps[currentStep - 1]?.id === 'funding_details') {
      // If the user hasn't selected "yes" for funding received, we should skip back over this step
      const fundingReceived = answers['funding_received'];
      if (fundingReceived !== 'yes') {
        setCurrentStep(currentStep - 2); // Skip back over funding_details
        return;
      }
    }
    
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
      
      // Add more tasks based on answers
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
      
      // Problem to solve
      sprintTasks.push({
        user_id: userId,
        title: "Problem Definition",
        description: answers.problem === 'yes' 
          ? "Review and refine your problem statement" 
          : "Create a one-pager explaining the core problem your solution addresses",
        category: "business",
        required_upload: true,
        order_index: 5,
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
          order_index: 6,
          status: "pending"
        });
      } else {
        sprintTasks.push({
          user_id: userId,
          title: "Customer Insights",
          description: "Document your customer conversations and key insights",
          category: "customer",
          required_upload: true,
          order_index: 6,
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
          order_index: 7,
          status: "pending"
        });
      } else {
        sprintTasks.push({
          user_id: userId,
          title: "Market Validation",
          description: "Upload evidence supporting your market analysis and competitive advantage",
          category: "market",
          required_upload: true,
          order_index: 7,
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
        order_index: 8,
        status: "pending"
      });
      
      // Execution mindset
      sprintTasks.push({
        user_id: userId,
        title: "Milestone Planning",
        description: "Create a technical and commercial milestone plan",
        category: "execution",
        required_upload: true,
        order_index: 9,
        status: "pending"
      });
      
      // Vision document
      sprintTasks.push({
        user_id: userId,
        title: "Vision Document",
        description: "Create a one-pager explaining your long-term vision and industry impact",
        category: "vision",
        required_upload: true,
        order_index: 10,
        status: "pending"
      });
      
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
    }
  };

  // Modified to directly sign in the user instead of sending a magic link
  const silentSignup = async () => {
    try {
      setIsSubmitting(true);
      
      // If the user is already authenticated, skip the signup
      if (isAuthenticated && user) {
        console.log("User already authenticated, updating sprint profile");
        await updateExistingUser();
        return;
      }
      
      console.log("Checking if user exists with email:", answers.email);
      
      // Check if user already exists by trying to sign in
      const { data: { user: existingUser }, error: userCheckError } = await supabase.auth.signInWithOtp({
        email: answers.email,
        options: {
          shouldCreateUser: false
        }
      });
      
      if (userCheckError && !userCheckError.message.includes("Email not confirmed")) {
        console.error("Error checking if user exists:", userCheckError);
        throw userCheckError;
      }
      
      console.log("User check result:", existingUser ? "Exists" : "Does not exist");
      
      // If user exists, handle the login differently - sign in directly with OTP
      if (existingUser || (userCheckError && userCheckError.message.includes("Email not confirmed"))) {
        console.log("User exists, handling direct sign in");
        
        // Generate a random password for auto-login
        const randomPassword = Math.random().toString(36).slice(-10);
        
        // Try to sign up the user to automatically log them in
        const { data: signInData, error: signInError } = await supabase.auth.signUp({
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
        
        if (signInError) {
          // If the user already exists, we got an error but it's expected
          console.log("Expected sign-up error since user exists:", signInError);
          
          // Continue with automatic sign-in with OTP (magic link)
          const { data: magicLinkData, error: magicLinkError } = await supabase.auth.signInWithOtp({
            email: answers.email,
            options: {
              emailRedirectTo: window.location.origin + PATHS.SPRINT_DASHBOARD,
            }
          });
          
          if (magicLinkError) {
            throw magicLinkError;
          }
          
          console.log("Sent magic link for existing user");
          
          toast({
            title: "Magic link sent",
            description: "Please check your email for a magic link to access your sprint dashboard.",
          });
          
          // Update their sprint data even though they will need to click the link
          await updateUserSprintData(null);
          
          return;
        }
        
        // If we somehow got past the expected error (unlikely), continue with the new user
        console.log("Unexpectedly created a new user during sign in:", signInData);
        await processNewUser(signInData.user);
      } else {
        // Create a new user with email and password
        console.log("Creating new user with signup");
        const randomPassword = Math.random().toString(36).slice(-10);
        
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
        
        console.log("Created new user:", authData.user.id);
        await processNewUser(authData.user);
      }
      
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
  
  // Helper to process a newly created user
  const processNewUser = async (user: any) => {
    try {
      // Update user sprint data
      await updateUserSprintData(user.id);
      
      // Send welcome email with sprint info
      await sendWelcomeEmail(answers.email, answers.name || 'Founder');
      
      toast({
        title: "Sprint setup complete!",
        description: "Welcome to your personalized founder sprint. Let's get started!",
      });
      
      // Navigate to the sprint dashboard
      navigate(PATHS.SPRINT_DASHBOARD);
    } catch (error) {
      console.error('Error processing new user:', error);
      throw error;
    }
  };
  
  // Helper to update user sprint data
  const updateUserSprintData = async (userId: string | null) => {
    try {
      // If no userId provided but user is logged in, use that ID
      const effectiveUserId = userId || (user ? user.id : null);
      
      if (!effectiveUserId) {
        console.error('No user ID available for sprint data update');
        return;
      }
      
      // Upload CV if provided
      let cvUrl = null;
      if (uploadedFile) {
        cvUrl = await uploadFileToStorage(uploadedFile, effectiveUserId);
      }
      
      // Create personalized sprint tasks for this user
      await createSprintTasks(effectiveUserId);
      
      // Update or create sprint profile
      const { error: profileError } = await supabase.rpc('create_sprint_profile', {
        p_user_id: effectiveUserId,
        p_name: answers.name || (user ? `${user.firstName} ${user.lastName}` : ''),
        p_email: answers.email || (user ? user.email : ''),
        p_linkedin_url: answers.linkedin || (user ? user.linkedIn : ''),
        p_cv_url: cvUrl,
        p_current_job: answers.job || '',
        p_company_incorporated: answers.incorporated === 'yes',
        p_received_funding: answers.funding_received === 'yes',
        p_funding_details: answers.funding_details || '',
        p_has_deck: answers.deck === 'yes',
        p_team_status: answers.team || '',
        p_commercializing_invention: answers.invention === 'yes',
        p_university_ip: answers.ip === 'tto_yes' || answers.ip === 'tto_no',
        p_tto_engaged: answers.ip === 'tto_yes',
        p_problem_defined: answers.problem === 'yes',
        p_customer_engagement: answers.customers || '',
        p_market_known: answers.market_known === 'yes',
        p_market_gap_reason: answers.market_gap_reason || '',
        p_funding_amount: answers.funding_amount_text || '',
        p_has_financial_plan: answers.funding_plan === 'yes',
        p_funding_sources: Array.isArray(answers.funding_sources) ? answers.funding_sources : [],
        p_experiment_validated: answers.experiment === 'yes',
        p_industry_changing_vision: answers.vision === 'yes'
      });
      
      if (profileError) {
        console.error('Error creating/updating profile:', profileError);
        throw profileError;
      }
      
      console.log("Sprint profile updated successfully for user:", effectiveUserId);
      
    } catch (error) {
      console.error('Error updating user sprint data:', error);
      throw error;
    }
  };
  
  const updateExistingUser = async () => {
    try {
      if (!user) return;
      
      await updateUserSprintData(user.id);
      
      toast({
        title: "Sprint updated!",
        description: "Your personalized founder sprint has been updated.",
      });
      
      // Navigate to the sprint dashboard
      navigate(PATHS.SPRINT_DASHBOARD);
      
    } catch (error) {
      console.error('Error updating existing user:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if the current step is the funding_details step and if we should render it
  const shouldRenderCurrentStep = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return true;
    
    // For the funding_details step, check if funding_received is 'yes'
    if (currentStepData.id === 'funding_details') {
      return answers.funding_received === 'yes';
    }
    
    return true;
  };

  // If the current step is not to be rendered, skip to the next step
  useEffect(() => {
    if (!shouldRenderCurrentStep()) {
      goToNextStep();
    }
  }, [currentStep, answers.funding_received]);

  return {
    currentStep,
    answers,
    isSubmitting,
    uploadedFile,
    handleChange,
    toggleMultiSelect,
    handleFileUpload,
    goToNextStep,
    goToPreviousStep,
    silentSignup,
    shouldRenderCurrentStep
  };
};
