import React, { useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroller'
import LoadingPage from '../public/images/loading_page.gif'
import LatestNewsItem from './latest-news-item'
import { transformRawDataToArticleInfo } from '../utils'
import { URL_STATIC_POST_EXTERNAL } from '../config'
import Image from 'next/legacy/image'

const Wrapper = styled.section`
  width: 100%;
  margin: 20px auto 40px;
  max-width: 320px;
  text-align: center;

  h2 {
    color: ${({ theme }) => theme.color.brandColor.darkBlue};
    font-size: 20px;
    line-height: 1.4;
    font-weight: 500;
    margin: 12px auto;
    ${({ theme }) => theme.breakpoint.md} {
      margin: 24px auto;
      font-weight: 700;
    }
    ${({ theme }) => theme.breakpoint.xl} {
      margin: 20px auto;
      text-align: left;
      font-size: 28px;
      line-height: 1.15;
    }
  }

  ${({ theme }) => theme.breakpoint.md} {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }
`
const ItemContainer = styled.div`
  ${({ theme }) => theme.breakpoint.md} {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, 244px);
    justify-content: center;
  }
`

const Test = styled.div`
  border: 1px solid black;
  background-color: #f7ecdf;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999999;
`
const Loading = styled.div`
  margin: 20px auto 0;
  padding: 0 0 20px;
  ${({ theme }) => theme.breakpoint.xl} {
    margin: 64px auto 0;
    padding: 0 0 64px;
  }
`
/** the amount of articles every time we load more */
const RENDER_PAGE_SIZE = 20

/** number of json files has latest news, and we need to fetch  */
const JSON_FILE_COUNT = 4
/**
 * @typedef {import('../type/raw-data.typedef').RawData} RawData
 */
/**
 * @typedef {import('../type/index').ArticleInfoCard} ArticleInfoCard
 */

/**
 * @param {RawData[]} articleRawData
 * @returns {RawData[]}
 */
function removeArticleWithExternalLink(articleRawData) {
  return articleRawData?.filter((item) => {
    if (!item.redirect) {
      return item
    }
    const redirectLink = item.redirect?.trim()
    return (
      !redirectLink.startsWith('https://') &&
      !redirectLink.startsWith('http://') &&
      !redirectLink.startsWith('www.')
    )
  })
}

/**
 * @param {RawData[]} articleRawData
 * @returns {ArticleInfoCard[]}
 */
const transformRawDataContent = function (articleRawData) {
  return transformRawDataToArticleInfo(
    removeArticleWithExternalLink(articleRawData)
  )
}
/**
 * @param {Object} props
 * @param {RawData[]} [props.latestNewsData = []]
 * @param {String} [props.latestNewsTimestamp = '']
 * @returns {React.ReactElement}
 */

export default function LatestNews(props) {
  // we use two state,`obtainedLatestNews` and `renderedLatestNews.
  // `obtainedLatestNews` is an array for placing the data we fetched from certain json file.
  // `renderedLatestNews` is an array for placing the article we render.
  // `obtainedLatestNews` is initialized by `props.latestNewsData`, which is passed from index.page.
  // `renderedLatestNews` is initialized by first 20 amount of item in `obtainedLatestNews`.

  // Our goal is not immediately but progressively fetch data and render it,
  // we will fetch data from certain json file, then temporarily store data at `obtainedLatestNews`,
  // and push a part of it into `renderedLatestNews` for render article.

  const [obtainedLatestNews, setObtainedLatestNews] = useState([
    ...transformRawDataContent(props.latestNewsData),
  ])
  const [renderedLatestNews, setRenderedLatestNews] = useState(
    obtainedLatestNews.slice(0, RENDER_PAGE_SIZE)
  )
  const [fetchCount, setFetchCount] = useState(
    obtainedLatestNews.length !== 0 ? 1 : 0
  )
  const [isLoading, setIsLoading] = useState(false)

  const obtainedLatestNewsAmount = obtainedLatestNews.length

  const renderedLatestNewsAmount = renderedLatestNews.length

  //TODO: If we decrease time of `Cache-Control` on index page to 180 seconds, we do no`t need to compare difference between
  // `props.latestNewsTimestamp` current browser time, then we can remove related logic of `shouldUpdateLatestArticle`.

  // If props.latestNewsTimestamp is 3 minute ( 180 * 1000ms ) earlier than browser time , then should fetch same json file again,
  // which is already fetched at server side of index page, then update `obtainedLatestNews`.

  const shouldUpdateLatestArticle = useMemo(() => {
    // Safari can't accept original format ("YYYY-MM-DD hh:mm:ss") to generate Date object,
    // should convert to certain format("YYYY-MM-DDThh:mm:ss") first.

    const formattedTimeStamp = props.latestNewsTimestamp?.replace(/ /g, 'T')
    const articlesUpdateTimestamp = new Date(formattedTimeStamp).getTime()
    const currentTimestamp = new Date().getTime()
    return currentTimestamp - articlesUpdateTimestamp > 1000 * 180
  }, [props.latestNewsTimestamp])

  useEffect(() => {
    if (!shouldUpdateLatestArticle) {
      return
    }
    async function fetchFirstJsonOnClientSide() {
      const latestNewsData = await fetchCertainLatestNews(1)
      if (latestNewsData.length === 0) {
        throw new Error('fetch first json file failed, return empty array')
      }
      /** @type {ArticleInfoCard[]} */
      const latestNews = transformRawDataContent(latestNewsData)
      setObtainedLatestNews([...latestNews])
      setRenderedLatestNews([...latestNews].slice(0, RENDER_PAGE_SIZE))
    }

    fetchFirstJsonOnClientSide()
      .then(() => setFetchCount(1))
      .catch((e) => {
        console.error(e)
      })
  }, [shouldUpdateLatestArticle])

  /**
   * Fetch certain json file
   * @param {Number} [serialNumber = 1]
   * @returns {Promise<RawData[] | []> }
   */
  async function fetchCertainLatestNews(serialNumber = 1) {
    try {
      const { data } = await axios({
        method: 'get',
        url: `${URL_STATIC_POST_EXTERNAL}0${serialNumber}.json`,
        timeout: 5000, //since size of json file is large, we assign timeout as 5000ms to prevent content lost in poor network condition
      })
      /** @type {import('../type/raw-data.typedef').RawData[]} */
      if (Array.isArray(data.latest)) {
        return data.latest
      }
      return []
    } catch (e) {
      console.error(e)
      return []
    }
  }
  /**
   * fetch another json file, which will execute in function `handleLoadMore` at certain condition.
   * this function will not execute when fetchCount is equal to `JSON_FILE_COUNT` , which mean all json has fetched.
   * After fetching data, we update `obtainedLatestNews`, push `latestNews` into `obtainedLatestNews`,and plus fetchCount 1
   */
  async function fetchMoreLatestNews() {
    if (fetchCount === JSON_FILE_COUNT) {
      return
    }
    const latestNewsData = await fetchCertainLatestNews(fetchCount + 1)
    /** @type {ArticleInfoCard[]} */
    const latestNews = transformRawDataContent(latestNewsData)

    setObtainedLatestNews((preState) => [...preState, ...latestNews])
    setFetchCount((preState) => preState + 1)
  }
  /**
   * push `obtainedLatestNews` into `renderedLatestNews` , which will execute in function `handleLoadMore`
   * In this function, we push certain amount of `obtainedLatestNews` into `renderedLatestNews`, the amount of which decided by const `RENDER_PAGE_SIZE`
   */
  function showMoreLatestNews() {
    console.log('setRenderedLatestNews', renderedLatestNewsAmount)
    setRenderedLatestNews((preState) => [
      ...preState,
      ...obtainedLatestNews.slice(
        renderedLatestNewsAmount,
        renderedLatestNewsAmount + RENDER_PAGE_SIZE
      ),
    ])
  }

  /**
   * This function will execute when user scroll to the bottom of latest news
   * In two condition, this function will return and not execute anything:
   * 1. When `isLoading` is true, which means we are fetching new json file. we need this boolean to prevent infinite execute this function.
   * 2. When `obtainedLatestNewsAmount` is equal to `renderedLatestNewsAmount` and fetchCount is equal to `JSON_FILE_COUNT`, which mean all json is fetched and rendered.
   *
   * If `obtainedLatestNewsAmount` minus `renderedLatestNewsAmount` is less than `RENDER_PAGE_SIZE`,
   * which means `obtainedLatestNews` is not enough to push into `renderedLatestNews` and render, so need to execute `fetchMoreLatestNews()` to get more article.
   */
  function handleLoadMore() {
    console.log(
      'handleLoadMore',
      obtainedLatestNewsAmount,
      renderedLatestNewsAmount,
      fetchCount
    )
    if (isLoading) {
      return
    }
    if (
      obtainedLatestNewsAmount === renderedLatestNewsAmount &&
      fetchCount === JSON_FILE_COUNT
    ) {
      return
    } else if (
      obtainedLatestNewsAmount - renderedLatestNewsAmount <=
      RENDER_PAGE_SIZE
    ) {
      setIsLoading(true)
      fetchMoreLatestNews().then(() => setIsLoading(false))
    }
    showMoreLatestNews()
  }

  return (
    <Wrapper>
      {/* Temporary components for developing */}
      <Test>
        <p>文章timestamp:{props.latestNewsTimestamp}</p>
        <p>
          {shouldUpdateLatestArticle ? '需要' : '不需要'}重新於client side 取得
          post_external01.json資料
        </p>
        <p>已fetch json檔{fetchCount}次</p>
        <p>已抓取文章：{obtainedLatestNewsAmount}</p>
        <p>已顯示文章：{renderedLatestNewsAmount}</p>
      </Test>

      <h2>最新文章</h2>

      <InfiniteScroll
        pageStart={20}
        loadMore={handleLoadMore}
        hasMore={
          !(
            obtainedLatestNewsAmount === renderedLatestNewsAmount &&
            fetchCount === 4
          )
        }
        threshold={150}
        loader={
          <Loading key={0}>
            <Image src={LoadingPage} alt="loading page"></Image>
          </Loading>
        }
      >
        <ItemContainer>
          {renderedLatestNews.map((item) => (
            <LatestNewsItem key={item.slug} itemData={item}></LatestNewsItem>
          ))}
        </ItemContainer>
      </InfiniteScroll>
    </Wrapper>
  )
}
