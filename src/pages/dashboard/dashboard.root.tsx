import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@/components/base/menu";
import localforage from "localforage";
import { Outlet, useNavigate } from "react-router-dom";
import { User, UserSchema } from "@/schemas/user.schema";
import { getInitials } from "@/utils/text.util";

export function DashboardRoot() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      const unparsedCurrentUser = await localforage.getItem("current_user");
      const parsedCurrentUser = UserSchema.parse(unparsedCurrentUser);

      return parsedCurrentUser;
    };

    fetchCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => {
        navigate("/auth/login");
      });
  }, [navigate]);

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
                    {currentUser?.full_name
                      ? getInitials(currentUser.full_name)
                      : ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left w-36">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {currentUser?.full_name}
                  </span>
                  <span className="text-sm text-gray-600 truncate">
                    {currentUser?.email}
                  </span>
                </div>
              </button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem id="profile">Profile</MenuItem>
              <MenuItem
                id="logout"
                onClick={async () => {
                  await localforage.removeItem("current_user");

                  navigate("/auth/login");
                }}
              >
                Log out
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </nav>
      <main className="pt-8">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
