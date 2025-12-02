# Custom Welcome Email Implementation Plan

## Overview

Replace the default Supabase confirmation email with a custom branded welcome email using Resend + React Email.

## Why This Approach?

- **Professional first impression** - Custom branded emails build trust
- **Scalability** - Easy to add password reset, magic link templates later
- **Free tier** - Resend offers 3,000 emails/month free
- **Modern DX** - React Email templates are easy to maintain

## Prerequisites

1. Create a free [Resend account](https://resend.com/)
2. [Verify your domain](https://resend.com/domains) (or use test domain initially)
3. [Create a Resend API key](https://resend.com/api-keys)

## Implementation Steps

### Step 1: Create the Edge Function

```bash
supabase functions new send-email
```

### Step 2: Create the Email Handler

Create `supabase/functions/send-email/index.ts`:

```typescript
import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { WelcomeEmail } from './_templates/welcome.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string
const adminEmail = Deno.env.get('ADMIN_EMAIL') as string // Your email for notifications

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)

  try {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: { email: string }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    // Choose template based on email action type
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to,
        email_action_type,
      })
    )

    // 1. Send welcome email to user
    const { error } = await resend.emails.send({
      from: 'MapTheGap <welcome@yourdomain.com>', // Update with your domain
      to: [user.email],
      subject: 'Welcome to MapTheGap - Confirm Your Email',
      html,
    })

    if (error) throw error

    // 2. Send admin notification (non-blocking)
    if (adminEmail) {
      resend.emails.send({
        from: 'MapTheGap <noreply@yourdomain.com>',
        to: [adminEmail],
        subject: `🎉 New signup: ${user.email}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; padding: 20px; background: #0a0a0a; color: #fafafa;">
            <h2 style="color: #8b5cf6; margin: 0 0 16px;">New User Registration</h2>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p style="margin: 8px 0;"><strong>Action:</strong> ${email_action_type}</p>
            <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;" />
            <p style="color: #737373; font-size: 14px;">MapTheGap Admin Notification</p>
          </div>
        `,
      }).catch(console.error) // Don't fail if admin email fails
    }

  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({
        error: { http_code: error.code, message: error.message },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Step 3: Create the React Email Template

Create `supabase/functions/send-email/_templates/welcome.tsx`:

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const WelcomeEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: WelcomeEmailProps) => {
  const confirmationUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  return (
    <Html>
      <Head />
      <Preview>Welcome to MapTheGap - Confirm your email</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>MapTheGap</Text>
          </Section>

          {/* Main Content */}
          <Heading style={h1}>Welcome to MapTheGap!</Heading>

          <Text style={text}>
            Thanks for signing up! You're one step away from exploring location
            data across 8+ countries and multiple industries.
          </Text>

          <Text style={text}>
            Click the button below to confirm your email address:
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={confirmationUrl}>
              Confirm Email Address
            </Button>
          </Section>

          <Text style={text}>
            Or use this confirmation code: <code style={code}>{token}</code>
          </Text>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you didn't create an account, you can safely ignore this email.
            </Text>
            <Text style={footerText}>
              <Link href="https://mapthegap.io" style={footerLink}>
                MapTheGap
              </Link>{' '}
              - Location Intelligence Platform
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

// Styles
const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#8b5cf6', // violet-500
  margin: '0',
}

const h1 = {
  color: '#fafafa',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#a3a3a3',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#8b5cf6', // violet-500
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
}

const code = {
  backgroundColor: '#262626',
  borderRadius: '4px',
  color: '#fafafa',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '4px 8px',
}

const footer = {
  borderTop: '1px solid #262626',
  marginTop: '32px',
  paddingTop: '24px',
}

const footerText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#8b5cf6', // violet-500
  textDecoration: 'underline',
}
```

### Step 4: Set Environment Variables

Create `supabase/functions/.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
SEND_EMAIL_HOOK_SECRET=<base64_secret_from_supabase>
ADMIN_EMAIL=your@email.com
```

Set the secrets:

```bash
supabase secrets set --env-file supabase/functions/.env
```

### Step 5: Deploy the Function

```bash
supabase functions deploy send-email --no-verify-jwt
```

### Step 6: Configure the Auth Hook

1. Go to [Supabase Dashboard → Authentication → Hooks](https://supabase.com/dashboard/project/_/auth/hooks)
2. Create a new "Send Email" hook
3. Select **HTTPS** as the hook type
4. Paste your function URL (e.g., `https://<project-ref>.supabase.co/functions/v1/send-email`)
5. Click "Generate Secret" and save it to your `.env`
6. Click "Create"

## Testing

1. Sign up with a new email address
2. Check your inbox for the custom branded email
3. Verify the confirmation link works

## Additional Templates to Add Later

- Password reset email
- Magic link email
- Email change confirmation
- Invite user email

## Resources

- [Supabase Send Email Hook Docs](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- [React Email Examples](https://react.email/examples)
- [Resend Documentation](https://resend.com/docs)
- [Supabase Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)

## Estimated Time

| Step | Time |
|------|------|
| Create Resend account & verify domain | 10 min |
| Create Edge Function | 10 min |
| Design React Email template | 15 min |
| Configure Send Email Hook | 5 min |
| Test the flow | 5 min |
| **Total** | **~45 min** |
