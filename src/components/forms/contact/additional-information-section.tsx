import { FieldLabel, TextArea } from "./form-fields";
import { SectionTitle } from "./section-title";
import type { ContactFormController } from
  "./use-contact-form";

type AdditionalInformationSectionProps =
  Readonly<{
    form: ContactFormController;
  }>;

export function AdditionalInformationSection({
  form,
}: AdditionalInformationSectionProps) {
  const { values, update } = form;

  return (
    <>
      <SectionTitle
        eyebrow="03 — More context"
        title="Additional information"
        subtitle="If you'd like to describe more about this project, add it below. This field is optional."
      />
      <FieldLabel
        htmlFor="additionalInformation"
        hint="Optional"
      >
        Anything else
      </FieldLabel>
      <TextArea
        id="additionalInformation"
        rows={7}
        placeholder="Timelines, references, technical constraints, existing assets, links…"
        value={values.additionalInformation}
        onChange={(event) =>
          update(
            "additionalInformation",
            event.target.value,
          )
        }
      />
    </>
  );
}
