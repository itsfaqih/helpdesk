import React from "react";
import { AppPageTitle } from "../_components/page-title.app";
import {
  TicketCategory,
  TicketCategorySchema,
  UpdateTicketCategorySchema,
} from "@/schemas/ticket.schema";
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
  TicketCategoryShowRequestSchema,
  fetchTicketCategoryShowQuery,
  useTicketCategoryShowQuery,
} from "@/queries/ticket.query";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { Textbox } from "@/components/derived/textbox";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { Link } from "@/components/base/link";
import { CaretLeft } from "@phosphor-icons/react";
import { Skeleton } from "@/components/base/skeleton";
import { TextAreabox } from "@/components/derived/textareabox";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { AppPageBackLink } from "../_components/page-back-link";

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = TicketCategoryShowRequestSchema.parse(params);

    await fetchTicketCategoryShowQuery({
      queryClient,
      request: requestData,
    }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: "Edit Ticket Category",
      data: { request: requestData },
    });
  };
}

TicketCategoryShowPage.loader = loader;

export function TicketCategoryShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const ticketCategoryShowQuery = useTicketCategoryShowQuery({
    id: loaderData.data.request.id,
  });
  const ticketCategory = ticketCategoryShowQuery.data?.data;

  const updateTicketCategoryForm = useForm<UpdateTicketCategorySchema>({
    resolver: zodResolver(UpdateTicketCategorySchema),
    defaultValues: ticketCategory,
  });

  const updateTicketCategoryMutation = useUpdateTicketCategoryMutation({
    ticketCategoryId: loaderData.data.request.id,
  });

  const onSubmit = updateTicketCategoryForm.handleSubmit((data) => {
    updateTicketCategoryMutation.mutate(data);
  });

  React.useEffect(() => {
    updateTicketCategoryForm.reset(ticketCategory);
  }, [ticketCategory, updateTicketCategoryForm]);

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/ticket-categories" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-7 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form
          id="update-ticket-category-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-y-4"
        >
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Name</Label>
            <div className="col-span-3">
              {ticketCategoryShowQuery.isLoading && (
                <Skeleton className="mb-6 h-9" />
              )}
              {ticketCategoryShowQuery.isSuccess && (
                <Textbox
                  label="Name"
                  placeholder="Name"
                  disabled={updateTicketCategoryMutation.isLoading}
                  value={ticketCategory?.name}
                  readOnly
                  srOnlyLabel
                  errorPlaceholder
                  data-testid="textbox-name"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="description">Description</Label>
            <div className="col-span-3">
              {ticketCategoryShowQuery.isLoading && (
                <Skeleton className="mb-6 h-9" />
              )}
              {ticketCategoryShowQuery.isSuccess && (
                <TextAreabox
                  {...updateTicketCategoryForm.register("description")}
                  label="Description"
                  placeholder="Enter Description"
                  disabled={updateTicketCategoryMutation.isLoading}
                  error={
                    updateTicketCategoryForm.formState.errors.description
                      ?.message
                  }
                  srOnlyLabel
                  errorPlaceholder
                  data-testid="textbox-description"
                />
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              form="update-ticket-category-form"
              type="submit"
              variant="primary"
              loading={updateTicketCategoryMutation.isLoading}
              success={
                updateTicketCategoryMutation.isSuccess &&
                !updateTicketCategoryForm.formState.isDirty
              }
              data-testid="btn-update-ticket-category"
            >
              Update Category
            </Button>
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const UpdateTicketCategoryResponseSchema = APIResponseSchema({
  schema: TicketCategorySchema,
});

type UseUpdateTicketCategoryMutationParams = {
  ticketCategoryId: TicketCategory["id"];
};

function useUpdateTicketCategoryMutation({
  ticketCategoryId,
}: UseUpdateTicketCategoryMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateTicketCategorySchema) {
      try {
        const res = await api.put(
          data,
          `/ticket-categories/${ticketCategoryId}`
        );

        return UpdateTicketCategoryResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["ticket-category", "index"]);
    },
  });
}
