import { AppPageTitle } from "../_components/page-title.app";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import {
  TicketShowRequestSchema,
  fetchTicketShowQuery,
  useTicketShowQuery,
} from "@/queries/ticket.query";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { Card } from "@/components/base/card";
import { Link } from "@/components/base/link";
import { ArrowSquareOut, CaretLeft } from "@phosphor-icons/react";
import { Skeleton } from "@/components/base/skeleton";
import {
  ticketStatusToBadgeColor,
  ticketStatusToLabel,
} from "@/utils/ticket.util";
import { Badge } from "@/components/base/badge";
import { formatDateTime } from "@/utils/date";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { AppPageBackLink } from "../_components/page-back-link";

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = TicketShowRequestSchema.parse(params);

    await fetchTicketShowQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: `Ticket #${requestData.id}`,
      data: { request: requestData },
    });
  };
}

TicketShowPage.loader = loader;

export function TicketShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const ticketShowQuery = useTicketShowQuery({
    id: loaderData.data.request.id,
  });
  const ticket = ticketShowQuery.data?.data;

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/tickets" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <div className="flex flex-col gap-5 xl:flex-row mt-7">
        <Card className="p-4.5 xl:hidden sm:mx-0 -mx-6 sm:rounded-md rounded-none block">
          <div className="grid text-sm sm:grid-cols-2 gap-y-5 gap-x-8">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="font-medium text-gray-600">Status</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && (
                <Badge color={ticketStatusToBadgeColor(ticket.status)}>
                  {ticketStatusToLabel(ticket.status)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 justify-between">
              <span className="font-medium text-gray-600">Category</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && <span>{ticket.category.name}</span>}
            </div>
            <div className="flex items-center gap-1.5 justify-between">
              <span className="font-medium text-gray-600">Client</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && (
                <Link
                  to={`/clients/${ticket.client_id}`}
                  target="_blank"
                  title={ticket.client.full_name}
                  className="inline-flex items-center gap-1"
                >
                  <span className="w-40 text-right truncate">
                    {ticket.client.full_name}
                  </span>{" "}
                  <ArrowSquareOut className="flex-shrink-0 w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-1.5 justify-between">
              <span className="font-medium text-gray-600">Channel</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && (
                <Link
                  to={`/channels/${ticket.channel_id}`}
                  target="_blank"
                  title={ticket.channel.name}
                  className="inline-flex items-center gap-1"
                >
                  <span className="w-40 text-right truncate">
                    {ticket.channel.name}
                  </span>{" "}
                  <ArrowSquareOut className="flex-shrink-0 w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-1.5 justify-between">
              <span className="font-medium text-gray-600">Created At</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && <span>{formatDateTime(ticket.created_at)}</span>}
            </div>
            <div className="flex items-center gap-1.5 justify-between">
              <span className="font-medium text-gray-600">Updated At</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && <span>{formatDateTime(ticket.updated_at)}</span>}
            </div>
          </div>
        </Card>
        <Card className="px-4.5 py-5 sm:mx-0 -mx-6 sm:rounded-md rounded-none flex-1 h-fit">
          <h2 className="font-semibold text-gray-800">
            {ticketShowQuery.isLoading && <Skeleton className="w-40" />}
            {ticket && <span>{ticket.title}</span>}
          </h2>
          <div className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
            {ticketShowQuery.isLoading && <Skeleton className="w-40" />}
            {ticket?.description ? (
              <span className="text-gray-800">{ticket.description}</span>
            ) : (
              <span className="text-gray-500">No description</span>
            )}
          </div>
        </Card>
        <Card className="w-80 px-4.5 py-3 xl:block hidden h-fit">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2 font-medium text-gray-600">Status</td>
                <td className="py-2 text-right">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket && (
                    <Badge color={ticketStatusToBadgeColor(ticket.status)}>
                      {ticketStatusToLabel(ticket.status)}
                    </Badge>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-600">Category</td>
                <td className="py-2 text-right text-gray-800">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket && <span>{ticket.category.name}</span>}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-600">Client</td>
                <td className="py-2 text-right text-gray-800">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket && (
                    <Link
                      to={`/clients/${ticket.client_id}`}
                      target="_blank"
                      title={ticket.client.full_name}
                      className="inline-flex items-center gap-1"
                    >
                      <span className="w-40 text-right truncate">
                        {ticket.client.full_name}
                      </span>{" "}
                      <ArrowSquareOut className="flex-shrink-0 w-4 h-4" />
                    </Link>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-600">Channel</td>
                <td className="py-2 text-right text-gray-800">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket && (
                    <Link
                      to={`/channels/${ticket.channel_id}`}
                      target="_blank"
                      title={ticket.channel.name}
                      className="inline-flex items-center gap-1"
                    >
                      <span className="w-40 text-right truncate">
                        {ticket.channel.name}
                      </span>{" "}
                      <ArrowSquareOut className="flex-shrink-0 w-4 h-4" />
                    </Link>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-600">Created At</td>
                <td className="py-2 text-right text-gray-800">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket && <span>{formatDateTime(ticket.created_at)}</span>}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-600">Updated At</td>
                <td className="py-2 text-right text-gray-800">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket && <span>{formatDateTime(ticket.updated_at)}</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </AppPageContainer>
  );
}
