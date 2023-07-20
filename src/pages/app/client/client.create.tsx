import { FadeInContainer } from "@/components/base/fade-in-container";
import { AppPageTitle } from "../_components/page-title.app";
import { APIResponseSchema } from "@/schemas/api.schema";
import { ClientSchema, CreateClientSchema } from "@/schemas/client.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ConflictError } from "@/utils/error.util";
import { api } from "@/libs/api.lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textbox } from "@/components/derived/textbox";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { Button } from "@/components/base/button";
import { Link } from "@/components/base/link";
import { CaretLeft } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export function ClientCreatePage() {
  const navigate = useNavigate();
  const createClientForm = useForm<CreateClientSchema>({
    resolver: zodResolver(CreateClientSchema),
  });

  const createClientMutation = useCreateClientMutation();

  const onSubmit = createClientForm.handleSubmit((data) => {
    createClientMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/clients/${res.data.id}`);
      },
    });
  });

  return (
    <FadeInContainer className="pb-5">
      <Link
        variant="plain"
        to="/clients"
        className="inline-flex items-center gap-x-1.5"
      >
        <CaretLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>
      <AppPageTitle title="Create Client" className="mt-4" />
      <Card className="px-4.5 py-5 mt-7 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form
          id="create-client-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-y-4"
        >
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              <Textbox
                {...createClientForm.register("full_name")}
                label="Full Name"
                placeholder="Enter Full Name"
                disabled={createClientMutation.isLoading}
                error={createClientForm.formState.errors.full_name?.message}
                srOnlyLabel
                errorPlaceholder
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              type="submit"
              loading={createClientMutation.isLoading}
              success={createClientMutation.isSuccess}
            >
              Create Client
            </Button>
          </div>
        </form>
      </Card>
    </FadeInContainer>
  );
}

const CreateClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateClientSchema) {
      try {
        const res = await api.post(data, "/clients");

        return CreateClientResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof ConflictError) {
          throw new Error("Email is already registered");
        }

        throw new Error(
          "Something went wrong. Please contact the clientistrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["client", "index"]);
    },
  });
}
