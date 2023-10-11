import * as React from "react";
import { AppPageTitle } from "../_components/page-title.app";
import { APIResponseSchema } from "@/schemas/api.schema";
import {
  Action,
  ActionSchema,
  UpdateActionSchema,
} from "@/schemas/action.schema";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { UnprocessableEntityError } from "@/utils/error.util";
import { api } from "@/libs/api.lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textbox } from "@/components/derived/textbox";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { AppPageBackLink } from "../_components/page-back-link";
import { TextAreabox } from "@/components/derived/textareabox";
import { IconPicker } from "@/components/derived/icon-picker";
import { SaveButton } from "@/components/derived/save-button";
import {
  ActionShowRequestSchema,
  fetchActionShowQuery,
  useActionShowQuery,
} from "@/queries/action.query";

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = ActionShowRequestSchema.parse(params);

    await fetchActionShowQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: "Edit Action",
      data: { request: requestData },
    });
  };
}

ActionShowPage.loader = loader;

export function ActionShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const actionShowQuery = useActionShowQuery({
    id: loaderData.data.request.id,
  });
  const action = actionShowQuery.data?.data;

  const updateActionForm = useForm<UpdateActionSchema>({
    resolver: zodResolver(UpdateActionSchema),
    defaultValues: action,
  });

  const updateActionMutation = useUpdateActionMutation({
    actionId: loaderData.data.request.id,
  });

  const onSubmit = updateActionForm.handleSubmit((data) => {
    updateActionMutation.mutate(data);
  });

  React.useEffect(() => {
    updateActionForm.reset(action);
  }, [action, updateActionForm]);

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
                control={updateActionForm.control}
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
                {...updateActionForm.register("cta_label")}
                label="CTA Label"
                placeholder="Enter CTA Label"
                disabled={updateActionMutation.isLoading}
                error={updateActionForm.formState.errors.cta_label?.message}
                srOnlyLabel
                data-testid="textbox-cta_label"
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="description">Description</Label>
            <div className="col-span-3">
              <TextAreabox
                {...updateActionForm.register("description")}
                label="Description"
                placeholder="Enter Description"
                disabled={updateActionMutation.isLoading}
                error={updateActionForm.formState.errors.description?.message}
                srOnlyLabel
                rows={3}
                data-testid="textbox-description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <SaveButton
              type="submit"
              loading={updateActionMutation.isLoading}
              success={
                updateActionMutation.isSuccess &&
                !updateActionForm.formState.isDirty
              }
              data-testid="btn-update-action"
            />
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const UpdateActionResponseSchema = APIResponseSchema({
  schema: ActionSchema,
});

type UseUpdateActionMutationParams = {
  actionId: Action["id"];
};

function useUpdateActionMutation({ actionId }: UseUpdateActionMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateActionSchema) {
      try {
        const res = await api.put(data, `/actions/${actionId}`);

        return UpdateActionResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof UnprocessableEntityError) {
          throw new Error("Action with this label already exists");
        }

        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["action", "index"]);
      await queryClient.invalidateQueries(["action", "show", actionId]);
    },
  });
}
