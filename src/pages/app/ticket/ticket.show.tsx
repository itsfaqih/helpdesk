import React from "react";
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
import { ArrowSquareOut, Plus, X } from "@phosphor-icons/react";
import { Skeleton } from "@/components/base/skeleton";
import {
  ticketStatusToBadgeColor,
  ticketStatusToLabel,
} from "@/utils/ticket.util";
import { Badge } from "@/components/base/badge";
import { formatDateTime } from "@/utils/date";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { AppPageBackLink } from "../_components/page-back-link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { getInitials } from "@/utils/text.util";
import { IconButton } from "@/components/base/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/base/popover";
import { useAdminIndexQuery } from "@/queries/admin.query";
import { useDebounce } from "@/hooks/use-debounce";
import { Command } from "cmdk";
import { inputClassName } from "@/components/base/input";
import { Loop } from "@/components/base/loop";
import { useCreateTicketAssignmentMutation } from "@/mutations/ticket.mutation";
import { Ticket } from "@/schemas/ticket.schema";

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
              {ticket && (
                <Link
                  to={`/ticket-categories/${ticket.category_id}`}
                  target="_blank"
                  title={ticket.category.name}
                  className="inline-flex items-center gap-1"
                >
                  <span className="w-40 text-right truncate">
                    {ticket.category.name}
                  </span>{" "}
                  <ArrowSquareOut className="flex-shrink-0 w-4 h-4" />
                </Link>
              )}
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
              <span className="font-medium text-gray-600">Assigned agents</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && ticket.assignments.length === 0 && (
                <span className="text-gray-500">-</span>
              )}
              {ticket &&
                ticket.assignments.map((assignment) => (
                  <Tooltip
                    key={assignment.id}
                    positioning={{ placement: "top" }}
                  >
                    <TooltipTrigger className="cursor-default">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={undefined} />
                        <AvatarFallback>
                          {assignment.admin.full_name
                            ? getInitials(assignment.admin.full_name)
                            : ""}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      {assignment.admin.full_name}
                    </TooltipContent>
                  </Tooltip>
                ))}
            </div>
            <div className="flex items-center gap-1.5 justify-between">
              <span className="font-medium text-gray-600">Updated At</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && <span>{formatDateTime(ticket.updated_at)}</span>}
            </div>
            <div className="flex items-center gap-1.5 justify-between">
              <span className="font-medium text-gray-600">Created At</span>
              {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
              {ticket && <span>{formatDateTime(ticket.created_at)}</span>}
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
                  {ticket && (
                    <Link
                      to={`/ticket-categories/${ticket.category_id}`}
                      target="_blank"
                      title={ticket.category.name}
                      className="inline-flex items-center gap-1"
                    >
                      <span className="w-40 text-right truncate">
                        {ticket.category.name}
                      </span>{" "}
                      <ArrowSquareOut className="flex-shrink-0 w-4 h-4" />
                    </Link>
                  )}
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
                <td colSpan={2} className="py-2 font-medium text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Assigned agents</span>
                    {ticketShowQuery.isLoading && (
                      <Skeleton className="w-8 h-8" />
                    )}
                    {ticket && (
                      <AddTicketAssigneePopover
                        ticketId={ticket.id}
                        trigger={<IconButton icon={Plus} label="Add agent" />}
                      />
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="pb-2 text-right text-gray-800">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket &&
                    (ticket.assignments.length === 0 ? (
                      <span className="text-gray-500">-</span>
                    ) : (
                      <div className="flex flex-col gap-y-4">
                        {ticket.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="group flex items-center gap-x-2.5"
                          >
                            <Avatar className="w-8 h-8 cursor-default">
                              <AvatarImage src={undefined} />
                              <AvatarFallback>
                                {assignment.admin.full_name
                                  ? getInitials(assignment.admin.full_name)
                                  : ""}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 text-left">
                              <span className="text-sm text-gray-800 line-clamp-1">
                                {assignment.admin.full_name}
                              </span>
                              <span className="text-xs line-clamp-1">
                                {assignment.admin.email}
                              </span>
                            </div>
                            <IconButton
                              icon={X}
                              label="Remove agent"
                              className="invisible ml-auto group-hover:visible"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-600">Updated At</td>
                <td className="py-2 text-right text-gray-800">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket && <span>{formatDateTime(ticket.updated_at)}</span>}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-600">Created At</td>
                <td className="py-2 text-right text-gray-800">
                  {ticketShowQuery.isLoading && <Skeleton className="w-20" />}
                  {ticket && <span>{formatDateTime(ticket.created_at)}</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </AppPageContainer>
  );
}

type AddTicketAssigneePopoverProps = {
  ticketId: Ticket["id"];
  trigger: React.ReactNode;
};

function AddTicketAssigneePopover({
  ticketId,
  trigger,
}: AddTicketAssigneePopoverProps) {
  const [searchAdmin, setSearchAdmin] = React.useState("");
  const debouncedSearchAdmin = useDebounce(searchAdmin, 500);

  const adminIndexQuery = useAdminIndexQuery({ search: debouncedSearchAdmin });
  const admins = adminIndexQuery.data?.data ?? [];

  const createTicketAssignmentMutation = useCreateTicketAssignmentMutation();

  return (
    <Popover positioning={{ placement: "bottom-end" }}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent className="min-w-[18rem] z-10">
        <span className="text-gray-400">Assign agent</span>
        <Command shouldFilter={false} className="w-full mt-2">
          <Command.Input
            value={searchAdmin}
            onValueChange={(value) => setSearchAdmin(value)}
            placeholder="Search by name or email"
            className={inputClassName({ className: "w-full" })}
          />

          <Command.List className="flex flex-col mt-2 gap-y-1">
            {adminIndexQuery.isLoading && (
              <Command.Loading>
                <Loop amount={2}>
                  <div className="flex items-center gap-x-2.5 cursor-default data-[selected]:bg-gray-100 px-2.5 py-1.5 rounded-md">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex flex-col flex-1 text-left">
                      <Skeleton className="w-1/2 h-4" />
                      <Skeleton className="w-4/5 h-3 mt-1" />
                    </div>
                  </div>
                </Loop>
              </Command.Loading>
            )}

            {adminIndexQuery.isSuccess && admins.length === 0 && (
              <div
                role="presentation"
                className="py-3.5 text-center text-gray-500"
              >
                No results found.
              </div>
            )}

            {admins.map((admin) => (
              <Command.Item
                key={admin.id}
                value={admin.id}
                onSelect={(value) => {
                  createTicketAssignmentMutation.mutate({
                    ticket_id: ticketId,
                    admin_id: value,
                  });
                }}
                className="flex items-center gap-x-2.5 cursor-default data-[selected]:bg-gray-100 px-2.5 py-1.5 rounded-md"
              >
                <Avatar className="w-8 h-8 cursor-default">
                  <AvatarImage src={undefined} />
                  <AvatarFallback>
                    {admin.full_name ? getInitials(admin.full_name) : ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 text-left">
                  <span className="text-sm text-gray-800 line-clamp-1">
                    {admin.full_name}
                  </span>
                  <span className="text-xs line-clamp-1">{admin.email}</span>
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
