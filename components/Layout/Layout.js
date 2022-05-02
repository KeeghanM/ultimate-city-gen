import Head from "next/head"
import Header from "./header.js"
import PageFooter from "./footer.js"

export default function Layout(props) {
  return (
    <div>
      <Head>
        <title>Ultimate City Gen - {props.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col overflow-x-hidden bg-dark font-merri text-light">
        <Header name={props.name} />
        <div className="min-h-[calc(100vh-200px)] px-24 py-12">
          {props.children}
        </div>
        <PageFooter />
      </div>
    </div>
  )
}
