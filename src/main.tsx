import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { LoginPage } from "./pages/auth/login";
import { RegisterPage } from "./pages/auth/register";
import { ForgotPasswordPage } from "./pages/auth/forgot-password";
import { DashboardRoot } from "./pages/dashboard/dashboard.root";
import { DashboardOverviewPage } from "./pages/dashboard/overview";
import { UserManagementIndex } from "./pages/user-management/user-management.index";
import localforage from "localforage";

const router = createBrowserRouter([
  {
    path: "auth",
    async loader() {
      const unparsedCurrentUser = await localforage.getItem("current_user");

      if (unparsedCurrentUser) {
        return redirect("/");
      }

      return null;
    },
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    path: "/",
    async loader() {
      const unparsedCurrentUser = await localforage.getItem("current_user");

      if (!unparsedCurrentUser) {
        return redirect("/auth/login");
      }

      return null;
    },
    element: <DashboardRoot />,
    children: [
      {
        element: <DashboardOverviewPage />,
        index: true,
      },
      {
        path: "user-management",
        children: [
          {
            element: <UserManagementIndex />,
            index: true,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
