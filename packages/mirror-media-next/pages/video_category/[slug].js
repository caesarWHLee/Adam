import errors from '@twreporter/errors'
import axios from 'axios'

import { GCP_PROJECT_ID, URL_RESTFUL_SERVER } from '../../config/index.mjs'
import VideoItems from '../../components/video-category/video-items.js'

export default function VideoCategory({ videoItems, ytNextPageToken }) {
  return (
    <div>
      <h1>VideoCategory</h1>
      <VideoItems
        videoItems={videoItems}
        initialNextPageToken={ytNextPageToken}
      />
    </div>
  )
}

/**
 * todo
 * 0. add Type
 * 1. refactor fetch youtube playlist function into a utils
 * 2. refine code
 * 3. UI , components
 * 4. InfiniteScrollList now use mock fetchCount, see if any improvement InfiniteScrollList can do
 */

export async function getServerSideProps({ query, req }) {
  const videoCategorySlug = query.slug
  const traceHeader = req.headers?.['x-cloud-trace-context']
  let globalLogFields = {}
  if (traceHeader && !Array.isArray(traceHeader)) {
    const [trace] = traceHeader.split('/')
    globalLogFields[
      'logging.googleapis.com/trace'
    ] = `projects/${GCP_PROJECT_ID}/traces/${trace}`
  }

  const responses = await Promise.allSettled([
    axios({
      method: 'get',
      url: `${URL_RESTFUL_SERVER}/youtube/playlistItems`,
      // use URLSearchParams to add two values for key 'part'
      params: new URLSearchParams([
        ['playlistId', 'PLftq_bkhPR3ZtDGBhyqVGObQXazG_O3M3'],
        ['part', 'snippet'],
        ['part', 'status'],
        ['maxResults', '15'],
        ['pageToken', ''],
      ]),
    }),
  ])

  const handledResponses = responses.map((response) => {
    if (response.status === 'fulfilled') {
      return response.value.data
    } else if (response.status === 'rejected') {
      const annotatingError = errors.helpers.wrap(
        response.reason,
        'UnhandledError',
        'Error occurs white getting video category page data'
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
          ...globalLogFields,
        })
      )
      return
    }
  })

  const videoItems = handledResponses[0]?.items.filter(
    (item) => item.status.privacyStatus === 'public'
  )
  const ytNextPageToken = handledResponses[0]?.nextPageToken

  const props = {
    videoItems,
    ytNextPageToken,
  }

  return { props }
}
