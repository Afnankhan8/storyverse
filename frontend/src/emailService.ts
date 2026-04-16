import emailjs from '@emailjs/browser';

const SERVICE_ID  = 'service_fpnjn9b';
const TEMPLATE_ID = 'template_asf7d5o';
const PUBLIC_KEY  = 'MEWWmNA-OGalCRPtX';

export const sendEmail = async (
  email: string,
  name: string,
  type: 'login' | 'signup'
): Promise<void> => {
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: email,
        to_name: name,
        subject: type === 'signup' ? 'Welcome to ComixNova 🎉' : 'Thanks for logging in!',
        message: type === 'signup'
          ? `Hi ${name}, welcome to ComixNova! Your comic journey starts now. 🚀`
          : `Hi ${name}, thanks for logging in to ComixNova!`,
      },
      PUBLIC_KEY
    );
  } catch (err) {
    console.warn('Email sending failed:', err);
    // Don't block auth flow if email fails
  }
};