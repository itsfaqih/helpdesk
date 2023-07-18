import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@/components/base/menu";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getInitials } from "@/utils/text.util";
import { cn } from "@/libs/cn.lib";
import { AddressBook, House, List, Ticket, Users } from "@phosphor-icons/react";
import { useCurrentAdminQuery } from "@/queries/current-admin.query";
import { useLogOutMutation } from "@/mutations/log-out.mutation";
import { FadeInContainer } from "@/components/base/fade-in-container";
import { IconButton } from "@/components/base/button";
import * as Ark from "@ark-ui/react";

export function AppRoot() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const currentAdminQuery = useCurrentAdminQuery();
  const currentAdmin = currentAdminQuery.data?.data;

  const logOutMutation = useLogOutMutation();

  const handleLogOut = () => {
    logOutMutation.mutate(undefined, {
      onSuccess() {
        navigate("/auth/login");
      },
    });
  };

  return (
    <div>
      <FadeInContainer from="left">
        <nav className="fixed top-0 left-0 hidden w-64 h-full px-4 bg-white border-r border-gray-300 lg:block">
          <span className="block py-6 font-medium text-center">
            Helpdesk Management
          </span>
          <ul className="flex flex-col gap-y-2.5 mt-4">
            <li>
              <MainMenuItem to="/" icon={House} label="Dashboard" />
            </li>
            <li>
              <MainMenuItem to="/tickets" icon={Ticket} label="Tickets" />
            </li>
            <li>
              <MainMenuItem to="/clients" icon={AddressBook} label="Clients" />
            </li>
            <li>
              <MainMenuItem to="/admins" icon={Users} label="Administrators" />
            </li>
          </ul>
        </nav>
        <Ark.Dialog
          open={isSidebarOpen}
          onOpen={() => setIsSidebarOpen(true)}
          onClose={() => setIsSidebarOpen(false)}
        >
          <Ark.Portal>
            <Ark.DialogBackdrop className="fixed inset-0 bg-gray-900/70 lg:hidden" />
            <Ark.DialogContainer>
              <Ark.DialogContent asChild>
                <nav className="fixed top-0 left-0 z-10 w-64 h-full px-4 bg-white border-r border-gray-300 lg:hidden">
                  <span className="block py-6 font-medium text-center">
                    Helpdesk Management
                  </span>
                  <ul className="flex flex-col gap-y-2.5 mt-4">
                    <li>
                      <MainMenuItem
                        to="/"
                        icon={House}
                        label="Dashboard"
                        onClick={() => setIsSidebarOpen(false)}
                      />
                    </li>
                    <li>
                      <MainMenuItem
                        to="/tickets"
                        icon={Ticket}
                        label="Tickets"
                        onClick={() => setIsSidebarOpen(false)}
                      />
                    </li>
                    <li>
                      <MainMenuItem
                        to="/clients"
                        icon={AddressBook}
                        label="Clients"
                        onClick={() => setIsSidebarOpen(false)}
                      />
                    </li>
                    <li>
                      <MainMenuItem
                        to="/admins"
                        icon={Users}
                        label="Administrators"
                        onClick={() => setIsSidebarOpen(false)}
                      />
                    </li>
                  </ul>
                </nav>
              </Ark.DialogContent>
            </Ark.DialogContainer>
          </Ark.Portal>
        </Ark.Dialog>
      </FadeInContainer>
      <main className="lg:pl-64">
        <FadeInContainer from="top">
          <nav className="py-2.5 px-6 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <IconButton
                  icon={List}
                  label="Menu"
                  onClick={() => {
                    setIsSidebarOpen(true);
                  }}
                  className="block lg:hidden"
                />
                <ul className="hidden text-sm sm:block">
                  <li className="text-gray-500">Dashboard</li>
                </ul>
              </div>
              <Menu positioning={{ placement: "bottom-end" }}>
                <MenuTrigger asChild>
                  <button className="flex items-center px-2.5 py-2 rounded-md gap-x-2 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-brand-600">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {currentAdmin?.full_name
                          ? getInitials(currentAdmin.full_name)
                          : ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-col hidden text-left w-36 sm:flex">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {currentAdmin?.full_name}
                      </span>
                      <span className="text-sm text-gray-600 truncate">
                        {currentAdmin?.email}
                      </span>
                    </div>
                  </button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem id="profile">Profile</MenuItem>
                  <MenuItem id="logout" onClick={handleLogOut}>
                    Log out
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </nav>
        </FadeInContainer>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

type MainMenuItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof NavLink>,
  "children"
> & {
  icon: React.ElementType;
  label: string;
};

function MainMenuItem({
  icon: Icon,
  label,
  className,
  ...props
}: MainMenuItemProps) {
  return (
    <NavLink
      className={({ isActive, isPending }) =>
        cn(
          "px-3 py-2.5 rounded-md w-full flex gap-x-2.5 items-center font-medium text-sm",
          {
            "text-gray-500 hover:shadow-haptic-gray-300 hover:text-gray-600 active:bg-gray-50 active:shadow-haptic-gray-400":
              !isActive,
            "text-brand-800 shadow-haptic-brand-300 hover:shadow-haptic-brand-400 active:bg-brand-100 bg-brand-50":
              isActive,
            "animate-pulse": isPending,
          },
          className
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          <Icon weight={isActive ? "duotone" : "regular"} className="w-5 h-5" />
          {label}
        </>
      )}
    </NavLink>
  );
}
