const sgMail = require('@sendgrid/mail');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate PDF voucher
async function generateVoucher(reservation) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `voucher-${reservation.reservationId}.pdf`;
        const filepath = path.join(__dirname, '../temp', filename);

        // Ensure temp directory exists
        if (!fs.existsSync(path.join(__dirname, '../temp'))) {
            fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(24)
            .fillColor('#0B3D5D')
            .text('KONCHAMAR RESORT', { align: 'center' })
            .moveDown(0.5);

        doc.fontSize(14)
            .fillColor('#D4AF37')
            .text('Reservation Confirmation', { align: 'center' })
            .moveDown(2);

        // Reservation Details
        doc.fontSize(12)
            .fillColor('#2C2C2C')
            .text(`Reservation ID: ${reservation.reservationId}`, { bold: true })
            .moveDown(0.5);

        doc.text(`Guest Name: ${reservation.guestDetails.name}`)
            .moveDown(0.5);

        doc.text(`Check-in: ${new Date(reservation.dates.checkIn).toLocaleDateString()}`)
            .moveDown(0.5);

        doc.text(`Check-out: ${new Date(reservation.dates.checkOut).toLocaleDateString()}`)
            .moveDown(0.5);

        doc.text(`Nights: ${reservation.dates.nights}`)
            .moveDown(0.5);

        doc.text(`Guests: ${reservation.guests}`)
            .moveDown(0.5);

        doc.text(`Accommodation: ${reservation.accommodationId.name}`)
            .moveDown(1);

        // Pricing
        doc.fontSize(14)
            .fillColor('#0B3D5D')
            .text('Payment Summary', { underline: true })
            .moveDown(0.5);

        doc.fontSize(11)
            .fillColor('#2C2C2C')
            .text(`Subtotal: $${reservation.pricing.subtotal.toFixed(2)}`)
            .text(`Tax: $${reservation.pricing.tax.toFixed(2)}`)
            .text(`Resort Fee: $${reservation.pricing.resortFee.toFixed(2)}`)
            .moveDown(0.5);

        doc.fontSize(14)
            .fillColor('#D4AF37')
            .text(`Total Paid: $${reservation.pricing.total.toFixed(2)}`, { bold: true })
            .moveDown(2);

        // Check-in Information
        doc.fontSize(12)
            .fillColor('#0B3D5D')
            .text('Check-in Information', { underline: true })
            .moveDown(0.5);

        doc.fontSize(10)
            .fillColor('#2C2C2C')
            .text('Check-in time: 3:00 PM')
            .text('Check-out time: 11:00 AM')
            .text('Location: Playa El Majahual, La Libertad, El Salvador')
            .moveDown(1);

        // Contact Information
        doc.fontSize(12)
            .fillColor('#0B3D5D')
            .text('Contact Us', { underline: true })
            .moveDown(0.5);

        doc.fontSize(10)
            .fillColor('#2C2C2C')
            .text('Phone: +503 2345-6789')
            .text('WhatsApp: +503 7890-1234')
            .text('Email: reservations@konchamar.com')
            .moveDown(2);

        // Footer
        doc.fontSize(9)
            .fillColor('#999')
            .text('Thank you for choosing Konchamar Resort!', { align: 'center' })
            .text('We look forward to welcoming you.', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
            resolve(filepath);
        });

        stream.on('error', reject);
    });
}

// Send confirmation email
async function sendConfirmationEmail(reservation, recipientEmail) {
    try {
        // Generate voucher PDF
        const voucherPath = await generateVoucher(reservation);
        const voucherContent = fs.readFileSync(voucherPath).toString('base64');

        const msg = {
            to: recipientEmail,
            from: process.env.FROM_EMAIL,
            subject: `Booking Confirmed - Konchamar Resort (${reservation.reservationId})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0B3D5D 0%, #D4AF37 100%); padding: 40px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
                    </div>

                    <div style="padding: 40px; background: #f5f5f5;">
                        <h2 style="color: #0B3D5D;">Dear ${reservation.guestDetails.name},</h2>

                        <p style="font-size: 16px; color: #2C2C2C; line-height: 1.6;">
                            Thank you for choosing Konchamar Resort! We're delighted to confirm your reservation.
                        </p>

                        <div style="background: white; padding: 30px; border-radius: 10px; margin: 30px 0;">
                            <h3 style="color: #D4AF37; margin-top: 0;">Reservation Details</h3>

                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Reservation ID:</strong></td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.reservationId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Accommodation:</strong></td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.accommodationId.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Check-in:</strong></td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${new Date(reservation.dates.checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Check-out:</strong></td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${new Date(reservation.dates.checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Nights:</strong></td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.dates.nights}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.guests}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;"><strong>Total Paid:</strong></td>
                                    <td style="padding: 10px 0; color: #D4AF37; font-size: 18px; font-weight: bold;">$${reservation.pricing.total.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="background: #0B3D5D; color: white; padding: 20px; border-radius: 10px; margin: 30px 0;">
                            <h3 style="margin-top: 0; color: #D4AF37;">Local Attractions</h3>
                            <ul style="line-height: 1.8;">
                                <li>Playa El Tunco - World-class surfing (5 km)</li>
                                <li>Playa El Sunzal - Scenic beach (3 km)</li>
                                <li>Local restaurants and surf shops nearby</li>
                                <li>Surf lessons available on-site</li>
                            </ul>
                        </div>

                        <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #D4AF37;">
                            <h4 style="margin-top: 0; color: #0B3D5D;">Need Assistance?</h4>
                            <p style="margin: 0; color: #2C2C2C;">
                                <strong>Phone:</strong> +503 2345-6789<br>
                                <strong>WhatsApp:</strong> +503 7890-1234<br>
                                <strong>Email:</strong> reservations@konchamar.com
                            </p>
                        </div>

                        <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
                            Your voucher is attached to this email. Please present it upon check-in.
                        </p>
                    </div>

                    <div style="background: #2C2C2C; padding: 20px; text-align: center; color: white;">
                        <p style="margin: 0; font-size: 12px;">
                            © 2025 Konchamar Resort. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    content: voucherContent,
                    filename: `Konchamar-Voucher-${reservation.reservationId}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment'
                }
            ]
        };

        await sgMail.send(msg);

        // Clean up voucher file
        fs.unlinkSync(voucherPath);

        console.log(`Confirmation email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}

// Send contact form email
async function sendContactEmail(name, email, phone, message) {
    try {
        const msg = {
            to: process.env.ADMIN_EMAIL,
            from: process.env.FROM_EMAIL,
            replyTo: email,
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0B3D5D;">New Contact Form Submission</h2>

                    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                        <p><strong>Message:</strong></p>
                        <p style="background: white; padding: 15px; border-radius: 5px;">${message}</p>
                    </div>

                    <p style="color: #666; font-size: 12px;">
                        This email was sent from the Konchamar Resort contact form.
                    </p>
                </div>
            `
        };

        await sgMail.send(msg);
        console.log(`Contact form email sent from ${email}`);
        return true;
    } catch (error) {
        console.error('Contact email error:', error);
        return false;
    }
}

module.exports = {
    sendConfirmationEmail,
    sendContactEmail,
    generateVoucher
};
