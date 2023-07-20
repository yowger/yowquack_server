const nodemailer = require("nodemailer")
const MY_EMAIL = process.env.MY_EMAIL
const MY_PASSWORD = process.env.MY_PASSWORD

async function sendEmail(recipientEmail, subject, message) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MY_EMAIL,
                pass: MY_PASSWORD,
            },
        })

        await transporter.sendMail({
            from: MY_EMAIL,
            to: recipientEmail,
            subject: subject,
            html: message,
        })

        return true
    } catch (error) {
        return false
    }
}

module.exports = { sendEmail }
