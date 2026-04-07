import { redirect } from 'next/navigation';

export default function RootPage() {
  // Always redirect to the default locale (English in our case)
  redirect('/en');
}
