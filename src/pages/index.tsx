import Head from "next/head";
import styles from "styles/home.module.scss";

export default function Index() {
  return (
    <>
      <Head>
        <title>Hello world!</title>
      </Head>

      <h1 className={styles.title}>Hello world!</h1>
    </>
  );
}
