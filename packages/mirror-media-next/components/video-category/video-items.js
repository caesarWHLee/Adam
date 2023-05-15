import axios from 'axios'
import { URL_RESTFUL_SERVER } from '../../config/index.mjs'
import styled from 'styled-components'
import Image from 'next/image'
import LoadingPage from '../../public/images/loading_page.gif'
import InfiniteScrollList from '../infinite-scroll-list'
import { useState } from 'react'

const Loading = styled.div`
  margin: 20px auto 0;
  padding: 0 0 20px;
  text-align: center;

  ${({ theme }) => theme.breakpoint.xl} {
    margin: 64px auto 0;
    padding: 0 0 64px;
  }
`

export default function VideoItems({ videoItems, initialNextPageToken }) {
  const [nextPageToken, setNextPageToken] = useState(initialNextPageToken)
  const [count, setCount] = useState(1)
  async function fetchYoutubeVideo(nextToken) {
    try {
      const response = await axios({
        method: 'get',
        url: `${URL_RESTFUL_SERVER}/youtube/playlistItems`,
        params: new URLSearchParams([
          ['playlistId', 'PLftq_bkhPR3ZtDGBhyqVGObQXazG_O3M3'],
          ['part', 'snippet'],
          ['part', 'status'],
          ['maxResults', '15'],
          ['pageToken', nextToken],
        ]),
      })
      const nextPageToken = response.data.nextPageToken
      setNextPageToken(nextPageToken)
      setCount((count) => count + 1)
      return response.data.items.filter(
        (item) => item.status.privacyStatus === 'public'
      )
    } catch (error) {
      console.error(error)
      return
    }
  }

  const loader = (
    <Loading key={0}>
      <Image src={LoadingPage} alt="loading page"></Image>
    </Loading>
  )

  return (
    <InfiniteScrollList
      initialList={videoItems}
      renderAmount={15}
      fetchListInPage={fetchYoutubeVideo.bind(null, nextPageToken)}
      fetchCount={nextPageToken ? count + 2 : count}
      loader={loader}
    >
      {(renderList) => (
        <div>
          {renderList.map((videoItem) => (
            <div
              style={{ height: '50px' }}
              key={videoItem.snippet?.resourceId?.videoId}
            >
              {videoItem.snippet.title}
            </div>
          ))}
        </div>
      )}
    </InfiniteScrollList>
  )
}
