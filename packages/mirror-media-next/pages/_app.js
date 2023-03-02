import React from 'react'
import { GlobalStyles } from '../styles/global-styles'
import { ThemeProvider } from 'styled-components'
import { theme } from '../styles/theme'
import Layout from '../components/layout'
import axios from 'axios'
import { ApolloProvider } from '@apollo/client'
import client from '../apollo/apollo-client'
import {
  URL_STATIC_COMBO_SECTIONS,
  URL_STATIC_COMBO_TOPICS,
  API_TIMEOUT,
} from '../config'
import MemberLayout from '../components/member-layout'

function defaultGetLayout(page, sectionsData, topicsData) {
  const { isMember } = page.props

  return (
    <>
      {!isMember && (
        <Layout sectionsData={sectionsData} topicsData={topicsData}>
          {page}
        </Layout>
      )}
      {isMember && (
        <MemberLayout sectionsData={sectionsData} topicsData={topicsData}>
          {page}
        </MemberLayout>
      )}
    </>
  )
}

/**
 *
 * @param {Object} props
 * @param {React.ElementType} props.Component
 * @param {Object} props.pageProps
 * @param {Object[]} props.sectionsData
 * @param {Object[]} props.topicsData
 * @returns {React.ReactElement}
 */

function MyApp({ Component, pageProps, sectionsData = [], topicsData = [] }) {
  const getLayout = Component.getLayout || defaultGetLayout
  return (
    <>
      <GlobalStyles />
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          {getLayout(<Component {...pageProps} />, sectionsData, topicsData)}
        </ThemeProvider>
      </ApolloProvider>
    </>
  )
}

/**
 * TODO: add specific data structure for sectionsData and topicsData, not just an object of array.
 * @typedef {Object[]} Items
 */

/**
 * @typedef {Object} DataRes
 * @property {Items} [_items]
 * @property {Object} [_endpoints]
 * @property {Object} [_endpoints.topics]
 * @property {Items} [_endpoints.topics._items]
 * @property {Object} _links
 * @property {Object} _meta
 */

/** @typedef {import('axios').AxiosResponse<DataRes>} AxiosResponse */

/**
 * @async
 * @returns {Promise<{sectionsData: Items | [] ,topicsData: Items | []}>}
 */
MyApp.getInitialProps = async () => {
  try {
    const responses = await Promise.allSettled([
      axios({
        method: 'get',
        url: URL_STATIC_COMBO_SECTIONS,
        timeout: API_TIMEOUT,
      }),
      axios({
        method: 'get',
        url: URL_STATIC_COMBO_TOPICS,
        timeout: API_TIMEOUT,
      }),
    ])
    /** @type {PromiseFulfilledResult<AxiosResponse>} */
    const sectionsResponse = responses[0].status === 'fulfilled' && responses[0]
    /** @type {PromiseFulfilledResult<AxiosResponse>} */
    const topicsResponse = responses[1].status === 'fulfilled' && responses[1]

    const sectionsData = Array.isArray(sectionsResponse?.value?.data?._items)
      ? sectionsResponse?.value?.data?._items
      : []

    const topicsData = Array.isArray(
      topicsResponse?.value?.data?._endpoints?.topics?._items
    )
      ? topicsResponse?.value?.data?._endpoints?.topics?._items
      : []

    console.log(
      JSON.stringify({
        severity: 'DEBUG',
        message: `Successfully fetch sections and topics from ${URL_STATIC_COMBO_SECTIONS} and ${URL_STATIC_COMBO_TOPICS}`,
      })
    )
    return {
      sectionsData,
      topicsData,
    }
  } catch (error) {
    console.log(JSON.stringify({ severity: 'ERROR', message: error.stack }))
    return {
      sectionsData: [],
      topicsData: [],
    }
  }
}

export default MyApp
