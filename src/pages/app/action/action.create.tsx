import { AppPageTitle } from "../_components/page-title.app";
import { APIResponseSchema } from "@/schemas/api.schema";
import { ActionSchema, CreateActionSchema } from "@/schemas/action.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { UnprocessableEntityError } from "@/utils/error.util";
import { api } from "@/libs/api.lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textbox } from "@/components/derived/textbox";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { useLoaderData, useNavigate } from "react-router-dom";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { AppPageBackLink } from "../_components/page-back-link";
import { TextAreabox } from "@/components/derived/textareabox";
import { IconPicker } from "@/components/derived/icon-picker";
import { SaveButton } from "@/components/derived/save-button";

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: "Create Action",
    });
  };
}

ActionCreatePage.loader = loader;

export function ActionCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createActionForm = useForm<CreateActionSchema>({
    resolver: zodResolver(CreateActionSchema),
    defaultValues: {
      cta_icon_type: "emoji",
    },
  });

  const createActionMutation = useCreateActionMutation();

  const onSubmit = createActionForm.handleSubmit((data) => {
    createActionMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/actions/${res.data.id}`);
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/actions" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-7 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form
          id="create-action-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-y-4"
        >
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="cta_icon_picker">CTA Icon</Label>
            <div className="col-span-3 flex">
              <Controller
                control={createActionForm.control}
                name="cta_icon_value"
                render={({ field }) => (
                  <IconPicker
                    id="cta_icon_picker"
                    value={{ emojiId: field.value }}
                    onChange={({ emojiId }) => field.onChange(emojiId)}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="cta_label">CTA Label</Label>
            <div className="col-span-3">
              <Textbox
                {...createActionForm.register("cta_label")}
                label="CTA Label"
                placeholder="Enter CTA Label"
                disabled={createActionMutation.isLoading}
                error={createActionForm.formState.errors.cta_label?.message}
                srOnlyLabel
                data-testid="textbox-cta_label"
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="description">Description</Label>
            <div className="col-span-3">
              <TextAreabox
                {...createActionForm.register("description")}
                label="Description"
                placeholder="Enter Description"
                disabled={createActionMutation.isLoading}
                error={createActionForm.formState.errors.description?.message}
                srOnlyLabel
                rows={3}
                data-testid="textbox-description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <SaveButton
              type="submit"
              loading={createActionMutation.isLoading}
              success={createActionMutation.isSuccess}
              data-testid="btn-create-action"
            />
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const CreateActionResponseSchema = APIResponseSchema({
  schema: ActionSchema,
});

function useCreateActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateActionSchema) {
      try {
        const res = await api.post(data, "/actions");

        return CreateActionResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof UnprocessableEntityError) {
          throw new Error("Action with this name already exists");
        }

        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["action", "index"]);
    },
  });
}
