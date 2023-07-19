import React from "react";
import { FadeInContainer } from "@/components/base/fade-in-container";
import { AppPageTitle } from "../_components/page-title.app";
import {
  Client,
  ClientSchema,
  UpdateClientSchema,
} from "@/schemas/client.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/libs/api.lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import {
  ClientShowRequestSchema,
  fetchClientShowQuery,
  useClientShowQuery,
} from "@/queries/client.query";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { TextboxProps } from "@/components/derived/textbox";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { Link } from "@/components/base/link";
import { CaretLeft } from "@phosphor-icons/react";
import { Skeleton } from "@/components/base/skeleton";

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = ClientShowRequestSchema.parse(params);

    await fetchClientShowQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: "Edit Clientistrator",
      data: { request: requestData },
    });
  };
}

ClientShowPage.loader = loader;

export function ClientShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const clientShowQuery = useClientShowQuery({
    id: loaderData.data.request.id,
  });
  const client = clientShowQuery.data?.data;

  const updateClientForm = useForm<UpdateClientSchema>({
    resolver: zodResolver(UpdateClientSchema),
    defaultValues: client,
  });

  const updateClientMutation = useUpdateClientMutation({
    clientId: loaderData.data.request.id,
  });

  const onSubmit = updateClientForm.handleSubmit((data) => {
    updateClientMutation.mutate(data);
  });

  React.useEffect(() => {
    updateClientForm.reset(client);
  }, [client, updateClientForm]);

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
      <AppPageTitle title="Update Client" className="mt-4" />
      <Card className="px-4.5 pt-6 pb-5 mt-7 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form
          id="update-client-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-y-4"
        >
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              {clientShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {clientShowQuery.isSuccess && (
                <Textbox
                  {...updateClientForm.register("full_name")}
                  label="Full Name"
                  placeholder="Enter Full Name"
                  disabled={updateClientMutation.isLoading}
                  error={updateClientForm.formState.errors.full_name?.message}
                  srOnlyLabel
                  errorPlaceholder
                />
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              form="update-client-form"
              type="submit"
              variant="primary"
              loading={updateClientMutation.isLoading}
              success={
                updateClientMutation.isSuccess &&
                !updateClientForm.formState.isDirty
              }
            >
              Update Client
            </Button>
          </div>
        </form>
      </Card>
    </FadeInContainer>
  );
}

const UpdateClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseUpdateClientMutationParams = {
  clientId: Client["id"];
};

function useUpdateClientMutation({ clientId }: UseUpdateClientMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateClientSchema) {
      try {
        const res = await api.put(data, `/clients/${clientId}`);

        return UpdateClientResponseSchema.parse(res);
      } catch (error) {
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
