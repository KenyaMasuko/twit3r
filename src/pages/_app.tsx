import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import { Container } from "../components/Container";
import { LoggedOut } from "../components/LoggedOut";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Container>
        <main>
          <Component {...pageProps} />
        </main>
      </Container>
      <LoggedOut />
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
