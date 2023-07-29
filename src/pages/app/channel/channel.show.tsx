import { AppPageTitle } from "../_components/page-title.app";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import {
  ChannelShowRequestSchema,
  fetchChannelShowQuery,
  useChannelShowQuery,
} from "@/queries/channel.query";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { Textbox } from "@/components/derived/textbox";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { Link } from "@/components/base/link";
import { CaretLeft } from "@phosphor-icons/react";
import { Skeleton } from "@/components/base/skeleton";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { ArchiveChannelDialog } from "./_components/archive-channel-dialog";
import { RestoreChannelDialog } from "./_components/restore-channel-dialog";
import { AppPageBackLink } from "../_components/page-back-link";

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = ChannelShowRequestSchema.parse(params);

    await fetchChannelShowQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: "View Channel",
      data: { request: requestData },
    });
  };
}

ChannelShowPage.loader = loader;

export function ChannelShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const channelShowQuery = useChannelShowQuery({
    id: loaderData.data.request.id,
  });
  const channel = channelShowQuery.data?.data;

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/channels" />
      <div className="flex items-center mt-4">
        <AppPageTitle title={loaderData.pageTitle} />

        <div className="ml-auto">
          {channel &&
            (channel.is_archived ? (
              <RestoreChannelDialog
                channelId={channel.id}
                trigger={
                  <Button
                    type="button"
                    variant="white"
                    data-testid="btn-restore-channel"
                  >
                    Restore Channel
                  </Button>
                }
              />
            ) : (
              <ArchiveChannelDialog
                channelId={channel.id}
                trigger={
                  <Button
                    type="button"
                    variant="danger"
                    data-testid="btn-archive-channel"
                  >
                    Archive Channel
                  </Button>
                }
              />
            ))}
        </div>
      </div>
      <Card className="px-4.5 py-5 mt-7 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="name">Name</Label>
            <div className="col-span-3">
              {channelShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {channelShowQuery.isSuccess && (
                <Textbox
                  name="Name"
                  label="Name"
                  placeholder="Enter Name"
                  value={channel?.name}
                  readOnly
                  srOnlyLabel
                  errorPlaceholder
                  data-testid="textbox-name"
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </AppPageContainer>
  );
}
