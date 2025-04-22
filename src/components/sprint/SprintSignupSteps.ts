
import { Step } from "@/types/sprint-signup";

export const steps: Step[] = [
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
        componentType: 'textarea',
        componentProps: {
          placeholder: "Please list the amount received and from whom."
        }
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
