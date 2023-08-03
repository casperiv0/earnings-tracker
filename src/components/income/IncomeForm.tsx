import { IncomeType, Month } from "@prisma/client";
import { Button } from "components/ui/Button";
import { Form } from "components/form/Form";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/Input";
import { Select } from "components/form/Select";
import { Textarea } from "components/form/Textarea";
import { Loader } from "components/ui/Loader";
import { Modal } from "components/modal/Modal";
import type { Income } from "src/pages/income";
import { trpc } from "utils/trpc";
import z from "zod";

const schema = z.object({
  type: z.nativeEnum(IncomeType),
  amount: z.number().min(1),
  date: z.date(),
  description: z.string().nullish(),
});

interface Props {
  income?: Income | null;
  onSubmit?(): void;
}

export function IncomeForm({ income, onSubmit }: Props) {
  const context = trpc.useContext();

  const addIncome = trpc.income.addIncome.useMutation({
    onSuccess: () => {
      context.income.getInfiniteScrollableIncome.invalidate();
    },
  });

  const editIncome = trpc.income.editIncome.useMutation({
    onSuccess: () => {
      context.income.getInfiniteScrollableIncome.invalidate();
    },
  });

  const isLoading = editIncome.isLoading || addIncome.isLoading;

  const defaultValues = {
    type: income?.type ?? IncomeType.Other,
    amount: income?.amount ?? 0,
    date: income ? `${income.date.year}-${getIdxFromMonth(income.date.month)}-01` : "",
    description: income?.description ?? "",
  };

  async function handleSubmit(data: typeof defaultValues) {
    const date = new Date(data.date);

    const defaultMutationData = {
      amount: data.amount,
      month: getMonthFromIdx(date.getMonth()),
      year: date.getFullYear(),
      description: data.description,
      type: data.type,
    };

    if (income) {
      await editIncome.mutateAsync({
        id: income.id,
        ...defaultMutationData,
      });

      onSubmit?.();
    } else {
      await addIncome.mutateAsync(defaultMutationData);

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

          <FormField errorMessage={errors.type} label="Type">
            <Select {...register("type")}>
              {Object.values(IncomeType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField errorMessage={errors.date} label="Date">
            <Input type="date" {...register("date", { valueAsDate: true })} />
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
              {income ? "Save Changes" : "Add new income"}
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
