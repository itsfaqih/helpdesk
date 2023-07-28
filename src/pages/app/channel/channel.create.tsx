import { AppPageTitle } from "../_components/page-title.app";
import { APIResponseSchema } from "@/schemas/api.schema";
import { ChannelSchema, CreateChannelSchema } from "@/schemas/channel.schema";
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
import { useLoaderData, useNavigate } from "react-router-dom";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { AppPageContainer } from "@/components/derived/app-page-container";

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: "Create Channel",
    });
  };
}

ChannelCreatePage.loader = loader;

export function ChannelCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createChannelForm = useForm<CreateChannelSchema>({
    resolver: zodResolver(CreateChannelSchema),
  });

  const createChannelMutation = useCreateChannelMutation();

  const onSubmit = createChannelForm.handleSubmit((data) => {
    createChannelMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/channels/${res.data.id}`);
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <Link
        variant="plain"
        to="/channels"
        className="inline-flex items-center gap-x-1.5"
      >
        <CaretLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-7 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form
          id="create-channel-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-y-4"
        >
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="name">Name</Label>
            <div className="col-span-3">
              <Textbox
                {...createChannelForm.register("name")}
                label="Name"
                placeholder="Enter Name"
                disabled={createChannelMutation.isLoading}
                error={createChannelForm.formState.errors.name?.message}
                srOnlyLabel
                errorPlaceholder
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              type="submit"
              loading={createChannelMutation.isLoading}
              success={createChannelMutation.isSuccess}
            >
              Create Channel
            </Button>
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const CreateChannelResponseSchema = APIResponseSchema({
  schema: ChannelSchema.pick({
    id: true,
    name: true,
  }),
});

function useCreateChannelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateChannelSchema) {
      try {
        const res = await api.post(data, "/channels");

        return CreateChannelResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof ConflictError) {
          throw new Error("Channel with this name already exists");
        }

        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["channel", "index"]);
    },
  });
}