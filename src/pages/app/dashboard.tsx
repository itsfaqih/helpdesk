import React from "react";
import { Card } from "@/components/base/card";
import {
  Archive,
  CheckFat,
  HourglassMedium,
  Ticket,
} from "@phosphor-icons/react";
import { cn } from "@/libs/cn.lib";
import { FadeInContainer } from "@/components/base/fade-in-container";

export function DashboardPage() {
  return (
    <FadeInContainer className="grid grid-cols-4 gap-8">
      <OverviewCard
        icon={Archive}
        title="Total Tickets"
        value="100"
        classNames={{ iconContainer: "bg-blue-100", icon: "text-blue-700" }}
      />
      <OverviewCard
        icon={Ticket}
        title="Open Tickets"
        value="100"
        classNames={{ iconContainer: "bg-rose-100", icon: "text-rose-700" }}
      />
      <OverviewCard
        icon={HourglassMedium}
        title="Ongoing Tickets"
        value="100"
        classNames={{ iconContainer: "bg-amber-100", icon: "text-amber-700" }}
      />
      <OverviewCard
        icon={CheckFat}
        title="Resolved Tickets"
        value="56"
        classNames={{
          iconContainer: "bg-emerald-100",
          icon: "text-emerald-700",
        }}
      />
    </FadeInContainer>
  );
}

type OverviewCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  classNames: {
    iconContainer: string;
    icon: string;
  };
};

function OverviewCard({
  title,
  value,
  icon: Icon,
  classNames,
}: OverviewCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-x-4">
        <div
          className={cn(
            "flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md",
            classNames.iconContainer
          )}
        >
          <Icon className={cn("w-6 h-6 text-gray-700", classNames.icon)} />
        </div>
        <div className="flex flex-col gap-y-0.5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </Card>
  );
}
