import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

export type AppointmentEmailKind =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "reminder"

export interface AppointmentEmailProps {
  kind: AppointmentEmailKind
  locale: "en" | "ar"
  patientName: string
  doctorName: string
  specialty: string
  dateLabel: string  // already formatted by the caller
  timeLabel: string
  appointmentUrl: string
}

const COPY: Record<
  AppointmentEmailKind,
  { en: { heading: string; body: string }; ar: { heading: string; body: string } }
> = {
  pending: {
    en: {
      heading: "Booking received",
      body: "We've received your appointment request with {doctor} ({specialty}) on {date} at {time}. The hospital will confirm it shortly.",
    },
    ar: {
      heading: "تم استلام الحجز",
      body: "استلمنا طلب حجزك مع {doctor} ({specialty}) في {date} الساعة {time}. سيقوم المستشفى بتأكيده قريباً.",
    },
  },
  confirmed: {
    en: {
      heading: "Your appointment is confirmed",
      body: "Your appointment with {doctor} ({specialty}) on {date} at {time} has been confirmed. We look forward to seeing you.",
    },
    ar: {
      heading: "تم تأكيد موعدك",
      body: "تم تأكيد موعدك مع {doctor} ({specialty}) في {date} الساعة {time}. نتطلع لرؤيتك.",
    },
  },
  cancelled: {
    en: {
      heading: "Appointment cancelled",
      body: "Your appointment with {doctor} ({specialty}) on {date} at {time} has been cancelled. You can book another one anytime.",
    },
    ar: {
      heading: "تم إلغاء الموعد",
      body: "تم إلغاء موعدك مع {doctor} ({specialty}) في {date} الساعة {time}. يمكنك حجز موعد آخر في أي وقت.",
    },
  },
  reminder: {
    en: {
      heading: "Appointment reminder",
      body: "Just a reminder: your appointment with {doctor} ({specialty}) is at {time} on {date}.",
    },
    ar: {
      heading: "تذكير بالموعد",
      body: "تذكير بسيط: موعدك مع {doctor} ({specialty}) الساعة {time} في {date}.",
    },
  },
}

const STRINGS = {
  en: { greeting: "Hi {name},", signoff: "— MediBook", cta: "View appointment" },
  ar: { greeting: "مرحباً {name}،", signoff: "— ميدي بوك", cta: "عرض الموعد" },
}

function fmt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}

export default function AppointmentEmail(props: AppointmentEmailProps) {
  const { kind, locale, patientName, doctorName, specialty, dateLabel, timeLabel, appointmentUrl } = props
  const dir = locale === "ar" ? "rtl" : "ltr"
  const copy = COPY[kind][locale]
  const s = STRINGS[locale]

  const vars = { name: patientName, doctor: doctorName, specialty, date: dateLabel, time: timeLabel }
  const heading = copy.heading
  const body = fmt(copy.body, vars)
  const greeting = fmt(s.greeting, vars)

  return (
    <Html lang={locale} dir={dir}>
      <Head />
      <Preview>{heading}</Preview>
      <Body style={{ backgroundColor: "#f6f7f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Container style={{ maxWidth: 560, margin: "32px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32 }}>
          <Heading as="h2" style={{ margin: "0 0 12px", fontSize: 22, color: "#0f172a" }}>
            {heading}
          </Heading>
          <Text style={{ margin: "0 0 16px", color: "#334155", fontSize: 15 }}>{greeting}</Text>
          <Text style={{ margin: "0 0 24px", color: "#334155", fontSize: 15, lineHeight: 1.6 }}>{body}</Text>
          <Section style={{ textAlign: "center", margin: "16px 0 24px" }}>
            <Link
              href={appointmentUrl}
              style={{
                display: "inline-block",
                padding: "12px 22px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              {s.cta}
            </Link>
          </Section>
          <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0" }} />
          <Text style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{s.signoff}</Text>
        </Container>
      </Body>
    </Html>
  )
}
