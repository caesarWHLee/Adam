import errors from '@twreporter/errors'

import client from '../../apollo/apollo-client'
import { fetchTopic } from '../../apollo/query/topics'
import { GCP_PROJECT_ID } from '../../config/index.mjs'

export default function Topic({ topic }) {
  return <div>Topic {topic.name}</div>
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

  const props = {
    topic,
  }

  return { props }
}
