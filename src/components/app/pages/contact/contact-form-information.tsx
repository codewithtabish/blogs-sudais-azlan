import { Mail, MapPin, Phone } from "lucide-react";

const contactItems = [
  {
    label: "Email",
    value: "tabish@codewithtabish.com",
    href: "mailto:tabish@codewithtabish.com",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "+92 316 9000919",
    href: "tel:+923169000919",
    icon: Phone,
  },
  {
    label: "Location",
    value: "Mardan, Khyber Pakhtunkhwa, Pakistan",
    href: "https://www.openstreetmap.org/?mlat=34.1988&mlon=72.0451#map=12/34.1988/72.0451",
    icon: MapPin,
  },
];

export function ContactInformation() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Get in touch
        </h2>

        <p className="max-w-xl text-base leading-7 text-muted-foreground">
          Have a story idea, editorial question, partnership opportunity, or something you think the
          INSIDER team should know about? We&apos;d be glad to hear from you.
        </p>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {contactItems.map((item) => {
          const Icon = item.icon;
          const isExternal = item.label === "Location";

          return (
            <a
              key={item.label}
              href={item.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group flex items-start gap-4 py-5 transition-colors hover:text-primary"
            >
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>

              <span className="min-w-0 space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </span>

                <span className="block wrap-break-word text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-base">
                  {item.value}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
