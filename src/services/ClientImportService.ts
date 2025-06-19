import { Client } from './ClientService';

export class ClientImportService {
  /**
   * Parse smart input from various sources (voice, paste, etc.)
   * Uses AI-like pattern matching to extract contact information
   */
  static parseSmartInput(input: string): Client[] {
    const clients: Client[] = [];
    
    // Normalize input
    const normalizedInput = input.replace(/\s+/g, ' ').trim();
    
    // Try different parsing strategies
    const parsedClients = [
      ...this.parseNaturalLanguage(normalizedInput),
      ...this.parseStructuredText(normalizedInput),
      ...this.parseEmailSignatures(normalizedInput),
      ...this.parseBusinessCards(normalizedInput),
      ...this.parseCSVLike(normalizedInput)
    ];
    
    // Deduplicate and validate
    const uniqueClients = this.deduplicateClients(parsedClients);
    return uniqueClients.filter(client => this.validateClient(client));
  }
  
  /**
   * Parse natural language input (e.g., from voice)
   * "Add John Doe from ABC Construction, phone 555-1234, email john@abc.com"
   */
  private static parseNaturalLanguage(input: string): Client[] {
    const clients: Client[] = [];
    
    // Patterns for natural language
    const patterns = [
      // "Add John Doe from ABC Construction..."
      /(?:add|create|new)\s+([A-Za-z\s]+?)\s+(?:from|at|with)\s+([A-Za-z0-9\s&.,'-]+?)(?:,|\s+(?:phone|tel|cell))/gi,
      // "John Doe, ABC Construction, 555-1234"
      /^([A-Za-z\s]+?),\s*([A-Za-z0-9\s&.,'-]+?),\s*([\d\s()+-]+)$/gm,
      // "Contact: John Doe (ABC Corp) - john@abc.com"
      /(?:contact|client|customer):\s*([A-Za-z\s]+?)\s*\(([^)]+)\)\s*-\s*([^\s]+@[^\s]+)/gi
    ];
    
    for (const pattern of patterns) {
      const matches = [...input.matchAll(pattern)];
      for (const match of matches) {
        const client: Partial<Client> = {
          name: this.cleanName(match[1]),
          company_name: match[2] ? this.cleanCompanyName(match[2]) : undefined
        };
        
        // Extract additional info from the rest of the string
        const remainingText = input.substring(match.index! + match[0].length);
        const email = this.extractEmail(remainingText);
        const phone = this.extractPhone(remainingText);
        const address = this.extractAddress(remainingText);
        
        if (email) client.email = email;
        if (phone) client.phone = phone;
        if (address) client.address = address;
        
        if (client.name) {
          clients.push(client as Client);
        }
      }
    }
    
    // Also try to parse as a single contact if no matches
    if (clients.length === 0) {
      const singleClient = this.parseSingleContact(input);
      if (singleClient) clients.push(singleClient);
    }
    
    return clients;
  }
  
  /**
   * Parse structured text (tables, lists, etc.)
   */
  private static parseStructuredText(input: string): Client[] {
    const clients: Client[] = [];
    const lines = input.split('\n').filter(line => line.trim());
    
    // Check if it looks like a table with headers
    const possibleHeaders = lines[0]?.toLowerCase();
    if (possibleHeaders && (
      possibleHeaders.includes('name') || 
      possibleHeaders.includes('company') || 
      possibleHeaders.includes('email')
    )) {
      // Parse as table
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/\t|\s{2,}|,/).map(p => p.trim());
        if (parts.length >= 2) {
          const client: Partial<Client> = {};
          
          // Try to map based on header positions
          const headers = lines[0].toLowerCase().split(/\t|\s{2,}|,/);
          headers.forEach((header, index) => {
            const value = parts[index];
            if (!value) return;
            
            if (header.includes('name') && !header.includes('company')) {
              client.name = this.cleanName(value);
            } else if (header.includes('company') || header.includes('org')) {
              client.company_name = this.cleanCompanyName(value);
            } else if (header.includes('email')) {
              client.email = this.cleanEmail(value);
            } else if (header.includes('phone') || header.includes('tel')) {
              client.phone = this.cleanPhone(value);
            } else if (header.includes('address')) {
              client.address = value;
            }
          });
          
          if (client.name) {
            clients.push(client as Client);
          }
        }
      }
    }
    
    return clients;
  }
  
  /**
   * Parse email signatures
   */
  private static parseEmailSignatures(input: string): Client[] {
    const clients: Client[] = [];
    
    // Split by common email signature separators
    const signatures = input.split(/(?:--|—|_____|Best regards|Sincerely|Thanks|Regards|Sent from)/i);
    
    for (const sig of signatures) {
      if (sig.length < 20 || sig.length > 500) continue;
      
      const lines = sig.split('\n').filter(line => line.trim());
      if (lines.length < 2) continue;
      
      const client: Partial<Client> = {};
      
      // First line is often the name
      const firstLine = lines[0].trim();
      if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.match(/\d{3,}/)) {
        client.name = this.cleanName(firstLine);
      }
      
      // Look for patterns in remaining lines
      for (const line of lines) {
        // Email
        const email = this.extractEmail(line);
        if (email && !client.email) {
          client.email = email;
        }
        
        // Phone
        const phone = this.extractPhone(line);
        if (phone && !client.phone) {
          client.phone = phone;
        }
        
        // Company (often after name or before address)
        if (!client.company_name && !email && !phone) {
          const cleaned = line.trim();
          if (cleaned.length > 3 && cleaned.length < 100) {
            // Check if it looks like a company name
            if (cleaned.match(/\b(Inc|LLC|Corp|Company|Co\.|Ltd|Group|Services|Construction|Electric|Plumbing|HVAC)\b/i)) {
              client.company_name = this.cleanCompanyName(cleaned);
            }
          }
        }
      }
      
      // Try to extract address from the last few lines
      const addressLines = lines.slice(-3).join(' ');
      const address = this.extractAddress(addressLines);
      if (address) {
        client.address = address;
      }
      
      if (client.name || (client.email && client.company_name)) {
        clients.push(client as Client);
      }
    }
    
    return clients;
  }
  
  /**
   * Parse business card text
   */
  private static parseBusinessCards(input: string): Client[] {
    const clients: Client[] = [];
    
    // Business cards often have name at top, company below, then contact info
    const blocks = input.split(/\n{2,}/);
    
    for (const block of blocks) {
      const lines = block.split('\n').filter(line => line.trim());
      if (lines.length < 2) continue;
      
      const client: Partial<Client> = {};
      
      // Process lines in order
      let nameFound = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip very short lines
        if (line.length < 3) continue;
        
        // First non-email, non-phone line is likely the name
        if (!nameFound && !this.extractEmail(line) && !this.extractPhone(line)) {
          // Check if it's a person's name (not a company)
          if (line.split(' ').length <= 4 && !line.match(/\b(Inc|LLC|Corp|Company)\b/i)) {
            client.name = this.cleanName(line);
            nameFound = true;
            continue;
          }
        }
        
        // Look for company name (often has Inc, LLC, etc.)
        if (!client.company_name && line.match(/\b(Inc|LLC|Corp|Company|Co\.|Ltd|Group|Services|Construction|Electric|Plumbing|HVAC)\b/i)) {
          client.company_name = this.cleanCompanyName(line);
          continue;
        }
        
        // Email
        const email = this.extractEmail(line);
        if (email && !client.email) {
          client.email = email;
          continue;
        }
        
        // Phone
        const phone = this.extractPhone(line);
        if (phone && !client.phone) {
          client.phone = phone;
          continue;
        }
        
        // Job title (skip for now)
        if (line.match(/\b(President|CEO|Manager|Director|Owner|Foreman|Supervisor)\b/i)) {
          continue;
        }
      }
      
      // Try to find address in the last few lines
      const lastLines = lines.slice(-3).join(' ');
      const address = this.extractAddress(lastLines);
      if (address) {
        client.address = address;
      }
      
      if (client.name || client.company_name) {
        clients.push(client as Client);
      }
    }
    
    return clients;
  }
  
  /**
   * Parse CSV-like formats
   */
  private static parseCSVLike(input: string): Client[] {
    const clients: Client[] = [];
    const lines = input.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Skip headers
      if (line.toLowerCase().includes('name') && line.toLowerCase().includes('email')) {
        continue;
      }
      
      // Try different delimiters
      const delimiters = [',', '\t', '|', ';'];
      for (const delimiter of delimiters) {
        if (line.includes(delimiter)) {
          const parts = line.split(delimiter).map(p => p.trim().replace(/^"|"$/g, ''));
          
          if (parts.length >= 2) {
            const client: Partial<Client> = {};
            
            // Common patterns:
            // Name, Company, Email, Phone
            // Name, Email, Phone
            // Company, Contact, Email
            
            // First part is usually name or company
            const first = parts[0];
            if (first) {
              if (first.match(/\b(Inc|LLC|Corp|Company)\b/i)) {
                client.company_name = this.cleanCompanyName(first);
                if (parts[1] && !this.extractEmail(parts[1])) {
                  client.name = this.cleanName(parts[1]);
                }
              } else {
                client.name = this.cleanName(first);
                if (parts[1] && !this.extractEmail(parts[1])) {
                  client.company_name = this.cleanCompanyName(parts[1]);
                }
              }
            }
            
            // Look for email and phone in remaining parts
            for (let i = 1; i < parts.length; i++) {
              const part = parts[i];
              if (!part) continue;
              
              const email = this.extractEmail(part);
              if (email && !client.email) {
                client.email = email;
              } else {
                const phone = this.extractPhone(part);
                if (phone && !client.phone) {
                  client.phone = phone;
                } else if (i === parts.length - 1) {
                  // Last part might be address
                  const address = this.extractAddress(part);
                  if (address) {
                    client.address = address;
                  }
                }
              }
            }
            
            if (client.name || client.company_name) {
              clients.push(client as Client);
              break; // Found a match with this delimiter
            }
          }
        }
      }
    }
    
    return clients;
  }
  
  /**
   * Try to parse as a single contact
   */
  private static parseSingleContact(input: string): Client | null {
    const client: Partial<Client> = {};
    
    // Extract email first (most reliable)
    const email = this.extractEmail(input);
    if (email) {
      client.email = email;
      
      // Try to extract name from email
      const emailName = email.split('@')[0].replace(/[._-]/g, ' ');
      if (emailName.length > 2) {
        client.name = this.cleanName(emailName);
      }
    }
    
    // Extract phone
    const phone = this.extractPhone(input);
    if (phone) {
      client.phone = phone;
    }
    
    // Extract address
    const address = this.extractAddress(input);
    if (address) {
      client.address = address;
    }
    
    // Try to find name if not found from email
    if (!client.name) {
      // Remove email, phone, and address from input
      let cleanedInput = input;
      if (email) cleanedInput = cleanedInput.replace(email, '');
      if (phone) cleanedInput = cleanedInput.replace(phone, '');
      if (address) cleanedInput = cleanedInput.replace(address, '');
      
      // Look for capitalized words that could be a name
      const words = cleanedInput.split(/\s+/).filter(w => w.length > 1);
      const capitalizedWords = words.filter(w => /^[A-Z]/.test(w));
      
      if (capitalizedWords.length >= 2 && capitalizedWords.length <= 4) {
        client.name = this.cleanName(capitalizedWords.join(' '));
      }
    }
    
    // Try to find company
    const companyPatterns = [
      /\b([A-Za-z0-9\s&.,'-]+?)\s*(?:Inc|LLC|Corp|Company|Co\.|Ltd|Group|Services|Construction|Electric|Plumbing|HVAC)\b/i,
      /(?:company|org|organization|employer):\s*([A-Za-z0-9\s&.,'-]+?)(?:\n|$|,)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = input.match(pattern);
      if (match) {
        client.company_name = this.cleanCompanyName(match[1] + (match[0].includes('Inc') ? ' Inc' : ''));
        break;
      }
    }
    
    return (client.name || client.email || client.company_name) ? client as Client : null;
  }
  
  /**
   * Extract email from text
   */
  private static extractEmail(text: string): string | null {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0].toLowerCase() : null;
  }
  
  /**
   * Extract phone from text
   */
  private static extractPhone(text: string): string | null {
    // Various phone formats
    const phonePatterns = [
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // 555-555-5555
      /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/, // (555) 555-5555
      /\b\+?1?\s?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // +1 555-555-5555
      /\b\d{10}\b/ // 5555555555
    ];
    
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        return this.cleanPhone(match[0]);
      }
    }
    
    return null;
  }
  
  /**
   * Extract address from text
   */
  private static extractAddress(text: string): string | null {
    // Look for patterns like "123 Main St, City, ST 12345"
    const addressPatterns = [
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Circle|Cir|Way)\b[^,]*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}\b/i,
      /\b\d+\s+[A-Za-z\s]+(?:St|Ave|Rd|Blvd|Ln|Dr|Ct|Pl|Cir|Way)\b[^,]*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}\b/i,
      /\b\d+\s+[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}\b/i
    ];
    
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return null;
  }
  
  /**
   * Clean and normalize name
   */
  private static cleanName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s'-]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Clean and normalize company name
   */
  private static cleanCompanyName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s&.,'-]/g, '');
  }
  
  /**
   * Clean and normalize email
   */
  private static cleanEmail(email: string): string {
    return email.trim().toLowerCase();
  }
  
  /**
   * Clean and normalize phone
   */
  private static cleanPhone(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX if 10 digits
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // Format as +X (XXX) XXX-XXXX if 11 digits starting with 1
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    // Return cleaned version for other formats
    return phone.trim();
  }
  
  /**
   * Validate that a client has minimum required info
   */
  private static validateClient(client: Client): boolean {
    // Must have at least a name or company name
    if (!client.name && !client.company_name) {
      return false;
    }
    
    // Name should be reasonable length
    if (client.name && (client.name.length < 2 || client.name.length > 100)) {
      return false;
    }
    
    // Email should be valid if provided
    if (client.email && !client.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Deduplicate clients based on email, phone, or name
   */
  private static deduplicateClients(clients: Client[]): Client[] {
    const seen = new Map<string, Client>();
    
    for (const client of clients) {
      // Create a unique key based on available info
      const keys: string[] = [];
      
      if (client.email) {
        keys.push(`email:${client.email.toLowerCase()}`);
      }
      if (client.phone) {
        keys.push(`phone:${client.phone.replace(/\D/g, '')}`);
      }
      if (client.name && client.company_name) {
        keys.push(`name-company:${client.name.toLowerCase()}-${client.company_name.toLowerCase()}`);
      }
      
      // Check if we've seen this client
      let isDuplicate = false;
      for (const key of keys) {
        if (seen.has(key)) {
          // Merge data with existing client
          const existing = seen.get(key)!;
          if (!existing.company_name && client.company_name) {
            existing.company_name = client.company_name;
          }
          if (!existing.email && client.email) {
            existing.email = client.email;
          }
          if (!existing.phone && client.phone) {
            existing.phone = client.phone;
          }
          if (!existing.address && client.address) {
            existing.address = client.address;
          }
          isDuplicate = true;
          break;
        }
      }
      
      // Add to seen if not duplicate
      if (!isDuplicate) {
        for (const key of keys) {
          seen.set(key, client);
        }
      }
    }
    
    return Array.from(new Set(seen.values()));
  }
}