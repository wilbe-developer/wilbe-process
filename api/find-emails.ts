import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import nodemailer from 'nodemailer';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import util from 'util';

const SUPABASE_URL = "https://iatercfyoclqxmohyyke.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhdGVyY2Z5b2NscXhtb2h5eWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODczNTIsImV4cCI6MjA1OTM2MzM1Mn0.wnFk1m4e6l123D2QK6GRAnOONRkZXL1eEAwyXOxTBPE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
    console.log('Metric:', params);
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
      mxRecords = await dnsResolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        await logMetric({
          eventType: 'smtp_verification',
          domain,
          mxFound: false,
          smtpSuccess: false,
          latencyMs: Date.now() - startTime,
        });
        return false;
      }
    } catch (error) {
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
      await transporter.verify();
      const info = await transporter.checkRecipient(email);
      
      const latency = Date.now() - startTime;
      const success = info === true || info === undefined;
      
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
  
  // If this passes verification, it's likely a catch-all domain
  const result = await verifyEmail(testEmail, domain);
  
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
    return [email];
  }
  
  // Otherwise try all patterns
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
    
    const { data } = await axios.get(url);
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (name) => name === 'entry' || name === 'author',
    });
    
    const result = parser.parse(data);
    const entries = result.feed.entry || [];
    
    if (!Array.isArray(entries)) {
      return [];
    }
    
    return entries.map(entry => {
      // Extract first author
      const authors = Array.isArray(entry.author) ? entry.author : [entry.author];
      const author = authors[0];
      
      return {
        name: author?.name || 'Unknown',
        affiliation: university,
      };
    });
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
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { useCustom, universities } = req.query;
    const useCustomUniversities = useCustom === 'true';
    
    let universityList = [];
    
    // Get the list of universities to search
    if (useCustomUniversities) {
      try {
        universityList = JSON.parse(universities);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid universities parameter' });
      }
    } else {
      // Get default universities from Supabase
      const { data, error } = await supabase
        .from('universities')
        .select('id, name, domain')
        .eq('is_default', true);
      
      if (error) {
        throw error;
      }
      
      universityList = data.map(u => ({ id: u.id, name: u.name, domain: u.domain }));
    }
    
    // If no universities, return empty results
    if (!universityList.length) {
      return res.status(200).json([]);
    }
    
    // Start collecting results
    const allResults = [];
    
    // Process each university
    for (const uni of universityList) {
      // Get the university domain from Supabase
      let domain = uni.domain;
      
      if (!domain) {
        const { data, error } = await supabase
          .from('universities')
          .select('domain')
          .eq('id', uni.id)
          .single();
        
        if (!error && data && data.domain) {
          domain = data.domain;
        } else {
          // Skip if no domain is found
          continue;
        }
      }
      
      // Check if we have cached domain info
      const { data: domainData, error: domainError } = await supabase
        .from('email_domains')
        .select('is_catchall, good_pattern')
        .eq('domain', domain)
        .single();
      
      let isCatchall = false;
      let goodPattern = null;
      
      if (domainError || !domainData) {
        // Domain not in cache, test for catch-all policy
        isCatchall = await testForCatchall(domain);
        
        // Add to cache
        await supabase.from('email_domains').insert({
          domain,
          is_catchall: isCatchall,
          good_pattern: null // Will be updated if we find a working pattern
        });
      } else {
        isCatchall = domainData.is_catchall;
        goodPattern = domainData.good_pattern;
      }
      
      // Get authors from arXiv API
      const authors = await getAuthorsFromArXiv(uni.name);
      
      // Process each author
      for (const author of authors) {
        // Skip authors without proper names
        if (!author.name || author.name === 'Unknown') continue;
        
        // Parse name into first and last
        const nameParts = author.name.split(' ');
        if (nameParts.length < 2) continue;
        
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        
        // Skip very short names (likely parsing errors)
        if (firstName.length < 2 || lastName.length < 2) continue;
        
        let verifiedEmail = null;
        
        // Try to scrape profile page (in a real implementation)
        // For this demo, we'll skip this step
        
        // If email not found by scraping, generate candidates
        if (!verifiedEmail) {
          const candidates = generateEmailCandidates(firstName, lastName, domain, goodPattern);
          
          // For catch-all domains, just use the first pattern
          if (isCatchall && candidates.length > 0) {
            verifiedEmail = candidates[0];
          } else {
            // Otherwise verify each candidate
            for (const candidate of candidates) {
              // Rate limiting
              await delay(Math.floor(Math.random() * 300) + 200); // 200-500ms delay
              
              const isValid = await verifyEmail(candidate, domain);
              
              if (isValid) {
                verifiedEmail = candidate;
                
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
                    await supabase
                      .from('email_domains')
                      .update({ good_pattern: usedPattern })
                      .eq('domain', domain);
                  }
                }
                
                break;
              }
            }
          }
        }
        
        // Skip if no email found or already in Attio
        if (!verifiedEmail) continue;
        if (await checkLeadExistsInAttio(verifiedEmail)) continue;
        
        // Add to results
        allResults.push({
          name: author.name,
          institution: uni.name,
          email: verifiedEmail,
          verified: isCatchall ? "Maybe" : "Yes"
        });
        
        // Limit to reasonable number of results
        if (allResults.length >= 10) break;
      }
      
      // Limit to reasonable number of results
      if (allResults.length >= 10) break;
    }
    
    // Return the results
    return res.status(200).json(allResults);
  } catch (error) {
    console.error('Error in find-emails API:', error);
    
    await logMetric({
      eventType: 'api_error',
      errorMessage: error.message,
    });
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
