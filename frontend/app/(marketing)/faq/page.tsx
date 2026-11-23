import DocPage from "@/components/features/landing/DocPage";
import Faq, { FAQ_GROUPS } from "@/components/features/landing/Faq";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/faq");

export default function Page() {
  return (
    <DocPage
      eyebrow="FAQ"
      title="Questions, answered."
      lead="Short answers about your account, training, the upsolve queue and email."
      sections={FAQ_GROUPS.map((group) => ({
        id: group.id,
        title: group.title,
        body: <Faq items={group.items} />,
      }))}
    />
  );
}
