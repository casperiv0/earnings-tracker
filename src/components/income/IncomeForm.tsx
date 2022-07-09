import { Month } from "@prisma/client";
import { Button } from "components/Button";
import { Form } from "components/form/Form";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/Input";
import { Textarea } from "components/form/Textarea";
import { Modal } from "components/modal/Modal";
import type { Income } from "src/pages/income";
import { trpc } from "utils/trpc";
import z from "zod";

const schema = z.object({
  amount: z.number().min(1),
  date: z.date(),
  description: z.string().nullable().optional(),
});

interface Props {
  income?: Income | null;
  onSubmit?(): void;
}

export function IncomeForm({ income, onSubmit }: Props) {
  const context = trpc.useContext();
  const addIncome = trpc.useMutation("income.add-income", {
    onSuccess: () => {
      context.invalidateQueries(["income.all-infinite"]);
    },
  });

  const editIncome = trpc.useMutation("income.edit-income", {
    onSuccess: () => {
      context.invalidateQueries(["income.all-infinite"]);
    },
  });

  const defaultValues = {
    amount: income?.amount ?? 0,
    date: income ? `${income.date.year}-${getIdxFromMonth(income.date.month)}-01` : "",
    description: income?.description ?? "",
  };

  async function handleSubmit(data: typeof defaultValues) {
    const date = new Date(data.date);

    if (income) {
      await editIncome.mutateAsync({
        id: income.id,
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        description: data.description,
      });

      onSubmit?.();
    } else {
      await addIncome.mutateAsync({
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        description: data.description,
      });

      onSubmit?.();
    }
  }

  return (
    <Form schema={schema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      {({ register, errors }) => (
        <>
          <FormField errorMessage={errors.amount} label="Amount">
            <Input {...register("amount", { valueAsNumber: true })} />
          </FormField>

          <FormField errorMessage={errors.date} label="Date">
            <Input type="date" {...register("date", { valueAsDate: true })} />
          </FormField>

          <FormField errorMessage={errors.description} label="Description">
            <Textarea {...register("description")} />
          </FormField>

          <footer className="mt-5 flex justify-end gap-2">
            <Modal.Close>
              <Button type="reset">Cancel</Button>
            </Modal.Close>
            <Button type="submit">{income ? "Save Changes" : "Add new income"}</Button>
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
