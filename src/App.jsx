import React, { useEffect } from "react";
import { MantineProvider, ColorSchemeProvider, Global } from "@mantine/core";
import {
  NotificationsProvider,
  showNotification,
} from "@mantine/notifications";
import { useLocalStorage } from "@mantine/hooks";
import { supabase } from "./utils/supabaseClient";

import { globalStyles, bodyStyles, notificationStyles } from "./globalStyles";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Navigate, Route, Routes } from "react-router-dom";
import Creator from "./pages/Creator";
import useMainStore from "./store/mainStore";
import Profile from "./pages/Profile";

function App() {
  const setSession = useMainStore((state) => state.setSession);
  const session = useMainStore((state) => state.user);
  const onResize = useMainStore((state) => state.onResize);

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const theme = {
    components: globalStyles,
    colorScheme,
    primaryColor: "yellow",
    primaryShade: 4,

    black: "#323232",

    colors: {
      yellow: [
        "#fff3dc",
        "#fbdfb3",
        "#f6ca86",
        "#f1b559",
        "#eea02b",
        "#d48611",
        "#a5690b",
        "#774b06",
        "#482c00",
        "#1d0e00",
      ],
      gray: [
        "#F2F2F2",
        "#DBDBDB",
        "#C4C4C4",
        "#ADADAD",
        "#969696",
        "#808080",
        "#666666",
        "#4D4D4D",
        "#333333",
        "#1A1A1A",
      ],
    },

    lineHeight: 1.3,
    headings: {
      fontFamily: "IBM Plex Sans, sans-serif",
      fontWeight: 500,
      sizes: {
        h1: { fontSize: "5.653rem" },
        h2: { fontSize: "3.998rem" },
        h3: { fontSize: "2.827rem" },
        h4: { fontSize: "1.999rem" },
        h5: { fontSize: "1.414rem" },
        h6: { fontSize: "0.707rem" },
      },
    },
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    document
      .querySelector(":root")
      .style.setProperty("--vh", window.innerHeight / 100 + "px");

    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <NotificationsProvider>
          <Global styles={bodyStyles} />
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute user={session}>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Creator />} />
          </Routes>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

const PrivateRoute = ({ user, children }) => {
  if (!user) {
    showNotification({
      title: "Session Expired",
      message: "Cannot find your session",
      styles: notificationStyles,
    });
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default App;
