import styled from 'styled-components'
import client from '../../apollo/apollo-client'

import InfiniteScrollList from '../infinite-scroll-list'
import Image from 'next/legacy/image'
import LoadingPage from '../../public/images/loading_page.gif'
import { fetchTopic } from '../../apollo/query/topics'
import ListArticles from './list-articles'

const Loading = styled.div`
  margin: 20px auto 0;
  padding: 0 0 20px;
  text-align: center;

  ${({ theme }) => theme.breakpoint.xl} {
    margin: 64px auto 0;
    padding: 0 0 64px;
  }
`

/**
 * @typedef {import('./list-articles').Article} Article
 */

/**
 *
 * @param {Object} props
 * @param {number} props.postsCount
 * @param {Article[]} props.posts
 * @param {string} props.topicId
 * @param {number} props.renderPageSize
 * @returns {React.ReactElement}
 */
export default function TopicListArticles({
  postsCount,
  posts,
  topicId,
  renderPageSize,
}) {
  async function fetchTopicPostsFromPage(page) {
    try {
      const response = await client.query({
        query: fetchTopic,
        variables: {
          topicFilter: { id: topicId },
          postsFilter: { state: { equals: 'published' } },
          postsOrderBy: [{ isFeatured: 'desc' }, { publishedDate: 'desc' }],
          postsTake: renderPageSize * 2,
          postsSkip: (page - 1) * renderPageSize * 2,
        },
      })
      console.log(response.data)
      return response.data.topic.posts
    } catch (error) {
      console.error(error)
    }
    return
  }

  const loader = (
    <Loading key={0}>
      <Image src={LoadingPage} alt="loading page"></Image>
    </Loading>
  )

  return (
    <InfiniteScrollList
      initialList={posts}
      renderAmount={renderPageSize}
      fetchCount={Math.ceil(postsCount / renderPageSize)}
      fetchListInPage={fetchTopicPostsFromPage}
      loader={loader}
    >
      {(renderList) => <ListArticles renderList={renderList} />}
    </InfiniteScrollList>
  )
}
