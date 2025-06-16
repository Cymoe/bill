import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string | string[]
  cc?: string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string
    encoding?: string
  }>
  metadata?: {
    entityType: 'invoice' | 'estimate'
    entityId: string
    userId: string
    organizationId: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user with Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid authorization')
    }

    // Parse the request body
    const emailData: EmailRequest = await req.json()

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.html) {
      throw new Error('Missing required fields: to, subject, and html are required')
    }

    // Prepare the email for Resend
    const resendPayload = {
      from: 'onboarding@resend.dev', // Using Resend's test domain
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      cc: emailData.cc,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      reply_to: emailData.replyTo || 'onboarding@resend.dev',
      attachments: emailData.attachments,
    }

    // Send the email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const resendData = await resendResponse.json()

    // Log the email send event if metadata is provided
    if (emailData.metadata) {
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          entity_type: emailData.metadata.entityType,
          entity_id: emailData.metadata.entityId,
          user_id: emailData.metadata.userId,
          organization_id: emailData.metadata.organizationId,
          recipient_email: Array.isArray(emailData.to) ? emailData.to[0] : emailData.to,
          cc_emails: emailData.cc,
          subject: emailData.subject,
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: resendData.id,
          metadata: {
            resend_id: resendData.id,
            from: resendPayload.from,
            reply_to: resendPayload.reply_to,
          }
        })

      if (logError) {
        console.error('Failed to log email send:', logError)
        // Don't throw - email was sent successfully
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: resendData.id,
        message: 'Email sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Email send error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})