"use client";

import {
  Check,
  CheckCircle2,
  ChevronsUpDown,
  CircleAlert,
  Loader2,
  Search,
  Send,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { sendContactMessageAction } from "@/app/actions/(contact)/send-contact-message-action";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { countries, type Country } from "@/data/country-list";
import { ContactFormValues, contactSchema } from "@/schemas/contact-form-schema";

type FormErrors = Partial<Record<keyof ContactFormValues, string | undefined>>;

const initialValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  message: "",
};

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [countryOpen, setCountryOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedCountry = useMemo<Country | undefined>(
    () => countries.find((country) => country.code === values.country),
    [values.country],
  );

  const updateField = <K extends keyof ContactFormValues>(
    field: K,
    value: ContactFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    if (serverMessage) {
      setServerMessage("");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = contactSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FormErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (
          field === "firstName" ||
          field === "lastName" ||
          field === "email" ||
          field === "country" ||
          field === "message"
        ) {
          nextErrors[field] ??= issue.message;
        }
      }

      setErrors(nextErrors);
      setServerMessage("");
      return;
    }

    setErrors({});
    setServerMessage("");

    startTransition(async () => {
      const result = await sendContactMessageAction(parsed.data);

      if (result.success) {
        setSubmitted(true);
        setValues(initialValues);
        setErrors({});
        setServerMessage("");
        return;
      }

      setSubmitted(false);
      setServerMessage(result.message);
      setErrors({});
    });
  };

  const handleSendAnotherMessage = () => {
    setSubmitted(false);
    setValues(initialValues);
    setErrors({});
    setServerMessage("");
  };

  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-8 text-center shadow-sm ring-1 ring-border/30 backdrop-blur-sm sm:p-12 dark:border-border/60 dark:bg-card/40 dark:shadow-black/20 dark:ring-border/20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.035] via-transparent to-transparent dark:from-primary/[0.06]"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>

          <div className="mt-6 max-w-lg space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">INSIDER</p>

            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
              Message received
            </h2>

            <p className="text-base leading-7 text-muted-foreground">
              Thanks for getting in touch with INSIDER. Your message has been received, and our team
              will get back to you as soon as possible.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-8"
            onClick={handleSendAnotherMessage}
          >
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm ring-1 ring-border/30 backdrop-blur-sm sm:p-7 lg:p-8 dark:border-border/60 dark:bg-card/40 dark:shadow-black/20 dark:ring-border/20">
      {/* Subtle publication surface highlight */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.025] via-transparent to-transparent dark:from-primary/[0.045]"
        aria-hidden="true"
      />

      {/* Editorial accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        aria-hidden="true"
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative space-y-6"
        aria-label="Contact INSIDER"
      >
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Contact INSIDER
          </p>

          <p className="text-sm leading-6 text-muted-foreground">
            Have a question, story idea, correction, or something worth sharing? Send us a message.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>

            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="First name"
              autoComplete="given-name"
              value={values.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              className="bg-background/70 transition-colors focus-visible:bg-background dark:bg-background/30 dark:focus-visible:bg-background/50"
            />

            {errors.firstName && (
              <p id="firstName-error" className="text-sm text-destructive" role="alert">
                {errors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>

            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Last name"
              autoComplete="family-name"
              value={values.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              className="bg-background/70 transition-colors focus-visible:bg-background dark:bg-background/30 dark:focus-visible:bg-background/50"
            />

            {errors.lastName && (
              <p id="lastName-error" className="text-sm text-destructive" role="alert">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="bg-background/70 transition-colors focus-visible:bg-background dark:bg-background/30 dark:focus-visible:bg-background/50"
          />

          {errors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label id="country-label">Country</Label>

          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                aria-labelledby="country-label"
                aria-invalid={Boolean(errors.country)}
                aria-describedby={errors.country ? "country-error" : undefined}
                className="h-10 w-full justify-between bg-background/70 px-3 font-normal transition-colors hover:bg-background dark:bg-background/30 dark:hover:bg-background/50"
              >
                {selectedCountry ? (
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden="true">{selectedCountry.flag}</span>
                    <span className="truncate">{selectedCountry.name}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select your country</span>
                )}

                <ChevronsUpDown
                  className="ml-2 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="w-(--radix-popover-trigger-width) min-w-[280px] overflow-hidden p-0"
            >
              <Command>
                <div className="flex items-center border-b px-3">
                  <Search
                    className="mr-2 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <CommandInput
                    placeholder="Search countries..."
                    className="border-0 focus:ring-0"
                  />
                </div>

                <CommandList className="max-h-72">
                  <CommandEmpty>No country found.</CommandEmpty>

                  {countries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.code}`}
                      onSelect={() => {
                        updateField("country", country.code);
                        setCountryOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <span className="mr-2 text-base" aria-hidden="true">
                        {country.flag}
                      </span>

                      <span className="flex-1 truncate">{country.name}</span>

                      <Check
                        className={`ml-2 size-4 ${
                          values.country === country.code ? "opacity-100" : "opacity-0"
                        }`}
                        aria-hidden="true"
                      />
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {errors.country && (
            <p id="country-error" className="text-sm text-destructive" role="alert">
              {errors.country}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>

          <Textarea
            id="message"
            name="message"
            placeholder="Tell us how we can help, share a story idea, report an issue, or send feedback..."
            rows={7}
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            className="min-h-40 resize-y bg-background/70 transition-colors focus-visible:bg-background dark:bg-background/30 dark:focus-visible:bg-background/50"
          />

          <div className="flex items-center justify-between gap-4">
            {errors.message ? (
              <p id="message-error" className="text-sm text-destructive" role="alert">
                {errors.message}
              </p>
            ) : (
              <span />
            )}

            <span className="shrink-0 text-xs text-muted-foreground">
              {values.message.length}/5000
            </span>
          </div>
        </div>

        {serverMessage && (
          <div
            className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive dark:bg-destructive/10"
            role="alert"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />

            <p>{serverMessage}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-border/50">
          <p className="max-w-md text-xs leading-5 text-muted-foreground">
            Your information is used only to respond to your message and communicate with you about
            your inquiry.
          </p>

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-sm transition-shadow hover:shadow-md sm:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                Send message
                <Send className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
