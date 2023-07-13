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
import { AddressBook, House, Ticket, Users } from "@phosphor-icons/react";
import { useCurrentAdminQuery } from "@/queries/current-admin.query";
import { useLogOutMutation } from "@/mutations/log-out.mutation";

export function DashboardRoot() {
  const navigate = useNavigate();

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
      <nav className="py-2.5 border-b border-slate-300">
        <div className="container flex items-center justify-between mx-auto">
          <div className="flex">
            <span className="font-medium">Helpdesk Management</span>
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
                <div className="flex flex-col text-left w-36">
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
      <div className="pt-8">
        <div className="container flex mx-auto gap-x-12">
          <nav className="flex-shrink-0 w-64">
            <ul className="flex flex-col gap-y-2.5">
              <li>
                <MainMenuItem to="/" icon={House} label="Dashboard" />
              </li>
              <li>
                <MainMenuItem to="/tickets" icon={Ticket} label="Tickets" />
              </li>
              <li>
                <MainMenuItem
                  to="/clients"
                  icon={AddressBook}
                  label="Clients"
                />
              </li>
              <li>
                <MainMenuItem
                  to="/admins"
                  icon={Users}
                  label="Administrators"
                />
              </li>
            </ul>
          </nav>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
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
            "text-gray-800 shadow-haptic-gray-300 hover:shadow-haptic-gray-400 active:bg-gray-50":
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
