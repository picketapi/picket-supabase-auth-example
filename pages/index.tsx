import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
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
          <span className={styles.titleDemo}>Demo of</span>
          <div className={styles.titleCompanies}>
            <a
              href="https://picketapi.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.titlePicket}
            >
              <Image
                src="/picket.svg"
                alt="Picket Logo"
                width={56}
                height={56}
              />
              Picket
            </a>
            <span className={styles.titlePlus}>+</span>{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.titlePicket}
            >
              <Image
                src="/supabase.svg"
                alt="Supabase Logo"
                width={56}
                height={56}
              />
              supabase
            </a>
          </div>
        </h1>

        {!loggedIn && (
          <div className={styles.loginSection}>
            <button className={styles.buttonLg} onClick={() => handleLogin()}>
              Log In with Your Wallet
            </button>
          </div>
        )}
        {loggedIn && (
          <p className={styles.description}>
            You&apos;re logged in. Explore the links below to start building!
          </p>
        )}

        {!loggedIn && (
          <div className={styles.infoSection}>
            <div className={styles.infoBlock}>
              <h2>What is happening under the hood?</h2>
              <p>
                <a href="https://picketapi.com">Picket</a> is the easiest and
                most secure way to add wallet login and token gating to your
                application.{" "}
                <a href="https://supabase.com" className={styles.supabaseGreen}>
                  Supabase
                </a>{" "}
                is a popular open source alternative to Firebase that offers
                exceptional user management.
              </p>
              <p>
                With Picket’s Supabase integration you get the best of the web2
                and web3 worlds. You get to use Supabase’s data management SDKs
                and UI with Picket’s wallet login and token gating features.
              </p>
              <p>
                For this demo, we have set up a simple Supabase todo list
                application. When you log in with your wallet, you’ll gain
                access to a todo list. The todo list is stored in Supabase and
                is only accessible by your wallet. Use Supabase to store
                non-critical or private data off-chain like user app preferences
                or todo lists.
              </p>
              <p>
                Wallet login is the first step to building scalable and secure
                hybrid web2 and web3 applications. Picket + Supabase makes it
                easier than ever to get started.
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h2>Want to build your own Supabase app with wallet login?</h2>
              <p>
                Get started now at{" "}
                <a href="https://picketapi.com">picketapi.com</a>
              </p>
            </div>
          </div>
        )}

        {loggedIn && (
          <>
            <div className={styles.grid}>
              <a href="https://picketapi.com" className={styles.card}>
                <h2>Sign Up &rarr;</h2>
                <p>
                  Create an account to start building web3 auth experiences.
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
            <div className={styles.divider} />
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                gap: "16px",
              }}
            >
              <Link className={styles.button} href="/todos">
                View Todo List
              </Link>
              <button className={styles.button} onClick={() => handleLogout()}>
                Switch Wallets
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
