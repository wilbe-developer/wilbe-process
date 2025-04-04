
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import Logo from "@/components/Logo";
import { UserProfile } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  linkedIn: z.string().optional(),
  institutionStatus: z.enum(["listed", "notListed", "notAffiliated"]),
  institution: z.string().optional(),
  privacyPolicy: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
  marketingConsent: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RegisterPage = () => {
  const { register: registerUser, loading } = useAuth();
  const [hasLinkedIn, setHasLinkedIn] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      linkedIn: "",
      institutionStatus: "listed",
      institution: "",
      privacyPolicy: false,
      marketingConsent: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const userData: Partial<UserProfile> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      linkedIn: hasLinkedIn ? data.linkedIn : undefined,
      institution: data.institutionStatus === "listed" ? data.institution : 
                  data.institutionStatus === "notListed" ? "Not listed yet" : 
                  "Not affiliated",
    };
    
    await registerUser(userData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Join</CardTitle>
          <CardDescription>
            <div className="flex justify-center mt-1">
              Already a member?{" "}
              <Link to={PATHS.LOGIN} className="text-brand-pink hover:underline ml-1">
                Log In
              </Link>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 mb-4">
            Consider signing up with your personal address to avoid losing access after leaving your institution
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox 
                    id="hasLinkedIn" 
                    checked={hasLinkedIn} 
                    onCheckedChange={(checked) => setHasLinkedIn(checked as boolean)}
                  />
                  <Label htmlFor="hasLinkedIn">I don't have LinkedIn</Label>
                </div>
                
                {hasLinkedIn && (
                  <FormField
                    control={form.control}
                    name="linkedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/yourname" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <FormField
                control={form.control}
                name="institutionStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="listed" 
                            id="institution-listed" 
                          />
                          <Label htmlFor="institution-listed">Select Your Institution (or start typing)</Label>
                        </div>
                        {field.value === "listed" && (
                          <Input 
                            placeholder="Start typing to search..."
                            className="ml-6"
                            {...form.register("institution")}
                          />
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="notListed" 
                            id="institution-notlisted" 
                          />
                          <Label htmlFor="institution-notlisted">My Institute / University is not listed yet</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="notAffiliated" 
                            id="not-institution" 
                          />
                          <Label htmlFor="not-institution">I'm not at an institute/university</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="privacyPolicy"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label>I have read the privacy policy (link below)</Label>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="marketingConsent"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label>I want to receive updates exploring alternative careers in innovation, entrepreneurship for scientists, and accessing funding</Label>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Processing..." : "Continue"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 p-4 border rounded-md bg-gray-50 text-sm text-gray-700">
            <p className="mb-2">
              You will receive a confirmation email, this could be there waiting for you now
              but please allow a couple of hours. We are admitting members on a rolling
              basis.
            </p>
            <p className="mb-2">
              You may unsubscribe using the link at the bottom of email newsletters or contact
              us anytime via yourdata@wilbe.com if you'd like us to delete your personal
              information. You can also contact us at this email address to request clarification
              on the personal information that we hold about you.
            </p>
            <p className="mt-2">
              For further details, please see our <a href="#" className="text-brand-pink hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
