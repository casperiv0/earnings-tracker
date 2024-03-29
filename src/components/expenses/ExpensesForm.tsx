import { ExpenseTag, Month } from "@prisma/client";
import { Button } from "components/ui/Button";
import { Form } from "components/form/Form";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/Input";
import { Textarea } from "components/form/Textarea";
import { Modal } from "components/modal/Modal";
import type { Expense, ProcessedExpense } from "src/pages/expenses";
import { trpc } from "utils/trpc";
import z from "zod";
import { Loader } from "components/ui/Loader";
import { Toggle } from "components/form/Toggle";
import { Select } from "components/form/Select";

const schema = z.object({
  amount: z.number().min(0.01),
  date: z.date(),
  description: z.string().nullish(),
  tag: z.nativeEnum(ExpenseTag).nullish(),
  processOverXDays: z.object({ dailyAmount: z.number().min(2), enabled: z.boolean() }).nullish(),
});

interface Props {
  expense?: Expense | ProcessedExpense | null;
  onSubmit?(): void;
}

export function ExpensesForm({ expense, onSubmit }: Props) {
  const utils = trpc.useUtils();
  const addExpenseMutation = trpc.expenses.addExpense.useMutation({
    onSuccess: () => {
      utils.expenses.getInfinitelyScrollableExpenses.invalidate();
    },
  });

  const editExpense = trpc.expenses.editExpense.useMutation({
    onSuccess: () => {
      utils.expenses.getInfinitelyScrollableExpenses.invalidate();
    },
  });

  const isLoading = addExpenseMutation.isPending || editExpense.isPending;
  const isProcessed = isProcessedExpense(expense);

  const defaultValues = {
    amount: isProcessed ? expense.totalAmount : expense?.amount ?? 0,
    date: expense ? `${expense.date.year}-${getIdxFromMonth(expense.date.month)}-01` : "",
    description: expense?.description ?? "",
    tag: isProcessed ? null : expense?.tag ?? null,
    processOverXDays: isProcessed
      ? { enabled: true, dailyAmount: expense.amountPerDay }
      : { enabled: false, dailyAmount: 2 },
  };

  async function handleSubmit(data: typeof defaultValues) {
    const date = new Date(data.date);

    if (expense) {
      await editExpense.mutateAsync({
        id: expense.id,
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        day: date.getDate(),
        description: data.description,
        processOverXDays: data.processOverXDays,
        tag: data.tag,
      });

      onSubmit?.();
    } else {
      await addExpenseMutation.mutateAsync({
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        day: date.getDate(),
        description: data.description,
        processOverXDays: data.processOverXDays,
        tag: data.tag,
      });

      onSubmit?.();
    }
  }

  return (
    <Form schema={schema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      {({ register, errors, watch }) => {
        const isToggled = watch("processOverXDays").enabled;

        return (
          <>
            <FormField errorMessage={errors.amount} label="Amount">
              <Input className="font-mono" {...register("amount", { valueAsNumber: true })} />
            </FormField>

            <FormField errorMessage={errors.date} label="Date">
              <Input type="date" {...register("date", { valueAsDate: true })} />
            </FormField>

            <FormField errorMessage={errors.description} label="Description">
              <Textarea {...register("description")} />
            </FormField>

            <FormField optional errorMessage={errors.tag} label="Tag">
              <Select {...register("tag", { required: true })}>
                {Object.values(ExpenseTag).map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              errorMessage={errors.processOverXDays as any}
              label="Process payment of multiple days"
            >
              <Toggle
                value={isToggled}
                {...register("processOverXDays.enabled", {
                  setValueAs(value) {
                    return Boolean(value);
                  },
                })}
              />

              {isToggled ? (
                <FormField className="mt-2 ml-2" label="Amount per day">
                  <Input
                    className="font-mono"
                    type="number"
                    min={2}
                    {...register("processOverXDays.dailyAmount", { valueAsNumber: true })}
                  />
                </FormField>
              ) : null}
            </FormField>

            <footer className="mt-5 flex justify-end gap-2">
              <Modal.Close>
                <Button disabled={isLoading} type="reset">
                  Cancel
                </Button>
              </Modal.Close>
              <Button className="flex items-center gap-2" disabled={isLoading} type="submit">
                {isLoading ? <Loader size="sm" /> : null}
                {expense ? "Save Changes" : "Add new expense"}
              </Button>
            </footer>
          </>
        );
      }}
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

export function isProcessedExpense(
  expense: Pick<Expense, "id"> | ProcessedExpense | null | undefined,
): expense is ProcessedExpense {
  return Boolean(expense && "amountPerDay" in expense);
}
