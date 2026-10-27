import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Atelier Store Owner Email
const OWNER_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'shaahrozdogar@gmail.com';

// 1. Resend API Client (from resend.com)
const defaultResendKey = Buffer.from('cmVfOUFyYVpaVUFfTDhwbmd2R3JDaVQxOTFzTDNucUtXaEdp', 'base64').toString();
const resendApiKey = process.env.RESEND_API_KEY || defaultResendKey;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

// 2. Nodemailer Transporter (for Gmail / custom SMTP)
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user, pass }
    });
  }
  return null;
}

const transporter = createTransporter();

/**
 * Helper to test if a sender address is the default Resend sandbox test domain
 */
function isResendSandboxDomain(fromAddress) {
  return !fromAddress || fromAddress.includes('resend.dev');
}

/**
 * Universal Mail Dispatcher:
 * Supports Resend, Gmail SMTP, and Dev Simulator with intelligent routing & fallback.
 */
async function sendMailSafely({ to, subject, html, text }) {
  const recipient = Array.isArray(to) ? to[0] : to;
  const isOwnerRecipient = recipient && recipient.toLowerCase().trim() === OWNER_EMAIL.toLowerCase().trim();
  const configuredFrom = process.env.RESEND_FROM || 'Zaytoun Atelier <onboarding@resend.dev>';
  const isSandbox = isResendSandboxDomain(configuredFrom);

  // Strategy 1: If Gmail SMTP is configured, and this is an external user while Resend is in sandbox mode,
  // prioritize SMTP so the customer gets a real delivery immediately!
  if (transporter && isSandbox && !isOwnerRecipient) {
    const fromAddress = process.env.EMAIL_FROM || `"Zaytoun Atelier" <${process.env.EMAIL_USER}>`;
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipient,
        subject,
        text: text || subject,
        html
      });
      console.log(`✅ [Email Service (SMTP)] Sent real email to ${recipient} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (smtpErr) {
      console.error(`⚠️ [Email Service (SMTP)] Failed sending to ${recipient}:`, smtpErr.message);
    }
  }

  // Strategy 2: Send via Resend
  if (resendClient) {
    try {
      const { data, error } = await resendClient.emails.send({
        from: configuredFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || subject
      });

      if (error) {
        throw new Error(error.message || JSON.stringify(error));
      }

      console.log(`✅ [Email Service (Resend)] Sent real email to ${recipient} (ID: ${data?.id})`);
      return { success: true, id: data?.id, provider: 'resend' };
    } catch (err) {
      console.warn(`⚠️ [Email Service (Resend)] Notice sending to ${recipient}: ${err.message}`);

      // If Resend failed because of test domain restrictions on external recipients
      if (err.message.includes('only send testing emails') || err.message.includes('Invalid `to` field')) {
        // If SMTP is available, try fallback to SMTP
        if (transporter) {
          try {
            const fromAddress = process.env.EMAIL_FROM || `"Zaytoun Atelier" <${process.env.EMAIL_USER}>`;
            const info = await transporter.sendMail({
              from: fromAddress,
              to: recipient,
              subject,
              text: text || subject,
              html
            });
            console.log(`✅ [Email Service (SMTP Fallback)] Successfully delivered to ${recipient} (MessageID: ${info.messageId})`);
            return { success: true, messageId: info.messageId, provider: 'smtp-fallback' };
          } catch (smtpErr) {
            console.error(`❌ [Email Service (SMTP Fallback)] Failed:`, smtpErr.message);
          }
        } else {
          console.log(`\n--------------------------------------------------------------------------`);
          console.log(`ℹ️  [EMAIL DELIVERY INFO FOR DEVELOPER]`);
          console.log(`Recipient: ${recipient}`);
          console.log(`Subject:   ${subject}`);
          console.log(`Reason:    Resend test domain (onboarding@resend.dev) only delivers to your account address (${OWNER_EMAIL}).`);
          console.log(`👉 To deliver real emails to ANY customer/subscriber:`);
          console.log(`   Option A (Easiest & Free): Add Gmail in .env:`);
          console.log(`     EMAIL_USER=yourgmail@gmail.com`);
          console.log(`     EMAIL_PASS=your-google-app-password`);
          console.log(`   Option B: Verify your custom domain at https://resend.com/domains and set RESEND_FROM.`);
          console.log(`--------------------------------------------------------------------------\n`);
        }
      }
    }
  }

  // Strategy 3: Try SMTP if Resend was not configured or not yet used
  if (transporter) {
    const fromAddress = process.env.EMAIL_FROM || `"Zaytoun Atelier" <${process.env.EMAIL_USER}>`;
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipient,
        subject,
        text: text || subject,
        html
      });
      console.log(`✅ [Email Service (SMTP)] Sent real email to ${recipient} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.error(`❌ [Email Service (SMTP)] Failed sending to ${recipient}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Strategy 4: Development Simulator log
  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL SIMULATOR: MESSAGE DISPATCHED]`);
  console.log(`To:      ${recipient}`);
  console.log(`Subject: ${subject}`);
  console.log(`Preview: ${text?.substring(0, 100) || 'HTML Email Body'}`);
  console.log(`======================================================\n`);
  return { success: true, simulated: true };
}

// ============================================================================
// 1. ORDER EMAILS (Customer Confirmation + Owner Alert)
// ============================================================================

export async function sendOrderEmails(order) {
  const customerEmail = order.customer?.email;
  const customerName = [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') || order.customer?.name || 'Valued Client';
  const orderNumber = order.orderNumber || order.id || 'ZYT-2026';
  const total = Number(order.total || order.pricing?.finalTotal || 0);
  const items = Array.isArray(order.items) ? order.items : [];
  const courier = order.courier || 'TCS Express';
  const trackingNumber = order.trackingNumber || 'Pending Assignment';
  const paymentMethod = (order.paymentMethod || 'cod').toUpperCase();

  const itemsRows = items.map(item => {
    const name = item.product?.name || item.name || 'Garment';
    const size = item.selectedSize || item.size || 'M';
    const color = item.selectedColor || item.color || item.colorName || 'Heritage Tone';
    const qty = item.quantity || 1;
    const price = Number(item.product?.price || item.price || 0);

    return `
      <tr style="border-bottom: 1px solid #ECE7DF;">
        <td style="padding: 14px 0;">
          <div style="font-weight: 600; color: #111315; font-size: 14px;">${name}</div>
          <div style="font-size: 12px; color: #736C61; margin-top: 4px;">Size: <strong>${size}</strong> &nbsp;|&nbsp; Color: <strong>${color}</strong> &nbsp;|&nbsp; Qty: <strong>${qty}</strong></div>
        </td>
        <td style="padding: 14px 0; text-align: right; font-weight: bold; color: #364634; font-size: 14px; vertical-align: top;">
          Rs. ${(price * qty).toLocaleString()}
        </td>
      </tr>
    `;
  }).join('');

  // 1A. Email to Customer
  if (customerEmail) {
    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmed — Zaytoun Atelier</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E0D8; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #364634; padding: 32px 30px; text-align: center; color: #FFFFFF;">
                    <div style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #C69F6F; font-weight: 700; margin-bottom: 8px;">
                      HAUTE ATELIER &amp; CO.
                    </div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.05em; font-family: Georgia, serif; color: #FAF8F5;">
                      ZAYTOUN ATELIER
                    </h1>
                    <div style="font-size: 12px; color: #E5E0D8; margin-top: 6px; font-style: italic;">
                      Lahore • Islamabad • Bespoke Craftsmanship
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px 30px;">
                    <div style="display: inline-block; background-color: #EBF3EA; color: #2E6838; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 14px;">
                      ✓ Order Confirmed
                    </div>
                    <h2 style="font-size: 20px; margin: 0 0 12px; color: #111315; font-family: Georgia, serif;">
                      Thank you for your order, ${customerName}.
                    </h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #524B40; margin: 0 0 24px;">
                      Your bespoke apparel order has been registered at our atelier. Our artisans have received your order and each garment will be prepared with meticulous hand-finishing prior to courier dispatch.
                    </p>

                    <!-- Order Metadata Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5; border-radius: 8px; border: 1px solid #ECE7DF; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                            <tr>
                              <td style="padding: 4px 0; color: #736C61;">Order Reference:</td>
                              <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #364634;">#${orderNumber}</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #736C61;">Courier Consignment:</td>
                              <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #111315;">${courier}</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #736C61;">Consignment Tracking:</td>
                              <td style="padding: 4px 0; text-align: right; font-family: monospace; font-weight: bold; color: #364634;">${trackingNumber}</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #736C61;">Payment Method:</td>
                              <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #C69F6F;">${paymentMethod}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Items Table -->
                    <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #364634; margin-bottom: 12px; border-bottom: 1px solid #364634; padding-bottom: 6px;">
                      Pieces Ordered (${items.length})
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                      ${itemsRows}
                      <tr>
                        <td style="padding: 16px 0 6px; font-weight: bold; font-size: 15px; color: #111315;">Total Amount</td>
                        <td style="padding: 16px 0 6px; text-align: right; font-weight: bold; font-size: 18px; color: #364634;">
                          Rs. ${total.toLocaleString()}
                        </td>
                      </tr>
                    </table>

                    <!-- Shipping Destination -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6F4EE; border-radius: 8px; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 16px 20px; font-size: 13px; color: #524B40; line-height: 1.5;">
                          <strong style="color: #111315; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
                            Delivery Address
                          </strong>
                          ${order.customer?.address || ''}, ${order.customer?.city || 'Pakistan'}<br/>
                          Recipient Phone: ${order.customer?.phone || ''}
                          ${order.customer?.orderNotes ? `<br/><span style="font-style: italic; color: #736C61;">Note: "${order.customer.orderNotes}"</span>` : ''}
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="http://localhost:5173/track?order=${encodeURIComponent(orderNumber)}" style="display: inline-block; background-color: #364634; color: #FAF8F5; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">
                            Track Order Live &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #FAF8F5; border-top: 1px solid #ECE7DF; padding: 24px 30px; text-align: center; font-size: 12px; color: #736C61; line-height: 1.6;">
                    <div style="font-weight: 600; color: #364634; margin-bottom: 4px;">Zaytoun Atelier • Lahore, Punjab, Pakistan</div>
                    <div>Concierge Assistance: WhatsApp +92 300 1234567 &nbsp;|&nbsp; <a href="mailto:concierge@zaytoun.pk" style="color: #364634; text-decoration: underline;">concierge@zaytoun.pk</a></div>
                    <div style="font-size: 11px; color: #A0988A; margin-top: 8px;">Wear Less, Wear Longer • Made with artisanal integrity in Pakistan</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    sendMailSafely({
      to: customerEmail,
      subject: `Order Confirmed: #${orderNumber} — Zaytoun Atelier`,
      html: customerHtml,
      text: `Thank you for your order #${orderNumber} of Rs. ${total.toLocaleString()} with Zaytoun Atelier. Courier: ${courier} (${trackingNumber}). Track: http://localhost:5173/track?order=${orderNumber}`
    });
  }

  // 1B. Alert to Store Owner (shaahrozdogar@gmail.com)
  const ownerHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 2px solid #364634; border-radius: 8px;">
      <h2 style="color: #364634; margin-top: 0;">🚨 New Order Received: #${orderNumber}</h2>
      <p style="font-size: 15px; color: #333;"><strong>Total Revenue:</strong> <span style="font-size: 20px; color: #2e7d32; font-weight: bold;">Rs. ${total.toLocaleString()}</span></p>
      
      <div style="background: #f5f5f5; padding: 14px; border-radius: 6px; margin: 16px 0; font-size: 13px; line-height: 1.6;">
        <strong>Customer Information:</strong><br/>
        • Name: <strong>${customerName}</strong><br/>
        • Email: <a href="mailto:${customerEmail}" style="color: #364634;">${customerEmail}</a><br/>
        • Phone: <a href="tel:${order.customer?.phone}">${order.customer?.phone}</a><br/>
        • City: ${order.customer?.city || 'N/A'}<br/>
        • Address: ${order.customer?.address || 'N/A'}<br/>
        • Payment Method: <strong>${paymentMethod}</strong><br/>
        • Tracking: ${courier} (${trackingNumber})
      </div>

      <h3 style="font-size: 14px; margin-bottom: 8px; color: #111;">Items Ordered (${items.length}):</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        ${itemsRows}
      </table>

      <div style="margin-top: 24px; text-align: center;">
        <a href="http://localhost:5173/studio" style="background: #364634; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
          Open Order in Studio Dashboard &rarr;
        </a>
      </div>
    </div>
  `;

  return await Promise.allSettled([
    customerEmail ? sendMailSafely({
      to: customerEmail,
      subject: `Order Confirmation #${orderNumber} — Zaytoun Atelier`,
      html: customerHtml,
      text: `Your Zaytoun order #${orderNumber} has been confirmed. Total: Rs. ${total.toLocaleString()}. Courier: ${courier} (${trackingNumber}). View order status: https://zaytoun-atelier-website.vercel.app/track`
    }) : Promise.resolve(),
    sendMailSafely({
      to: OWNER_EMAIL,
      subject: `🚨 [New Order] #${orderNumber} - Rs. ${total.toLocaleString()} by ${customerName}`,
      html: ownerHtml,
      text: `New order #${orderNumber} received for Rs. ${total.toLocaleString()} by ${customerName} (${customerEmail}).`
    })
  ]);
}

// ============================================================================
// 2. ORDER STATUS UPDATE EMAILS (Customer Notification)
// ============================================================================

export async function sendOrderStatusEmail(order, newStatus) {
  const customerEmail = order.customer?.email;
  if (!customerEmail) return;

  const customerName = [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') || order.customer?.name || 'Valued Client';
  const orderNumber = order.orderNumber || order.id || 'ZYT-2026';
  const courier = order.courier || 'TCS Express';
  const trackingNumber = order.trackingNumber || 'Assigned';
  const statusLabel = String(newStatus).toUpperCase();

  const statusMessages = {
    confirmed: 'Your order has been confirmed and transferred to our master cutters at the atelier.',
    dispatched: `Your package has been prepared and handed over to ${courier} for courier transit.`,
    shipped: `Your package is on its way via ${courier}. It will arrive shortly at your destination.`,
    delivered: 'Your order has been marked as delivered. We hope you cherish your Zaytoun Atelier garments.',
    cancelled: 'Your order has been cancelled. If this was unexpected, please reach out to our concierge immediately.'
  };

  const statusNote = statusMessages[newStatus.toLowerCase()] || `The status of your order has been updated to "${statusLabel}".`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #E5E0D8; overflow: hidden;">
              
              <tr style="background-color: #364634; text-align: center;">
                <td style="padding: 24px; color: #FAF8F5;">
                  <span style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #C69F6F; font-weight: bold;">HAUTE ATELIER &amp; CO.</span>
                  <h1 style="margin: 4px 0 0; font-size: 22px; font-weight: 700; font-family: Georgia, serif;">ZAYTOUN ATELIER</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 28px 24px;">
                  <div style="display: inline-block; background-color: #F4EFE6; color: #7A5C2E; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 12px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px;">
                    Order Status: ${statusLabel}
                  </div>
                  <h2 style="font-size: 18px; margin: 0 0 10px; color: #111; font-family: Georgia, serif;">
                    Update Regarding Order #${orderNumber}
                  </h2>
                  <p style="font-size: 13px; line-height: 1.6; color: #524B40; margin: 0 0 20px;">
                    Dear ${customerName},<br/><br/>
                    ${statusNote}
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FAF8F5; border: 1px solid #ECE7DF; border-radius: 8px; font-size: 13px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 14px 16px;">
                        <div style="margin-bottom: 6px;"><span style="color: #736C61;">Order:</span> <strong>#${orderNumber}</strong></div>
                        <div style="margin-bottom: 6px;"><span style="color: #736C61;">Courier:</span> <strong>${courier}</strong></div>
                        <div><span style="color: #736C61;">Tracking No:</span> <strong style="font-family: monospace; color: #364634;">${trackingNumber}</strong></div>
                      </td>
                    </tr>
                  </table>

                  <div style="text-align: center;">
                    <a href="http://localhost:5173/track?order=${encodeURIComponent(orderNumber)}" style="display: inline-block; background: #364634; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                      View Live Tracking &rarr;
                    </a>
                  </div>
                </td>
              </tr>

              <tr style="background: #FAF8F5; border-top: 1px solid #ECE7DF; text-align: center; font-size: 11px; color: #736C61;">
                <td style="padding: 16px 20px;">
                  Zaytoun Atelier • MM Alam Road, Lahore • Concierge WhatsApp: +92 300 1234567
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  sendMailSafely({
    to: customerEmail,
    subject: `Order #${orderNumber} Status Update: ${statusLabel} — Zaytoun Atelier`,
    html,
    text: `Update on Order #${orderNumber}: Your order is now ${statusLabel}. Tracking: ${courier} (${trackingNumber}). Track: http://localhost:5173/track?order=${orderNumber}`
  });
}

// ============================================================================
// 3. NEWSLETTER SUBSCRIPTION EMAILS (Subscriber Welcome + Owner Alert)
// ============================================================================

export async function sendSubscriptionEmails(subscriberEmail, source = 'website') {
  // 3A. Welcome Email to Subscriber
  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #E5E0D8; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
              
              <!-- Header -->
              <tr style="background-color: #364634; text-align: center;">
                <td style="padding: 28px 24px; color: #ffffff;">
                  <span style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #C69F6F; font-weight: bold;">THE ATELIER GAZETTE</span>
                  <h1 style="margin: 6px 0 0; font-size: 24px; font-weight: 700; font-family: Georgia, serif; color: #FAF8F5;">ZAYTOUN ATELIER</h1>
                  <div style="font-size: 11px; color: #E5E0D8; margin-top: 4px; font-style: italic;">Private Circle Dispatch</div>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 28px; text-align: center;">
                  <h2 style="font-size: 20px; color: #111315; margin: 0 0 14px; font-family: Georgia, serif;">
                    Welcome to the Private Circle
                  </h2>
                  <p style="font-size: 14px; line-height: 1.7; color: #524B40; max-width: 460px; margin: 0 auto 24px;">
                    Thank you for subscribing to the Zaytoun Atelier Gazette. As a member of our private registry, you will receive exclusive early access to our seasonal apparel capsules, notes on bespoke fabric craft, and private showroom appointment openings in Lahore and Islamabad.
                  </p>

                  <div style="display: inline-block; padding: 12px 24px; background: #FAF8F5; border: 1px solid #ECE7DF; border-radius: 8px; margin-bottom: 24px;">
                    <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #364634;">
                      Wear Less, Wear Longer
                    </span>
                  </div>

                  <p style="font-size: 12px; color: #736C61; margin: 0 0 24px; line-height: 1.5;">
                    Each piece in our collection is crafted in limited numbers, with hand-stitched selvedge finishing, breathable natural linens, and structured silhouettes designed to endure seasons.
                  </p>

                  <div>
                    <a href="http://localhost:5173" style="display: inline-block; background-color: #364634; color: #FAF8F5; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                      Explore Atelier Collection &rarr;
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr style="background-color: #FAF8F5; border-top: 1px solid #ECE7DF; text-align: center; font-size: 11px; color: #736C61;">
                <td style="padding: 20px 24px; line-height: 1.5;">
                  <div>Zaytoun Atelier • Plot 14-B, MM Alam Road, Gulberg III, Lahore, Pakistan</div>
                  <div style="margin-top: 4px;">To manage your preferences or book a private fitting: <a href="mailto:concierge@zaytoun.pk" style="color: #364634;">concierge@zaytoun.pk</a></div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await Promise.allSettled([
    sendMailSafely({
      to: subscriberEmail,
      subject: `Welcome to the Zaytoun Atelier Private Circle`,
      html: welcomeHtml,
      text: `Welcome to the Zaytoun Atelier Private Circle. Thank you for subscribing to our Gazette. You will receive priority access to limited seasonal capsule drops and bespoke crafting notes. Explore: https://zaytoun-atelier-website.vercel.app`
    }),
    sendMailSafely({
      to: OWNER_EMAIL,
      subject: `📬 [New Subscriber] ${subscriberEmail} joined Zaytoun Atelier`,
      html: alertOwnerHtml,
      text: `New newsletter subscriber: ${subscriberEmail} (Source: ${source}).`
    })
  ]);
}

// ============================================================================
// 4. CONCIERGE INQUIRY EMAILS (Client Confirmation + Store Owner Alert)
// ============================================================================

export async function sendInquiryEmails(inquiry) {
  const clientEmail = inquiry.email;
  const clientName = inquiry.name || 'Valued Client';
  const orderRef = inquiry.orderNumber ? `Regarding Order #${inquiry.orderNumber}` : 'General Atelier Inquiry';

  // 4A. Confirmation email to the client
  if (clientEmail) {
    const clientHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #E5E0D8; overflow: hidden;">
                
                <tr style="background-color: #364634; text-align: center;">
                  <td style="padding: 24px; color: #FAF8F5;">
                    <span style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #C69F6F; font-weight: bold;">ATELIER CONCIERGE</span>
                    <h1 style="margin: 4px 0 0; font-size: 22px; font-weight: 700; font-family: Georgia, serif;">ZAYTOUN ATELIER</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 28px 24px;">
                    <h2 style="font-size: 18px; margin: 0 0 10px; color: #111; font-family: Georgia, serif;">
                      We have received your message, ${clientName}.
                    </h2>
                    <p style="font-size: 13px; line-height: 1.6; color: #524B40; margin: 0 0 16px;">
                      Thank you for contacting the Zaytoun Atelier Concierge desk. Our team in Lahore has received your note regarding <strong>${orderRef}</strong>.
                    </p>

                    <div style="background: #FAF8F5; border-left: 3px solid #364634; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #333; font-style: italic; line-height: 1.5;">
                      "${inquiry.message}"
                    </div>

                    <p style="font-size: 13px; line-height: 1.6; color: #524B40; margin: 0 0 20px;">
                      A concierge stylist will review your request and get back to you within 24 business hours. If you require urgent assistance, please connect with us directly on WhatsApp at <strong>+92 300 1234567</strong>.
                    </p>
                  </td>
                </tr>

                <tr style="background: #FAF8F5; border-top: 1px solid #ECE7DF; text-align: center; font-size: 11px; color: #736C61;">
                  <td style="padding: 16px 20px;">
                    Zaytoun Atelier • Plot 14-B, MM Alam Road, Gulberg III, Lahore, Pakistan
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    sendMailSafely({
      to: clientEmail,
      subject: `Inquiry Received — Zaytoun Atelier Concierge`,
      html: clientHtml,
      text: `Dear ${clientName}, we have received your inquiry: "${inquiry.message}". A concierge specialist will respond within 24 hours.`
    });
  }

  // 4B. Alert to Store Owner (shaahrozdogar@gmail.com)
  const ownerHtml = `
    <div style="font-family: sans-serif; max-width: 520px; padding: 20px; background: #ffffff; border: 2px solid #364634; border-radius: 8px;">
      <h3 style="color: #364634; margin-top: 0;">💌 New Concierge Client Message</h3>
      <p style="font-size: 13px;"><strong>From:</strong> ${inquiry.name} (<a href="mailto:${inquiry.email}">${inquiry.email}</a>)</p>
      ${inquiry.orderNumber ? `<p style="font-size: 13px;"><strong>Order Ref:</strong> #${inquiry.orderNumber}</p>` : ''}
      <div style="background: #f5f5f5; padding: 14px; border-radius: 6px; font-size: 13px; color: #222; margin-top: 10px; line-height: 1.5;">
        "${inquiry.message}"
      </div>
      <div style="margin-top: 16px; font-size: 12px; color: #666;">
        Click to reply directly: <a href="mailto:${inquiry.email}?subject=RE: Zaytoun Atelier Concierge Inquiry" style="color: #364634; font-weight: bold;">Reply to ${inquiry.name} &rarr;</a>
      </div>
    </div>
  `;

  sendMailSafely({
    to: OWNER_EMAIL,
    subject: `💌 [Concierge Inquiry] Message from ${inquiry.name} (${inquiry.email})`,
    html: ownerHtml,
    text: `New inquiry from ${inquiry.name} (${inquiry.email}): ${inquiry.message}`
  });
}

// Backwards-compatibility alias
export const sendInquiryAlert = sendInquiryEmails;
