import { redirect } from 'next/navigation';

export default async function LocaleRootPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  
  // For now, redirect users to the tutor page which is our main AI feature.
  // In the future, we can add a proper Dashboard here.
  redirect(`/${locale}/tutor`);
}
