import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback } from "react";

import styles from "../styles/Home.module.css";

import { usePicket } from "@picketapi/picket-react";
import { cookieName } from "../utils/supabase";

type Props = {
  loggedIn: boolean;
};

export default function Home(props: Props) {
  const { loggedIn } = props;
  const { login, logout, authState } = usePicket();
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    let auth = authState;
    if (!auth) {
      auth = await login();
    }

    // login failed
    if (!auth) return;

    // create a supabase access token
    await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: auth.accessToken,
      }),
    });
    // redirect to their todos page
    router.push("/todos");
  }, [authState, login, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // refresh the page
    router.push("/");
  }, [logout, router]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Picket 💜 Supabase</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to the{" "}
          <a
            href="https://picketapi.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Picket
          </a>{" "}
          +{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Supabase
          </a>{" "}
          Demo!
        </h1>

        {!loggedIn && (
          <p className={styles.description}>
            Log in to see what you can do with Picket + Supabase!
            <br />
            <br />
            <button className={styles.button} onClick={() => handleLogin()}>
              Log In with Your Wallet
            </button>{" "}
          </p>
        )}
        {loggedIn && (
          <p className={styles.description}>
            You&apos;re logged in. Explore the links below to start building!
          </p>
        )}

        {loggedIn && (
          <>
            <div className={styles.grid}>
              <a href="https://picketapi.com" className={styles.card}>
                <h2>Sign Up &rarr;</h2>
                <p>
                  Create an account on Picket to start building web3 auth
                  experiences.
                </p>
              </a>

              <a href="https://docs.picketapi.com/" className={styles.card}>
                <h2>Documentation &rarr;</h2>
                <p>
                  Find in-depth information about Picket&apos;s features and
                  API.
                </p>
              </a>

              <a
                href="https://github.com/picketapi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
              >
                <h2>Examples &rarr;</h2>
                <p>Discover and deploy boilerplate example Picket projects.</p>
              </a>

              <a
                href="https://docs.picketapi.com/picket-docs/reference/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
              >
                <h2>Integrate &rarr;</h2>
                <p>
                  Learn how to integrate Picket into your own app or website.
                </p>
              </a>
            </div>
            <br />
            <div
              style={{
                display: "flex",
                gap: "16px",
              }}
            >
              <Link className={styles.button} href="/todos">
                View Your Todo List
              </Link>
              <button className={styles.button} onClick={() => handleLogout()}>
                Log Out to Switch Wallets
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  // example of fetching data server-side
  const accessToken = req.cookies[cookieName];

  if (!accessToken) {
    return {
      props: {
        loggedIn: false,
      },
    };
  }

  return {
    props: {
      loggedIn: true,
    },
  };
};
