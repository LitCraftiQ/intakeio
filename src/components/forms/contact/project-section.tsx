import {
  BUDGET_OPTIONS,
  CONTACT_METHODS,
} from "@/lib/contacts/form-schema";

import { Field } from "./field";
import {
  FieldError,
  FieldLabel,
  TextArea,
  TextField,
} from "./form-fields";
import { Grid } from "./grid";
import { SectionTitle } from "./section-title";
import { SelectField } from "./select-field";
import type { ContactFormController } from
  "./use-contact-form";

type ProjectSectionProps = Readonly<{
  form: ContactFormController;
}>;

export function ProjectSection({
  form,
}: ProjectSectionProps) {
  const { values, errors, update } = form;

  return (
    <>
      <SectionTitle
        eyebrow="02 — Project"
        title="About the project"
        subtitle="Give us a clear picture of what you have in mind."
      />
      <Grid>
        <Field span={2}>
          <FieldLabel
            htmlFor="projectTitle"
            hint="Optional"
          >
            Project title
          </FieldLabel>
          <TextField
            id="projectTitle"
            placeholder="E‑commerce redesign for a fashion brand"
            value={values.projectTitle}
            invalid={!!errors.projectTitle}
            onChange={(event) =>
              update(
                "projectTitle",
                event.target.value,
              )
            }
          />
          <FieldError>
            {errors.projectTitle}
          </FieldError>
        </Field>

        <Field span={2}>
          <FieldLabel
            htmlFor="projectDescription"
            hint="Optional"
          >
            Project description
          </FieldLabel>
          <TextArea
            id="projectDescription"
            rows={4}
            placeholder="What are you building, and what does success look like?"
            value={values.projectDescription}
            invalid={!!errors.projectDescription}
            onChange={(event) =>
              update(
                "projectDescription",
                event.target.value,
              )
            }
          />
          <FieldError>
            {errors.projectDescription}
          </FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="budget" hint="Optional">
            Budget
          </FieldLabel>
          <SelectField
            id="budget"
            value={values.budget}
            onChange={(value) =>
              update("budget", value)
            }
            options={BUDGET_OPTIONS}
            placeholder="Select a budget range"
          />
        </Field>

        <Field>
          <FieldLabel
            htmlFor="contactMethod"
            hint="Optional"
          >
            Preferred contact method
          </FieldLabel>
          <SelectField
            id="contactMethod"
            value={values.preferredContactMethod}
            onChange={(value) =>
              update(
                "preferredContactMethod",
                value,
              )
            }
            options={CONTACT_METHODS}
            placeholder="Choose how we should reach you"
          />
        </Field>

        <Field span={2}>
          <FieldLabel
            htmlFor="meetingTime"
            hint="Optional"
          >
            Preferred meeting time
          </FieldLabel>
          <TextField
            id="meetingTime"
            placeholder="e.g. Weekdays, 10:00 – 14:00 GMT"
            value={values.preferredMeetingTime}
            onChange={(event) =>
              update(
                "preferredMeetingTime",
                event.target.value,
              )
            }
          />
        </Field>
      </Grid>
    </>
  );
}
