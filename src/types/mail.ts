export interface MailSender {
  name: string;
  address: string;
}

export interface MailMessage {
  id: string;
  subject: string;
  sender: MailSender;
  receivedDateTime: string;
  isRead: boolean;
  bodyPreview: string;
  webLink: string;
}

export interface MailDetail extends MailMessage {
  body: string;
  bodyContentType: 'html' | 'text';
}

export interface MailPage {
  messages: MailMessage[];
  nextLink?: string;
}
