// Sample data for the webinar checklist app

export const clients = [
  {
    id: 'C001',
    name: 'ABC Coaching',
    coachName: 'Priya Singh',
    whatsappGroup: 'https://chat.whatsapp.com/xyz',
    landingPage: 'https://abc.com/webinar',
    zoomEmail: 'zoom1@abc.com',
  },
  {
    id: 'C002',
    name: 'XYZ Academy',
    coachName: 'Rajesh Kumar',
    whatsappGroup: 'https://chat.whatsapp.com/abc',
    landingPage: 'https://xyz.com/webinar',
    zoomEmail: 'zoom2@xyz.com',
  },
  {
    id: 'C003',
    name: 'PQR Institute',
    coachName: 'Maya Patel',
    whatsappGroup: 'https://chat.whatsapp.com/def',
    landingPage: 'https://pqr.com/webinar',
    zoomEmail: 'zoom3@pqr.com',
  },
];

// Keep this list and the team in scripts/gen-auth.mjs in step: the email is
// what ties a person here to the account they sign in with.
export const teamMembers = [
  {
    id: 'T001',
    name: 'Pawan',
    role: 'Team Lead',
    email: 'pawan@sabhi.com',
  },
  {
    id: 'T002',
    name: 'Aditya Sankhla',
    role: 'Coordinator',
    email: 'aditya@sabhi.com',
  },
  {
    id: 'T003',
    name: 'Jatin',
    role: 'Coordinator',
    email: 'jatin@sabhi.com',
  },
  {
    id: 'T004',
    name: 'Lalita',
    role: 'Webinar Operator',
    email: 'lalita@sabhi.com',
  },
  {
    id: 'T005',
    name: 'Khushwant',
    role: 'Webinar Operator',
    email: 'khushwant@sabhi.com',
  },
  {
    id: 'T006',
    name: 'Sanu',
    role: 'Webinar Operator',
    email: 'sanu@sabhi.com',
  },
  {
    id: 'T007',
    name: 'Minal',
    role: 'Webinar Operator',
    email: 'minal@sabhi.com',
  },
];

export const steps = [
  { number: 1, name: 'Check Scheduling Sheet' },
  { number: 2, name: 'Zoom Account Setup' },
  { number: 3, name: 'Zoom Registration Form' },
  { number: 4, name: 'Update Google Sheet' },
  { number: 5, name: 'Verify Landing Page' },
  { number: 6, name: 'Verify Thank You Page' },
  { number: 7, name: 'Team Entry (Task Assignment)' },
  { number: 8, name: 'Check Free Webinar Sheet' },
  { number: 9, name: 'WhatsApp Confirmation Message' },
  { number: 10, name: 'Prepare Data (CSV)' },
  { number: 11, name: 'Import Contacts into App Bot' },
  { number: 12, name: 'WhatsApp Nurture Campaign' },
  { number: 13, name: 'Schedule Reminder Messages (2hr)' },
  { number: 14, name: 'Schedule Reminder Messages (1hr)' },
  { number: 15, name: 'Schedule Reminder Messages (Live)' },
  { number: 16, name: 'Schedule Reminder Messages (15min after)' },
  { number: 17, name: 'Schedule Call Reminders (1hr before)' },
  { number: 18, name: 'Schedule Call Reminders (10min before)' },
  { number: 19, name: 'Final Pre-Webinar Checklist (2 hrs before)' },
  { number: 20, name: 'Final Pre-Webinar Checklist (1 hr before)' },
  { number: 21, name: 'Final Pre-Webinar Checklist (15 mins before)' },
  { number: 22, name: 'Send "We\'re Live" Message' },
  { number: 23, name: 'Monitor Webinar Registrations' },
  { number: 24, name: 'Track Attendees Joining' },
  { number: 25, name: 'Verify Recording Saving' },
  { number: 26, name: 'Post-Webinar: Check Zoom Recording' },
  { number: 27, name: 'Post-Webinar: Verify Scheduling Sheet' },
  { number: 28, name: 'Post-Webinar: Verify Landing Page' },
  { number: 29, name: 'Post-Webinar: Check Free Webinar Sheet' },
  { number: 30, name: 'Post-Webinar: Verify Campaigns Sent' },
  { number: 31, name: 'Post-Webinar: Document Issues' },
  { number: 32, name: 'Post-Webinar: Add to History' },
];
