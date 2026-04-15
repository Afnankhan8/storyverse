import emailjs from '@emailjs/browser';

export const sendEmail = async (
  email: string,
  name: string,
  type: string
) => {
  try {
    await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: email,
        user_name: name,
        message:
          type === 'login'
            ? 'Login successful'
            : 'Signup successful',
      },
      'YOUR_PUBLIC_KEY'
    );
  } catch (error) {
    console.log(error);
  }
};