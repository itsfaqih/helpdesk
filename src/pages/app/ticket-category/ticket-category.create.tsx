import { AppPageTitle } from "../_components/page-title.app";
import {
  CreateTicketCategorySchema,
  TicketCategorySchema,
  UpdateTicketCategorySchema,
} from "@/schemas/ticket.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/libs/api.lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Textbox } from "@/components/derived/textbox";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { TextAreabox } from "@/components/derived/textareabox";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { AppPageBackLink } from "../_components/page-back-link";

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: "Create Ticket Category",
    });
  };
}

TicketCategoryCreatePage.loader = loader;

export function TicketCategoryCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createTicketCategoryForm = useForm<CreateTicketCategorySchema>({
    resolver: zodResolver(CreateTicketCategorySchema),
  });

  const createTicketCategoryMutation = useCreateTicketCategoryMutation();

  const onSubmit = createTicketCategoryForm.handleSubmit((data) => {
    createTicketCategoryMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/ticket-categories/${res.data.id}`);
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/ticket-categories" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-7 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form
          id="create-ticket-category-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-y-4"
        >
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Name</Label>
            <div className="col-span-3">
              <Textbox
                {...createTicketCategoryForm.register("name")}
                label="Name"
                placeholder="Name"
                disabled={createTicketCategoryMutation.isLoading}
                error={createTicketCategoryForm.formState.errors.name?.message}
                srOnlyLabel
                data-testid="textbox-name"
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="description">Description</Label>
            <div className="col-span-3">
              <TextAreabox
                {...createTicketCategoryForm.register("description")}
                label="Description"
                placeholder="Enter Description"
                disabled={createTicketCategoryMutation.isLoading}
                error={
                  createTicketCategoryForm.formState.errors.description?.message
                }
                srOnlyLabel
                data-testid="textbox-description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              form="create-ticket-category-form"
              type="submit"
              variant="primary"
              loading={createTicketCategoryMutation.isLoading}
              success={
                createTicketCategoryMutation.isSuccess &&
                !createTicketCategoryForm.formState.isDirty
              }
              data-testid="btn-create-ticket-category"
            >
              Create Category
            </Button>
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const CreateTicketCategoryResponseSchema = APIResponseSchema({
  schema: TicketCategorySchema,
});

function useCreateTicketCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateTicketCategorySchema) {
      try {
        const res = await api.post(data, "/ticket-categories");

        return CreateTicketCategoryResponseSchema.parse(res);
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
