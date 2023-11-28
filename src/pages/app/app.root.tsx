import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/base/avatar';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/base/menu';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getInitials } from '@/utils/text.util';
import { cn } from '@/libs/cn.lib';
import {
  AddressBook,
  AppWindow,
  Function,
  House,
  List,
  Tag,
  Ticket,
  Users,
} from '@phosphor-icons/react';
import { useLoggedInUserQuery } from '@/queries/logged-in-user.query';
import { useLogOutMutation } from '@/mutations/log-out.mutation';
import { FadeInContainer } from '@/components/base/fade-in-container';
import { IconButton } from '@/components/base/button';
import * as Ark from '@ark-ui/react';
import { Toaster } from '@/components/base/toast';

const mainMenus = [
  {
    to: '/',
    icon: House,
    label: 'Dashboard',
  },
  {
    to: '/tickets',
    icon: Ticket,
    label: 'Tickets',
  },
  {
    to: '/ticket-tags',
    icon: Tag,
    label: 'Ticket Tags',
  },
  {
    to: '/clients',
    icon: AddressBook,
    label: 'Clients',
  },
  {
    to: '/channels',
    icon: AppWindow,
    label: 'Channels',
  },
  {
    to: '/actions',
    icon: Function,
    label: 'Actions',
  },
  {
    to: '/users',
    icon: Users,
    label: 'Users',
  },
];

export function AppRoot() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const loggedInUserQuery = useLoggedInUserQuery();
  const loggedInUser = loggedInUserQuery.data?.data;

  const logOutMutation = useLogOutMutation();

  const handleLogOut = () => {
    logOutMutation.mutate(undefined, {
      onSuccess() {
        navigate('/auth/login');
      },
    });
  };

  return (
    <div>
      <FadeInContainer from="left">
        <nav className="fixed top-0 left-0 hidden w-64 h-full px-4 bg-white border-r border-gray-300 lg:block">
          <span className="block py-6 font-medium text-center">Helpdesk Management</span>
          <ul className="flex flex-col gap-y-2 mt-4">
            {mainMenus.map((menu) => (
              <li key={menu.to}>
                <MainMenuItem to={menu.to} icon={menu.icon} label={menu.label} />
              </li>
            ))}
          </ul>
        </nav>
        <Ark.Dialog open={isSidebarOpen} onOpenChange={({ open }) => setIsSidebarOpen(open)}>
          <Ark.Portal>
            <Ark.Dialog.Backdrop
              className={cn(
                'fixed inset-0 bg-gray-900/70 lg:hidden',
                'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:duration-300 data-[state=open]:ease-out',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-300 data-[state=closed]:ease-in',
              )}
            />
            <Ark.Dialog.Positioner>
              <Ark.Dialog.Content asChild>
                <nav
                  className={cn(
                    'fixed top-0 left-0 z-10 w-64 h-full px-4 bg-white border-r border-gray-300 lg:hidden',
                    'data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=open]:duration-300 data-[state=open]:ease-out',
                    'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=closed]:duration-300 data-[state=closed]:ease-in',
                  )}
                >
                  <span className="block py-6 font-medium text-center">Helpdesk Management</span>
                  <ul className="flex flex-col gap-y-2 mt-4">
                    {mainMenus.map((menu) => (
                      <li key={menu.to}>
                        <MainMenuItem
                          to={menu.to}
                          icon={menu.icon}
                          label={menu.label}
                          onClick={() => setIsSidebarOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              </Ark.Dialog.Content>
            </Ark.Dialog.Positioner>
          </Ark.Portal>
        </Ark.Dialog>
      </FadeInContainer>
      <main className="lg:pl-64">
        <FadeInContainer from="top">
          <nav className="py-1.5 px-6 border-b border-gray-300">
            <div className="flex items-center justify-between container mx-auto">
              <div className="flex items-center gap-4">
                <IconButton
                  icon={(props) => <List {...props} />}
                  tooltip="Menu"
                  onClick={() => {
                    setIsSidebarOpen(true);
                  }}
                  className="block lg:hidden"
                />
                <ul className="hidden text-sm sm:block">
                  <li className="text-gray-500">Dashboard</li>
                </ul>
              </div>
              <Menu positioning={{ placement: 'bottom-end' }}>
                <MenuTrigger asChild>
                  <button className="flex items-center px-2.5 py-2 rounded-lg gap-x-2 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-brand-600">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {loggedInUser?.full_name ? getInitials(loggedInUser.full_name) : ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-col hidden text-left w-36 sm:flex">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {loggedInUser?.full_name}
                      </span>
                      <span className="text-xs text-gray-600 truncate">{loggedInUser?.email}</span>
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
          <div className="container mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

type MainMenuItemProps = Omit<React.ComponentPropsWithoutRef<typeof NavLink>, 'children'> & {
  icon: React.ElementType;
  label: string;
};

function MainMenuItem({ icon: Icon, label, className, ...props }: MainMenuItemProps) {
  return (
    <NavLink
      className={({ isActive, isPending }) =>
        cn(
          'px-3 py-1.5 rounded-lg w-full flex gap-x-2.5 items-center font-medium text-sm',
          {
            'text-gray-500 hover:shadow-haptic-gray-300 hover:text-gray-600 active:bg-gray-50 active:shadow-haptic-gray-400':
              !isActive,
            'text-white active:bg-brand-100 bg-haptic-brand-700 hover:bg-haptic-brand-600':
              isActive,
            'animate-pulse': isPending,
          },
          className,
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          <Icon weight={isActive ? 'duotone' : 'regular'} className="w-5 h-5" />
          {label}
        </>
      )}
    </NavLink>
  );
}
