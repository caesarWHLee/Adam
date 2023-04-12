import errors from '@twreporter/errors'

import client from '../../apollo/apollo-client'
import axios from 'axios'

import { fetchTopic } from '../../apollo/query/topics'
import { GCP_PROJECT_ID } from '../../config/index.mjs'
import TopicList from '../../components/topic/list/topic-list'

const RENDER_PAGE_SIZE = 12

export default function Topic({ topic, slideshowData }) {
  switch (topic.type) {
    case 'list':
      return (
        <TopicList
          topic={topic}
          renderPageSize={RENDER_PAGE_SIZE}
          slideshowData={slideshowData}
        />
      )

    default:
      break
  }
}

/**
 * @type {import('next').GetServerSideProps}
 */
export async function getServerSideProps({ query, req }) {
  const topicId = query.id
  const traceHeader = req.headers?.['x-cloud-trace-context']
  let globalLogFields = {}
  if (traceHeader && !Array.isArray(traceHeader)) {
    const [trace] = traceHeader.split('/')
    globalLogFields[
      'logging.googleapis.com/trace'
    ] = `projects/${GCP_PROJECT_ID}/traces/${trace}`
  }

  const responses = await Promise.allSettled([
    client.query({
      query: fetchTopic,
      variables: {
        topicFilter: { id: topicId },
        postsFilter: { state: { equals: 'published' } },
        postsOrderBy: [{ isFeatured: 'desc' }, { publishedDate: 'desc' }],
        postsTake: RENDER_PAGE_SIZE * 2,
        postsSkip: 0,
      },
    }),
  ])

  const handledResponses = responses.map((response) => {
    if (response.status === 'fulfilled') {
      return response.value.data
    } else if (response.status === 'rejected') {
      const { graphQLErrors, clientErrors, networkError } = response.reason
      const annotatingError = errors.helpers.wrap(
        response.reason,
        'UnhandledError',
        'Error occurs while getting topic page data'
      )

      console.log(
        JSON.stringify({
          severity: 'ERROR',
          message: errors.helpers.printAll(
            annotatingError,
            {
              withStack: true,
              withPayload: true,
            },
            0,
            0
          ),
          debugPayload: {
            graphQLErrors,
            clientErrors,
            networkError,
          },
          ...globalLogFields,
        })
      )
      return
    }
  })

  const topic = handledResponses[0]?.topic || []
  let slideshowData = []
  if (topic && topic.leading === 'slideshow') {
    // mm 2.0 fetch way, need to be changed to query mm k6 directly
    const { data } = await axios({
      method: 'get',
      url: 'http://104.199.190.189:8080/images?where=%7B%22topics%22%3A%7B%22%24in%22%3A%5B%225a30e6ae4be59110005c5e6b%22%5D%7D%7D&max_results=25',
      timeout: 1500,
    })
    slideshowData = data?._items
  }

  const props = {
    topic,
    slideshowData,
  }

  return { props }
}
