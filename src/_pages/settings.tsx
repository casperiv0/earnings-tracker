import * as React from "react";
import { Button } from "components/ui/Button";
import { Form } from "components/form/Form";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/Input";
import { trpc } from "utils/trpc";
import { Modal } from "components/modal/Modal";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { PageHeader } from "components/ui/PageHeader";
import { Loader } from "components/ui/Loader";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = React.useState(false);

  const sessionQuery = trpc.user.getSession.useQuery();
  const deleteUserMutation = trpc.user.deleteUser.useMutation();
  const updateUserConfigurationMutation = trpc.user.updateUserConfiguration.useMutation();

  const user = sessionQuery.data?.user;

  function handleLogout() {
    signOut({ callbackUrl: "/login" });
  }

  async function handleConfigurationSubmit(values: typeof configurationDefaultValues) {
    await updateUserConfigurationMutation.mutateAsync({
      maxYearlyIncome: values.maxYearlyIncome ? values.maxYearlyIncome : null,
      maxYearlyHours: values.maxYearlyHours ? values.maxYearlyHours : null,
    });
  }

  async function handleDeleteUser(e: React.FormEvent) {
    e.preventDefault();

    await deleteUserMutation.mutateAsync();
    handleLogout();
  }

  if (!user) {
    return null;
  }

  const configurationDefaultValues = {
    maxYearlyIncome: user.configuration?.maxYearlyIncome,
    maxYearlyHours: user.configuration?.maxYearlyHours,
  };

  const defaultValues = {
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
  };

  return (
    <div className="m-8 mx-5 md:mx-10mx-10 h-full">
      <PageHeader
        title="Settings"
        description="View your account settings. This information is managed by GitHub."
      />

      <section id="account_info">
        <header>
          <h2 className="font-serif text-2xl font-semibold">Account Info</h2>
        </header>

        <Form defaultValues={defaultValues} onSubmit={() => void undefined}>
          {({ register }) => (
            <>
              <div className="flex-shrink-0 h-20 w-20 my-7">
                <Image
                  draggable={false}
                  className="h-20 w-20 rounded-full"
                  src={user.imageUrl!}
                  alt={user.email}
                  width={80}
                  height={80}
                  loading="lazy"
                />
              </div>

              <FormField label="Email">
                <Input {...register("email", { disabled: true })} />
              </FormField>

              <FormField label="Name">
                <Input {...register("name", { disabled: true })} />
              </FormField>
            </>
          )}
        </Form>
      </section>

      <section id="configuration" className="my-5">
        <header className="mb-3">
          <h2 className="font-serif text-2xl font-semibold">Configuration</h2>
        </header>

        <Form defaultValues={configurationDefaultValues} onSubmit={handleConfigurationSubmit}>
          {({ register }) => (
            <>
              <FormField label="Max Yearly Salary Income">
                <Input
                  className="font-mono"
                  {...register("maxYearlyIncome", { valueAsNumber: true })}
                />
              </FormField>

              <FormField label="Max Yearly Hours">
                <Input
                  className="font-mono"
                  {...register("maxYearlyHours", { valueAsNumber: true })}
                />
              </FormField>

              <Button
                className="flex items-center gap-2"
                disabled={updateUserConfigurationMutation.isLoading}
                type="submit"
              >
                {updateUserConfigurationMutation.isLoading ? <Loader size="sm" /> : null}
                Save
              </Button>
            </>
          )}
        </Form>
      </section>

      <section className="my-5" id="danger">
        <header className="mb-5">
          <h2 className="font-serif text-2xl font-semibold">Danger Zone</h2>
        </header>

        <div className="flex gap-2">
          <Button onClick={() => setIsOpen(true)} variant="danger" className="font-medium">
            Delete Account
          </Button>

          <Button onClick={handleLogout} variant="danger" className="font-medium">
            Logout
          </Button>
        </div>

        <Modal isOpen={isOpen} onOpenChange={() => setIsOpen(false)}>
          <form onSubmit={handleDeleteUser}>
            <Modal.Title>Delete Account</Modal.Title>
            <Modal.Description>
              Are you sure you want to delete this account? All data will be removed and cannot be
              recovered.
            </Modal.Description>

            <footer className="mt-7 flex justify-end gap-2">
              <Modal.Close>
                <Button type="reset">Nope, cancel</Button>
              </Modal.Close>
              <Button variant="danger" type="submit">
                Yes, delete Account
              </Button>
            </footer>
          </form>
        </Modal>
      </section>
    </div>
  );
}
