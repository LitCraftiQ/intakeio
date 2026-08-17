import { Field } from "./field";
import {
  FieldError,
  FieldLabel,
  TextField,
} from "./form-fields";
import { Grid } from "./grid";
import { PhoneInput } from "./phone-input";
import { SectionTitle } from "./section-title";
import type { ContactFormController } from
  "./use-contact-form";

type AboutYouSectionProps = Readonly<{
  form: ContactFormController;
}>;

export function AboutYouSection({
  form,
}: AboutYouSectionProps) {
  const { values, errors, update } = form;

  return (
    <>
      <SectionTitle
        eyebrow="01 — About you"
        title="Contact details"
        subtitle="How we'll reach out and address you."
      />
      <Grid>
        <Field span={2}>
          <FieldLabel htmlFor="fullName" required>
            Full name
          </FieldLabel>
          <TextField
            id="fullName"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={values.fullName}
            invalid={!!errors.fullName}
            onChange={(event) =>
              update(
                "fullName",
                event.target.value,
              )
            }
          />
          <FieldError>{errors.fullName}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="email" required>
            Email address
          </FieldLabel>
          <TextField
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            invalid={!!errors.email}
            onChange={(event) =>
              update("email", event.target.value)
            }
          />
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="phone" hint="Optional">
            Phone number
          </FieldLabel>
          <PhoneInput
            id="phone"
            countryCode={values.phoneCountry}
            onCountryChange={(code) =>
              update("phoneCountry", code)
            }
            value={values.phoneNational}
            onValueChange={(value) =>
              update("phoneNational", value)
            }
            invalid={!!errors.phoneNational}
          />
          <FieldError>
            {errors.phoneNational}
          </FieldError>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="telegramUsername"
            hint="Optional"
          >
            Telegram username
          </FieldLabel>
          <TextField
            id="telegramUsername"
            placeholder="@johndoe"
            value={values.telegramUsername}
            invalid={!!errors.telegramUsername}
            onChange={(event) =>
              update(
                "telegramUsername",
                event.target.value,
              )
            }
          />
          <FieldError>
            {errors.telegramUsername}
          </FieldError>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="companyName"
            hint="Optional"
          >
            Company name
          </FieldLabel>
          <TextField
            id="companyName"
            autoComplete="organization"
            placeholder="Acme Inc."
            value={values.companyName}
            onChange={(event) =>
              update(
                "companyName",
                event.target.value,
              )
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="website" hint="Optional">
            Website
          </FieldLabel>
          <TextField
            id="website"
            type="url"
            autoComplete="url"
            placeholder="https://yourweb.com"
            value={values.website}
            invalid={!!errors.website}
            onChange={(event) =>
              update("website", event.target.value)
            }
          />
          <FieldError>{errors.website}</FieldError>
        </Field>
      </Grid>
    </>
  );
}
