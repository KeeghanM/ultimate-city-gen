import Head from "next/head"
import Header from "./Header.js"
import Footer from "./Footer.js"

export default function Layout(props) {
  return (
    <div>
      <Head>
        <title>Ultimate City Gen - {props.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col overflow-x-hidden bg-dark font-merri text-light">
        <Header name={props.name} />
        <div>{props.children}</div>
        <Footer />
      </div>
    </div>
  )
}
