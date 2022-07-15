import { Subscription, SubscriptionType } from "@prisma/client";
import { Button } from "components/ui/Button";
import { Form } from "components/form/Form";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/Input";
import { Select } from "components/form/Select";
import { Textarea } from "components/form/Textarea";
import { Modal } from "components/modal/Modal";
import { trpc } from "utils/trpc";
import z from "zod";

const schema = z.object({
  type: z.nativeEnum(SubscriptionType),
  price: z.number().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
});

interface Props {
  subscription?: Subscription | null;
  onSubmit?(): void;
}

export function SubscriptionForm({ subscription, onSubmit }: Props) {
  const context = trpc.useContext();
  const addExpenseMutation = trpc.useMutation("subscriptions.add-subscription", {
    onSuccess: () => {
      context.invalidateQueries(["subscriptions.all-infinite"]);
    },
  });

  const editExpense = trpc.useMutation("subscriptions.edit-subscription", {
    onSuccess: () => {
      context.invalidateQueries(["subscriptions.all-infinite"]);
    },
  });

  const defaultValues = {
    type: subscription?.type ?? "Monthly",
    price: subscription?.price ?? 0,
    name: subscription?.name ?? "",
    description: subscription?.description ?? "",
  };

  async function handleSubmit(data: typeof defaultValues) {
    if (subscription) {
      await editExpense.mutateAsync({
        id: subscription.id,
        price: data.price,
        name: data.name,
        description: data.description,
        type: data.type,
      });

      onSubmit?.();
    } else {
      await addExpenseMutation.mutateAsync({
        price: data.price,
        description: data.description,
        name: data.name,
        type: data.type,
      });

      onSubmit?.();
    }
  }

  return (
    <Form schema={schema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      {({ register, errors }) => (
        <>
          <FormField errorMessage={errors.type} label="Type">
            <Select {...register("type")}>
              {Object.values(SubscriptionType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField errorMessage={errors.price} label="Price">
            <Input className="font-mono" {...register("price", { valueAsNumber: true })} />
          </FormField>

          <FormField errorMessage={errors.name} label="Name">
            <Input {...register("name")} />
          </FormField>

          <FormField errorMessage={errors.description} label="Description">
            <Textarea {...register("description")} />
          </FormField>

          <footer className="mt-5 flex justify-end gap-2">
            <Modal.Close>
              <Button type="reset">Cancel</Button>
            </Modal.Close>
            <Button type="submit">{subscription ? "Save Changes" : "Add new expense"}</Button>
          </footer>
        </>
      )}
    </Form>
  );
}
