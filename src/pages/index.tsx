import Head from "next/head";
import styles from "styles/home.module.scss";
import { trpc } from "utils/trpc";

export default function Index() {
  const sessionQuery = trpc.useQuery(["user.getSession"], { ssr: false });

  return (
    <>
      <Head>
        <title>Hello world!</title>
      </Head>

      <h1 className={styles.title}>Welcome back {sessionQuery.data?.user?.email}</h1>
    </>
  );
}
