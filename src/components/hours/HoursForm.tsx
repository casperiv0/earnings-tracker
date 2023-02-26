import { Month } from "@prisma/client";
import { Button } from "components/ui/Button";
import { Form } from "components/form/Form";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/Input";
import { Textarea } from "components/form/Textarea";
import { Modal } from "components/modal/Modal";
import { trpc } from "utils/trpc";
import z from "zod";
import { Loader } from "components/ui/Loader";
import type { Hour } from "src/pages/hours";

const schema = z.object({
  amount: z.number().min(1),
  date: z.date(),
  description: z.string().nullable().optional(),
  tag: z.string(),
});

interface Props {
  hour?: Hour | null;
  onSubmit?(): void;
}

export function HoursForm({ hour, onSubmit }: Props) {
  const context = trpc.useContext();
  const addHourMutation = trpc.hours.addHour.useMutation({
    onSuccess: () => {
      context.hours.getInfinitelyScrollableHours.invalidate();
    },
  });

  const editHourMutation = trpc.hours.editHour.useMutation({
    onSuccess: () => {
      context.hours.getInfinitelyScrollableHours.invalidate();
    },
  });

  const isLoading = addHourMutation.isLoading || editHourMutation.isLoading;

  const defaultValues = {
    amount: hour?.amount ?? 0,
    date: hour ? `${hour.date.year}-${getIdxFromMonth(hour.date.month)}-${hour.date.day}` : "",
    description: hour?.description ?? "",
    tag: hour?.tag ?? "",
  };

  async function handleSubmit(data: typeof defaultValues) {
    const date = new Date(data.date);

    if (hour) {
      await editHourMutation.mutateAsync({
        id: hour.id,
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        day: date.getDate(),
        description: data.description,
        tag: data.tag,
      });

      onSubmit?.();
    } else {
      await addHourMutation.mutateAsync({
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        day: date.getDate(),
        description: data.description,
        tag: data.tag,
      });

      onSubmit?.();
    }
  }

  return (
    <Form schema={schema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      {({ register, errors }) => (
        <>
          <FormField errorMessage={errors.amount} label="Amount">
            <Input className="font-mono" {...register("amount", { valueAsNumber: true })} />
          </FormField>

          <FormField errorMessage={errors.date} label="Date">
            <Input type="date" {...register("date", { valueAsDate: true })} />
          </FormField>

          <FormField errorMessage={errors.tag} label="Tag">
            <Input {...register("tag")} />
          </FormField>

          <FormField errorMessage={errors.description} label="Description">
            <Textarea {...register("description")} />
          </FormField>

          <footer className="mt-5 flex justify-end gap-2">
            <Modal.Close>
              <Button disabled={isLoading} type="reset">
                Cancel
              </Button>
            </Modal.Close>
            <Button className="flex items-center gap-2" disabled={isLoading} type="submit">
              {isLoading ? <Loader size="sm" /> : null}
              {hour ? "Save Changes" : "Add new hour log"}
            </Button>
          </footer>
        </>
      )}
    </Form>
  );
}

function getMonthFromIdx(idx: number): Month {
  const monthsArr = Object.values(Month);
  const month = monthsArr[idx]!;
  return Month[month];
}

function getIdxFromMonth(month: Month) {
  const monthsArr = Object.values(Month);
  const idx = monthsArr.indexOf(month) + 1;

  if (idx < 10) {
    return `0${idx}`;
  }

  return idx.toString();
}
