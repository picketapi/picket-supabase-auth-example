import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useMemo } from "react";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie";

import styles from "../styles/Home.module.css";

import { getSupabase, cookieName } from "../utils/supabase";

type Todo = {
  name: string;
  completed: boolean;
};

type Props = {
  walletAddress: string;
  todos: Todo[];
};

const displayWalletAddress = (walletAddress: string) =>
  `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

export default function Todos(props: Props) {
  const { walletAddress } = props;
  const [todos, setTodos] = useState(props.todos);

  // avoid re-creating supabase client every render
  const supabase = useMemo(() => {
    const accessToken = Cookies.get(cookieName);
    return getSupabase(accessToken || "");
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Picket 💜 Supabase</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Your Personal Todo List</h1>
        <div
          style={{
            maxWidth: "600px",
            textAlign: "left",
            fontSize: "1.125rem",
            margin: "36px 0 24px 0",
          }}
        >
          <p>Welcome {displayWalletAddress(walletAddress)},</p>
          <p>
            Your todo list is stored in Supabase and are only accessible to you
            and your wallet address. Supabase + Picket makes it easy to build
            scalable, hybrid web2 and web3 apps. Use Supabase to store
            non-critical or private data off-chain like user app preferences or
            todo lists.
          </p>
        </div>
        <div
          style={{
            textAlign: "left",
            fontSize: "1.125rem",
          }}
        >
          <h2>Todo List</h2>
          {todos.map((todo) => (
            <div
              key={todo.name}
              style={{
                margin: "8px 0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={async () => {
                  await supabase.from("todos").upsert({
                    wallet_address: walletAddress,
                    name: todo.name,
                    completed: !todo.completed,
                  });
                  setTodos((todos) =>
                    todos.map((t) =>
                      t.name === todo.name
                        ? { ...t, completed: !t.completed }
                        : t
                    )
                  );
                }}
              />
              <span
                style={{
                  margin: "0 0 0 8px",
                }}
              >
                {todo.name}
              </span>
            </div>
          ))}
          <div
            style={{
              margin: "24px 0",
            }}
          >
            <Link
              href={"/"}
              style={{
                textDecoration: "underline",
              }}
            >
              Go back home &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  // example of fetching data server-side
  const accessToken = req.cookies[cookieName];

  // require authentication
  if (!accessToken) {
    return {
      redirect: {
        destination: "/",
      },
      props: {
        walletAddress: "",
        todos: [],
      },
    };
  }

  // check if logged in user has completed the tutorial
  const supabase = getSupabase(accessToken);
  const { walletAddress } = jwt.decode(accessToken) as {
    walletAddress: string;
  };

  // get todos for the users
  // if none exist, create the default todos
  let { data } = await supabase.from("todos").select("*");

  if (!data || data.length === 0) {
    let error = null;
    ({ data, error } = await supabase
      .from("todos")
      .insert([
        {
          wallet_address: walletAddress,
          name: "Complete the Picket + Supabase Tutorial",
          completed: true,
        },
        {
          wallet_address: walletAddress,
          name: "Create a Picket Account (https://picketapi.com/)",
          completed: false,
        },
        {
          wallet_address: walletAddress,
          name: "Read the Picket Docs (https://docs.picketapi.com/)",
          completed: false,
        },
        {
          wallet_address: walletAddress,
          name: "Build an Awesome Web3 Experience",
          completed: false,
        },
      ])
      .select("*"));

    if (error) {
      // log error and redirect home
      console.error(error);
      return {
        redirect: {
          destination: "/",
        },
        props: {
          walletAddress: "",
          todos: [],
        },
      };
    }
  }

  return {
    props: {
      walletAddress,
      todos: data as Todo[],
    },
  };
};
