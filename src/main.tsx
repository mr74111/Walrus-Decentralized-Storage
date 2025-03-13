import React from "react";
import ReactDOM from "react-dom/client";
import {
    createBrowserRouter, redirect,
    RouterProvider,
} from "react-router-dom";
import { Theme } from "@radix-ui/themes";

import ErrorPage from "@/layout/ErrorPage.tsx";
import Layout, { loader as rootLoader } from "@/layout/layout.tsx";
import LoginForm, { action as loginAction } from "@/components/user/LoginForm.tsx";
import Home from "@/components/home/home.tsx";
import Folder, { loader as folderLoader, action as folderAction } from "@/components/folder/folder.tsx";
import Media, { loader as mediaLoader } from "@/components/media/media.tsx";
import Setting, { loader as settingLoader, action as settingAction } from "@/components/setting/setting.tsx"; // ✅ Fixed import

import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";

import { apiAuthProvider } from "@/hooks/useAuthStatus.ts";

console.log(import.meta.env);

const router = createBrowserRouter([
    {
        id: "root",
        path: "/",
        Component: Layout,
        errorElement: <ErrorPage />,
        loader: rootLoader,
        children: [
            {
                index: true,
                Component: Home,
            },
            {
                path: "folder/:id",
                element: <Folder />,
                loader: folderLoader,
                action: folderAction,
            },
            {
                path: "media/:type",
                element: <Media />,
                loader: mediaLoader,
            },
            {
                path: "setting",
                Component: Setting,
                loader: settingLoader,
                action: settingAction, // ✅ Fixed: Added action
            },
        ],
    },
    {
        path: "/login",
        Component: LoginForm,
        action: loginAction,
    },
    {
        path: "/logout",
        loader: async () => {
            await apiAuthProvider.signout();
            return redirect("/login");
        },
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <Theme appearance="light" accentColor="grass">
        <RouterProvider router={router} />
    </Theme>
);
