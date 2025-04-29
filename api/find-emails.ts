import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import nodemailer from 'nodemailer';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import util from 'util';

// Create Supabase client - Use the Vercel environment variables without fallbacks
// Note: Vercel uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as shown in the environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Log the environment variables for debugging (without exposing full values)
console.log('Environment variables check:', { 
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL_SET: !!SUPABASE_URL,
  SUPABASE_ANON_KEY_SET: !!SUPABASE_ANON_KEY,
  USING_URL_PREFIX: SUPABASE_URL ? SUPABASE_URL.substring(0, 20) + '...' : 'URL is missing',
  USING_KEY_PREFIX: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'Key is missing'
});

// Check if environment variables are properly set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables for Supabase connection');
  console.error('Available env vars:', Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')).join(', '));
}

// Create Supabase client with improved error handling
let supabase;
try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase connection credentials are missing. Check environment variables.');
  }
  
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  // Continue execution - we'll handle the error when we try to use the client
}

// Convert DNS resolve to Promise-based
const dnsResolveMx = util.promisify(dns.resolveMx);

// Common email patterns to try
const EMAIL_PATTERNS = [
  '{firstName}.{lastName}@{domain}',
  '{firstName}{lastName}@{domain}',
  '{firstInitial}{lastName}@{domain}',
  '{firstName}.{lastInitial}@{domain}',
  '{firstName}@{domain}',
];

// Helper function to delay execution (for rate limiting)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Log metrics to Supabase
async function logMetric(params: {
  eventType: string;
  domain?: string;
  mxFound?: boolean;
  isCatchall?: boolean;
  patternTried?: string;
  smtpSuccess?: boolean;
  latencyMs?: number;
  errorMessage?: string;
}) {
  try {
    await supabase.from('metrics').insert({
      event_type: params.eventType,
      domain: params.domain,
      mx_found: params.mxFound,
      is_catchall: params.isCatchall,
      pattern_tried: params.patternTried,
      smtp_success: params.smtpSuccess,
      latency_ms: params.latencyMs,
      error_message: params.errorMessage,
    });
    
    // Also log to console for immediate visibility
    console.log('Metric logged:', params);
  } catch (error) {
    console.error('Failed to log metric:', error);
  }
}

// Verify if an email exists using SMTP
async function verifyEmail(email: string, domain: string): Promise<boolean> {
  try {
    const startTime = Date.now();
    
    // Check MX records first
    let mxRecords;
    try {
      console.log(`Checking MX records for domain: ${domain}`);
      mxRecords = await dnsResolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        console.log(`No MX records found for domain: ${domain}`);
        await logMetric({
          eventType: 'smtp_verification',
          domain,
          mxFound: false,
          smtpSuccess: false,
          latencyMs: Date.now() - startTime,
        });
        return false;
      }
      console.log(`Found ${mxRecords.length} MX records for domain: ${domain}`);
    } catch (error) {
      console.error(`MX lookup failed for domain ${domain}:`, error);
      await logMetric({
        eventType: 'smtp_verification',
        domain,
        mxFound: false,
        smtpSuccess: false,
        latencyMs: Date.now() - startTime,
        errorMessage: `MX lookup failed: ${error.message}`,
      });
      return false;
    }
    
    // Sort MX records by priority (lowest first)
    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;
    console.log(`Using MX host: ${mxHost} for verification`);
    
    // Create a transport for SMTP verification
    const transporter = nodemailer.createTransport({
      host: mxHost,
      port: 25,
      secure: false,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
    
    try {
      // Only verify if the recipient exists
      // We don't actually send an email
      console.log(`Verifying email: ${email}`);
      await transporter.verify();
      const info = await transporter.checkRecipient(email);
      
      const latency = Date.now() - startTime;
      const success = info === true || info === undefined;
      console.log(`Email verification ${success ? 'passed' : 'failed'} for ${email}`);
      
      await logMetric({
        eventType: 'smtp_verification',
        domain,
        mxFound: true,
        smtpSuccess: success,
        patternTried: email.split('@')[0],
        latencyMs: latency,
      });
      
      return success;
    } catch (error) {
      console.error(`SMTP verification failed for ${email}:`, error);
      await logMetric({
        eventType: 'smtp_verification',
        domain,
        mxFound: true,
        smtpSuccess: false,
        patternTried: email.split('@')[0],
        latencyMs: Date.now() - startTime,
        errorMessage: `SMTP verification failed: ${error.message}`,
      });
      
      return false;
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return false;
  }
}

// Test if the domain has a catch-all email policy
async function testForCatchall(domain: string): Promise<boolean> {
  // Generate a random, very unlikely email address
  const randomStr = Math.random().toString(36).substring(2, 15);
  const testEmail = `nonexistent-${randomStr}@${domain}`;
  console.log(`Testing for catch-all policy with email: ${testEmail}`);
  
  // If this passes verification, it's likely a catch-all domain
  const result = await verifyEmail(testEmail, domain);
  console.log(`Catch-all test for ${domain}: ${result ? 'IS catch-all' : 'NOT catch-all'}`);
  
  await logMetric({
    eventType: 'catchall_test',
    domain,
    isCatchall: result,
  });
  
  return result;
}

// Generate potential email addresses based on name and domain
function generateEmailCandidates(firstName: string, lastName: string, domain: string, goodPattern?: string): string[] {
  firstName = firstName.toLowerCase().trim();
  lastName = lastName.toLowerCase().trim();
  
  // Remove diacritics and replace spaces
  firstName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
  lastName = lastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
  
  // If we have a good pattern from cache, prioritize it
  if (goodPattern) {
    const email = goodPattern
      .replace('{firstName}', firstName)
      .replace('{lastName}', lastName)
      .replace('{firstInitial}', firstName.charAt(0))
      .replace('{lastInitial}', lastName.charAt(0))
      .replace('{domain}', domain);
    console.log(`Using cached good pattern for ${domain}: ${email}`);
    return [email];
  }
  
  // Otherwise try all patterns
  console.log(`Generating email candidates for ${firstName} ${lastName}@${domain}`);
  return EMAIL_PATTERNS.map(pattern => {
    return pattern
      .replace('{firstName}', firstName)
      .replace('{lastName}', lastName)
      .replace('{firstInitial}', firstName.charAt(0))
      .replace('{lastInitial}', lastName.charAt(0))
      .replace('{domain}', domain);
  });
}

// Extract emails from HTML content using various methods
function extractEmailsFromHtml(html: string): string[] {
  const emails: string[] = [];
  
  try {
    const $ = cheerio.load(html);
    
    // Look for mailto links
    $('a[href^="mailto:"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const email = href.replace('mailto:', '').split('?')[0].trim();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          emails.push(email);
        }
      }
    });
    
    // Look for email patterns in the text
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const bodyText = $('body').text();
    const matches = bodyText.match(emailRegex);
    
    if (matches) {
      emails.push(...matches);
    }
    
    console.log(`Extracted ${emails.length} emails from HTML`);
  } catch (error) {
    console.error('Error extracting emails from HTML:', error);
  }
  
  // Return unique emails
  return [...new Set(emails)];
}

// Get author details from arXiv API
async function getAuthorsFromArXiv(university: string, maxResults = 5): Promise<Array<{name: string, affiliation: string}>> {
  try {
    const query = encodeURIComponent(`affiliation:${university}`);
    const url = `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
    
    console.log(`Fetching authors from arXiv for university: ${university}`);
    const { data } = await axios.get(url);
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (name) => name === 'entry' || name === 'author',
    });
    
    const result = parser.parse(data);
    const entries = result.feed.entry || [];
    
    if (!Array.isArray(entries)) {
      console.log(`No entries found on arXiv for university: ${university}`);
      return [];
    }
    
    console.log(`Found ${entries.length} entries on arXiv for university: ${university}`);
    const authors = entries.map(entry => {
      // Extract first author
      const authors = Array.isArray(entry.author) ? entry.author : [entry.author];
      const author = authors[0];
      
      return {
        name: author?.name || 'Unknown',
        affiliation: university,
      };
    });
    
    console.log(`Extracted ${authors.length} authors from arXiv for university: ${university}`);
    return authors;
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    await logMetric({
      eventType: 'arxiv_api_error',
      errorMessage: error.message,
    });
    return [];
  }
}

// Check if a lead already exists in Attio (simple implementation)
// In a real implementation, this would call the Attio GraphQL API
async function checkLeadExistsInAttio(email: string): Promise<boolean> {
  // For this demo, we'll just return false
  // In a real implementation, you would check against the Attio API
  return false;
}

// Main handler function for the API route
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API route: /api/find-emails was called');
  console.log('Request query params:', req.query);
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    console.error('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { useCustom, universities } = req.query;
    const useCustomUniversities = useCustom === 'true';
    
    console.log(`Using custom universities: ${useCustomUniversities}`);
    if (useCustomUniversities && universities) {
      console.log('Custom universities parameter provided');
    }
    
    let universityList = [];
    
    // Get the list of universities to search
    if (useCustomUniversities && universities) {
      try {
        universityList = JSON.parse(universities as string);
        console.log(`Parsed ${universityList.length} custom universities`);
      } catch (error) {
        console.error('Failed to parse universities parameter:', error);
        return res.status(400).json({ error: 'Invalid universities parameter' });
      }
    } else {
      // Get default universities from Supabase
      console.log('Fetching default universities from Supabase');
      
      try {
        // First, verify we can connect to Supabase by doing a simple query
        if (!supabase) {
          throw new Error('Supabase client is not initialized. Check environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        }

        // Test if universities table exists with a simple count query
        console.log('Testing Supabase connection with a simple query...');
        const { count, error: countError } = await supabase
          .from('universities')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('Error testing Supabase connection:', countError);
          throw new Error(`Supabase connection failed: ${countError.message || 'Unknown error'}`);
        }
        
        console.log(`Table exists with approximately ${count} rows`);
        
        // Get the default universities
        const { data, error } = await supabase
          .from('universities')
          .select('id, name, domain')
          .eq('is_default', true);
        
        if (error) {
          console.error('Supabase error fetching default universities:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No default universities found in database');
          
          // Additional diagnostics: check total count of universities
          const { data: allUniversities, error: allError } = await supabase
            .from('universities')
            .select('id, name, is_default');
          
          if (!allError && allUniversities) {
            console.log(`Total universities in database: ${allUniversities.length}`);
            console.log(`Universities with is_default=true: ${allUniversities.filter(u => u.is_default).length}`);
          }
          
          // Return empty results instead of throwing an error
          return res.status(200).json({
            error: 'No default universities found. Please add and set some universities as default in the University Management tab.',
            data: []
          });
        }
        
        universityList = data.map(u => ({ id: u.id, name: u.name, domain: u.domain }));
        console.log(`Found ${universityList.length} default universities`);
      } catch (dbError) {
        console.error('Database error fetching universities:', dbError);
        
        // Add specific diagnostics for connection issues
        if (dbError.message && dbError.message.includes('connection')) {
          console.error('This appears to be a connection issue. Check Supabase credentials and network.');
        }
        
        // Provide a clear error to the frontend
        return res.status(500).json({
          error: 'Failed to connect to the database. Please check your Supabase connection details.',
          details: dbError.message,
          suggestion: 'Verify that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are correctly set in Vercel.'
        });
      }
    }
    
    // If no universities, return empty results with a clear message
    if (!universityList.length) {
      console.log('No universities to search, returning empty results');
      return res.status(200).json({
        error: 'No universities found to search. Please add universities and set some as default.',
        data: []
      });
    }
    
    // Check if any universities don't have domains
    const universitiesWithoutDomains = universityList.filter(u => !u.domain);
    if (universitiesWithoutDomains.length > 0) {
      console.log(`Warning: ${universitiesWithoutDomains.length} universities are missing domains`);
      const names = universitiesWithoutDomains.map(u => u.name).join(', ');
      console.log(`Universities missing domains: ${names}`);
    }
    
    // Start collecting results
    const allResults = [];
    
    // Process each university
    for (const uni of universityList) {
      console.log(`Processing university: ${uni.name}`);
      // Get the university domain from Supabase
      let domain = uni.domain;
      
      if (!domain) {
        console.log(`No domain provided for university: ${uni.name}, trying to fetch from database`);
        const { data, error } = await supabase
          .from('universities')
          .select('domain')
          .eq('id', uni.id)
          .single();
        
        if (!error && data && data.domain) {
          domain = data.domain;
          console.log(`Found domain for ${uni.name}: ${domain}`);
        } else {
          // Skip if no domain is found
          console.log(`Skipping university ${uni.name} - no domain found`);
          continue;
        }
      }
      
      // Check if we have cached domain info
      console.log(`Checking for cached info for domain: ${domain}`);
      const { data: domainData, error: domainError } = await supabase
        .from('email_domains')
        .select('is_catchall, good_pattern')
        .eq('domain', domain)
        .single();
      
      let isCatchall = false;
      let goodPattern = null;
      
      if (domainError || !domainData) {
        console.log(`No cached info for domain ${domain}, testing for catch-all policy`);
        // Domain not in cache, test for catch-all policy
        isCatchall = await testForCatchall(domain);
        
        // Add to cache
        console.log(`Caching info for domain ${domain} (is_catchall: ${isCatchall})`);
        await supabase.from('email_domains').insert({
          domain,
          is_catchall: isCatchall,
          good_pattern: null // Will be updated if we find a working pattern
        });
      } else {
        isCatchall = domainData.is_catchall;
        goodPattern = domainData.good_pattern;
        console.log(`Using cached info for domain ${domain} (is_catchall: ${isCatchall}, good_pattern: ${goodPattern})`);
      }
      
      // Get authors from arXiv API
      const authors = await getAuthorsFromArXiv(uni.name);
      console.log(`Found ${authors.length} authors from arXiv for university: ${uni.name}`);
      
      // Process each author
      for (const author of authors) {
        // Skip authors without proper names
        if (!author.name || author.name === 'Unknown') {
          console.log('Skipping author with unknown name');
          continue;
        }
        
        // Parse name into first and last
        const nameParts = author.name.split(' ');
        if (nameParts.length < 2) {
          console.log(`Skipping author with incomplete name: ${author.name}`);
          continue;
        }
        
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        
        // Skip very short names (likely parsing errors)
        if (firstName.length < 2 || lastName.length < 2) {
          console.log(`Skipping author with very short name parts: ${firstName} ${lastName}`);
          continue;
        }
        
        console.log(`Processing author: ${firstName} ${lastName}`);
        let verifiedEmail = null;
        
        // Try to scrape profile page (in a real implementation)
        // For this demo, we'll skip this step
        
        // If email not found by scraping, generate candidates
        if (!verifiedEmail) {
          const candidates = generateEmailCandidates(firstName, lastName, domain, goodPattern);
          console.log(`Generated ${candidates.length} email candidates for ${firstName} ${lastName}`);
          
          // For catch-all domains, just use the first pattern
          if (isCatchall && candidates.length > 0) {
            verifiedEmail = candidates[0];
            console.log(`Using first candidate for catch-all domain: ${verifiedEmail}`);
          } else {
            // Otherwise verify each candidate
            console.log('Verifying email candidates...');
            for (const candidate of candidates) {
              // Rate limiting
              await delay(Math.floor(Math.random() * 300) + 200); // 200-500ms delay
              
              console.log(`Verifying candidate: ${candidate}`);
              const isValid = await verifyEmail(candidate, domain);
              
              if (isValid) {
                verifiedEmail = candidate;
                console.log(`Found valid email: ${verifiedEmail}`);
                
                // If this is the first working pattern we've found for this domain, cache it
                if (!goodPattern) {
                  // Extract the pattern used
                  const usedPattern = EMAIL_PATTERNS.find(pattern => {
                    const testEmail = pattern
                      .replace('{firstName}', firstName.toLowerCase())
                      .replace('{lastName}', lastName.toLowerCase())
                      .replace('{firstInitial}', firstName.toLowerCase().charAt(0))
                      .replace('{lastInitial}', lastName.toLowerCase().charAt(0))
                      .replace('{domain}', domain);
                    return testEmail === candidate;
                  });
                  
                  if (usedPattern) {
                    goodPattern = usedPattern;
                    console.log(`Caching good pattern for domain ${domain}: ${usedPattern}`);
                    await supabase
                      .from('email_domains')
                      .update({ good_pattern: usedPattern })
                      .eq('domain', domain);
                  }
                }
                
                break;
              } else {
                console.log(`Invalid email candidate: ${candidate}`);
              }
            }
          }
        }
        
        // Skip if no email found or already in Attio
        if (!verifiedEmail) {
          console.log(`No valid email found for ${firstName} ${lastName}`);
          continue;
        }
        
        const existsInAttio = await checkLeadExistsInAttio(verifiedEmail);
        if (existsInAttio) {
          console.log(`Email ${verifiedEmail} already exists in Attio, skipping`);
          continue;
        }
        
        // Add to results
        console.log(`Adding lead to results: ${author.name} <${verifiedEmail}>`);
        allResults.push({
          name: author.name,
          institution: uni.name,
          email: verifiedEmail,
          verified: isCatchall ? "Maybe" : "Yes"
        });
        
        // Limit to reasonable number of results
        if (allResults.length >= 10) {
          console.log('Reached maximum number of results (10), breaking early');
          break;
        }
      }
      
      // Limit to reasonable number of results
      if (allResults.length >= 10) {
        console.log('Reached maximum number of results (10), breaking early');
        break;
      }
    }
    
    // Return the results
    console.log(`Returning ${allResults.length} leads`);
    return res.status(200).json(allResults);
  } catch (error: any) {
    console.error('Error in find-emails API:', error);
    
    await logMetric({
      eventType: 'api_error',
      errorMessage: error.message || 'Unknown error',
    });
    
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined 
    });
  }
}
