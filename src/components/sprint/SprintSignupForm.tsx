
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Input
} from "@/components/ui/input";
import { 
  Button
} from "@/components/ui/button";
import { 
  Textarea
} from "@/components/ui/textarea";
import {
  Checkbox
} from "@/components/ui/checkbox";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Label
} from "@/components/ui/label";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { UserProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, ArrowLeft, Upload, Linkedin, Check } from "lucide-react";
import { PATHS } from "@/lib/constants";
import { sendWelcomeEmail } from "@/services/emailService";
import { SprintProfile } from "@/types/sprint";

// Define question steps
type Step = {
  id: string;
  question: string;
  description?: string;
  type: 'text' | 'email' | 'select' | 'file' | 'textarea' | 'checkbox' | 'conditional';
  options?: { value: string; label: string; }[];
  conditional?: {
    field: string;
    value: string;
    component: React.ReactNode;
  }[];
};

const SprintSignupForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Define all form steps
  const steps: Step[] = [
    {
      id: 'name',
      question: 'What is your name?',
      type: 'text'
    },
    {
      id: 'email',
      question: 'What is your email address?',
      type: 'email'
    },
    {
      id: 'linkedin',
      question: 'What is your LinkedIn URL?',
      description: 'This helps us understand your background and experience.',
      type: 'text'
    },
    {
      id: 'cv',
      question: 'Please upload your CV',
      description: 'If all information is on LinkedIn, you can skip this step.',
      type: 'file'
    },
    {
      id: 'job',
      question: 'What is your current job?',
      type: 'textarea'
    },
    {
      id: 'incorporated',
      question: 'Is your company incorporated?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'funding_received',
      question: 'Have you received previous funding?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'funding_details',
      question: 'Please provide details about your previous funding',
      type: 'conditional',
      conditional: [
        {
          field: 'funding_received',
          value: 'yes',
          component: <Textarea placeholder="Please list the amount received and from whom." />
        }
      ]
    },
    {
      id: 'deck',
      question: 'Do you have a slide deck for your planned venture?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'team',
      question: 'Is this a solo project or team-based?',
      type: 'select',
      options: [
        { value: 'solo', label: 'Solo' },
        { value: 'employees', label: 'Team (employees)' },
        { value: 'cofounders', label: 'Co-founders' }
      ]
    },
    {
      id: 'invention',
      question: 'Are you commercializing your own invention?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'ip',
      question: 'Is your company reliant on university-created IP?',
      type: 'select',
      options: [
        { value: 'tto_yes', label: 'Yes, and we\'ve started discussions' },
        { value: 'tto_no', label: 'Yes, but we haven\'t started discussions' },
        { value: 'own', label: 'No, we own all IP' }
      ]
    },
    {
      id: 'problem',
      question: 'Have you defined the problem to solve?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'customers',
      question: 'Have you spoken to customers yet?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'early', label: 'Too early' }
      ]
    },
    {
      id: 'market_known',
      question: 'Do you know the ultimate market you plan to capture?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'market_gap_reason',
      question: 'Why hasn\'t this market problem been solved yet?',
      type: 'select',
      options: [
        { value: 'tech', label: 'The tech wasn\'t ready' },
        { value: 'research', label: 'No one has connected the science' },
        { value: 'cost', label: 'It was too expensive until now' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'funding_amount_text',
      question: 'How much funding do you need?',
      type: 'text'
    },
    {
      id: 'funding_plan',
      question: 'Do you have a financial plan?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'funding_sources',
      question: 'Where do you expect funding to come from?',
      type: 'checkbox',
      options: [
        { value: 'grants', label: 'Grants' },
        { value: 'vc', label: 'VCs' },
        { value: 'bootstrapped', label: 'Bootstrapping / Other' },
        { value: 'unknown', label: 'Don\'t know yet' }
      ]
    },
    {
      id: 'experiment',
      question: 'Have you run a recent experiment to validate your idea?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'vision',
      question: 'Will your company change the industry in 5–10 years?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    }
  ];

  // Filter out conditional questions when their condition isn't met
  const filteredSteps = steps.filter(step => {
    if (step.type !== 'conditional') return true;
    
    if (step.conditional) {
      return step.conditional.some(condition => 
        answers[condition.field] === condition.value
      );
    }
    
    return false;
  });

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
    if (currentStep < filteredSteps.length - 1) {
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
  
  // Render the current step
  const renderCurrentStep = () => {
    const currentStepData = filteredSteps[currentStep];
    
    if (!currentStepData) return null;
    
    return (
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-semibold">{currentStepData.question}</h2>
        {currentStepData.description && (
          <p className="text-muted-foreground">{currentStepData.description}</p>
        )}
        
        {currentStepData.type === 'text' && (
          <Input 
            value={answers[currentStepData.id] || ''} 
            onChange={(e) => handleChange(currentStepData.id, e.target.value)} 
            placeholder="Your answer" 
          />
        )}
        
        {currentStepData.type === 'email' && (
          <Input 
            type="email" 
            value={answers[currentStepData.id] || ''} 
            onChange={(e) => handleChange(currentStepData.id, e.target.value)} 
            placeholder="Your email" 
          />
        )}
        
        {currentStepData.type === 'textarea' && (
          <Textarea 
            value={answers[currentStepData.id] || ''} 
            onChange={(e) => handleChange(currentStepData.id, e.target.value)} 
            placeholder="Your answer" 
          />
        )}
        
        {currentStepData.type === 'file' && (
          <div className="flex flex-col space-y-4">
            <Input 
              type="file" 
              onChange={handleFileUpload} 
              className="border-2 border-dashed border-gray-300 p-10 text-center cursor-pointer"
            />
            {uploadedFile && (
              <div className="flex items-center space-x-2 text-green-600">
                <Check size={16} />
                <span>{uploadedFile.name} selected</span>
              </div>
            )}
          </div>
        )}
        
        {currentStepData.type === 'select' && currentStepData.options && (
          <RadioGroup
            value={answers[currentStepData.id] || ''}
            onValueChange={(value) => handleChange(currentStepData.id, value)}
            className="space-y-3"
          >
            {currentStepData.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${currentStepData.id}-${option.value}`} />
                <Label htmlFor={`${currentStepData.id}-${option.value}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {currentStepData.type === 'checkbox' && currentStepData.options && (
          <div className="space-y-3">
            {currentStepData.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox 
                  checked={(answers[currentStepData.id] || []).includes(option.value)}
                  onCheckedChange={() => toggleMultiSelect(currentStepData.id, option.value)}
                  id={`${currentStepData.id}-${option.value}`} 
                />
                <Label htmlFor={`${currentStepData.id}-${option.value}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}
        
        {currentStepData.type === 'conditional' && currentStepData.conditional && 
          currentStepData.conditional.map((condition, index) => {
            if (answers[condition.field] === condition.value) {
              return (
                <div key={index}>
                  {React.cloneElement(condition.component as React.ReactElement, {
                    value: answers[currentStepData.id] || '',
                    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                      handleChange(currentStepData.id, e.target.value)
                  })}
                </div>
              );
            }
            return null;
          })
        }
      </div>
    );
  };

  const isLastStep = currentStep === filteredSteps.length - 1;
  const currentStepData = filteredSteps[currentStep];
  
  // Check if the current step is answered
  const isCurrentStepAnswered = () => {
    if (!currentStepData) return false;
    
    // Skip validation for files
    if (currentStepData.type === 'file') return true;
    
    // Conditional step
    if (currentStepData.type === 'conditional') {
      if (currentStepData.conditional) {
        const isConditionMet = currentStepData.conditional.some(condition => 
          answers[condition.field] === condition.value
        );
        
        if (!isConditionMet) return true;
        
        return !!answers[currentStepData.id];
      }
      return true;
    }
    
    if (currentStepData.type === 'checkbox') {
      return Array.isArray(answers[currentStepData.id]) && answers[currentStepData.id].length > 0;
    }
    
    return !!answers[currentStepData.id];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">⚡ Founder Sprint Sign-Up</h1>
        <p className="text-muted-foreground">We surface great founders. We help everyone else.</p>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {filteredSteps.length}
        </div>
        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-brand-pink h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        {isLastStep ? (
          <Button 
            onClick={silentSignup}
            disabled={!isCurrentStepAnswered() || isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? "Creating your sprint..." : "Personalize My Sprint"} 
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={goToNextStep}
            disabled={!isCurrentStepAnswered()}
            className="ml-auto"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SprintSignupForm;
