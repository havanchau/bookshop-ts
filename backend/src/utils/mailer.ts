import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.example.com', // Thay thế bằng host SMTP của bạn
    port: 587, // Thường là 587 hoặc 465 cho SSL
    secure: false, // true cho 465, false cho các cổng khác
    auth: {
        user: 'your_email@example.com', // Thay thế bằng email của bạn
        pass: 'your_password' // Thay thế bằng mật khẩu của bạn
    }
});

export const sendMail = async (to: string, subject: string, text: string, html: string) => {
    const mailOptions = {
        from: 'your_email@example.com', // Thay thế bằng email của bạn
        to,
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ' + error);
    }
};
