import { AppProps } from 'next/app'
import Layout from 'layout'
import "styles/App.css";
import 'styles/globals.css'

import 'vendor/index.scss'
import 'vendor/home.scss'

function App({ Component, router }: AppProps) {
  return (
    <Layout
      router={router}
      networks={process.env.APP_ENV === 'dev' ? [4] : [1]}
    >
      <Component />
    </Layout>
  )
}

export default App
