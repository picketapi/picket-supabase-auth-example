import { GetServerSideProps } from "next";
import Head from "next/head";
import { useState, useCallback } from "react";
import Cookies from "js-cookie";

import styles from "../styles/Home.module.css";

import { usePicket } from "@picketapi/picket-react";
import { getSupabase, cookieName } from "../utils/supabase";

type Props = {
  loggedIn: boolean;
  completedTutorial: boolean;
};

export default function Home(props: Props) {
  const [loggedIn, setLoggedIn] = useState(props.loggedIn);
  const [completedTutorial, setCompletedTutorial] = useState(
    props.completedTutorial
  );

  const { login, logout, authState, isAuthenticated } = usePicket();

  const handleLogin = useCallback(async () => {
    let auth = authState;
    if (!auth) {
      auth = await login();
    }

    // error
    if (!auth) return;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: auth.accessToken,
      }),
    });
    // error
    if (res.status !== 200) return;

    const sbAccessToken = Cookies.get(cookieName);
    // something went wrong
    if (!sbAccessToken) return;

    setLoggedIn(true);
    const supabase = getSupabase(sbAccessToken);

    // mark "tutorial" completion
    const { error } = await supabase.from("tutorials").upsert(
      {
        name: "Picket + Supabase Tutorial",
        wallet_address: auth.user.walletAddress,
        completed: true,
      },
      { onConflict: "name, wallet_address" }
    );

    if (error) return;
    setCompletedTutorial(true);
  }, [authState, login]);

  const handleLogout = useCallback(async () => {
    await logout();
    setLoggedIn(false);
    setCompletedTutorial(false);
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, [logout]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Picket 💜 Supabase</title>
        <meta
          name="description"
          content="A demo app integrating Picket (https://picketapi.com) and Supabase"
        />
        <link rel="icon" href="/favicon.ico" />
        {/* Social metadata */}
        <meta property="og:title" content="Picket" />
        <meta
          property="og:description"
          content="A single API for wallet login and to token gate anything."
        />
        <meta property="og:site_name" content="Picket 💜 Supabase" />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          // TODO: Replace once we have a dedicated URL
          content="https://picketapi.com"
        />
        <meta
          name="image"
          property="og:image"
          // TODO: Replace once we have a dedicated URL
          content="https://picketapi.com/images/social.png"
        />
        <meta property="og:image:type" content="image/png" />
        <meta
          property="og:image:alt"
          content="A single API for wallet login and to token gate anything."
        />
        <meta name="twitter:card" content="summary_large_image" />
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

        {!(loggedIn && completedTutorial) && (
          <p className={styles.description}>
            Log in to see what you can do with Picket + Supabase!
            <br />
            <br />
            <button className={styles.button} onClick={() => handleLogin()}>
              Log In with Your Wallet
            </button>{" "}
          </p>
        )}
        {loggedIn && completedTutorial && (
          <p className={styles.description}>
            You&apos;re logged in. We can&apos;t wait to see what experiences
            you create with Picket + Supabase.
            <br />
            <br />
            Explore the links below to start building!
          </p>
        )}

        {loggedIn && completedTutorial && (
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
            <button className={styles.button} onClick={() => handleLogout()}>
              Log Out to Switch Wallets
            </button>
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
        completedTutorial: false,
      },
    };
  }

  // check if logged in user has completed the tutorial
  const supabase = getSupabase(accessToken);
  const { data } = await supabase.from("tutorials").select("*").maybeSingle();

  return {
    props: {
      loggedIn: true,
      completedTutorial: Boolean(data && data?.completed),
    },
  };
};
