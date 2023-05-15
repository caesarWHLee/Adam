import errors from '@twreporter/errors'
import axios from 'axios'

import { GCP_PROJECT_ID, URL_RESTFUL_SERVER } from '../../config/index.mjs'
import { VIDEOHUB_CATEGORIES_PLAYLIST_MAPPING } from '../../constants'
import client from '../../apollo/apollo-client.js'
import { fetchSectionWithCategory } from '../../apollo/query/sections.js'

/**
 * @typedef {Object} YoutubeSearchedVideoItem
 * @property {string} kind - The type of the search result.
 * @property {string} etag - The ETag of the search result.
 * @property {Object} id - The ID of the video.
 * @property {string} id.kind - The type of the video ID.
 * @property {string} id.videoId - The ID of the video.
 * @property {Object} snippet - The snippet of the video.
 * @property {string} snippet.publishedAt - The publish date and time of the video.
 * @property {string} snippet.channelId - The channel ID of the video.
 * @property {string} snippet.title - The title of the video.
 * @property {string} snippet.description - The description of the video.
 * @property {Object} snippet.thumbnails - The thumbnails of the video.
 * @property {Object} snippet.thumbnails.default - The default thumbnail of the video.
 * @property {string} snippet.thumbnails.default.url - The URL of the default thumbnail of the video.
 * @property {number} snippet.thumbnails.default.width - The width of the default thumbnail of the video.
 * @property {number} snippet.thumbnails.default.height - The height of the default thumbnail of the video.
 * @property {Object} snippet.thumbnails.medium - The medium thumbnail of the video.
 * @property {string} snippet.thumbnails.medium.url - The URL of the medium thumbnail of the video.
 * @property {number} snippet.thumbnails.medium.width - The width of the medium thumbnail of the video.
 * @property {number} snippet.thumbnails.medium.height - The height of the medium thumbnail of the video.
 * @property {Object} snippet.thumbnails.high - The high thumbnail of the video.
 * @property {string} snippet.thumbnails.high.url - The URL of the high thumbnail of the video.
 * @property {number} snippet.thumbnails.high.width - The width of the high thumbnail of the video.
 * @property {number} snippet.thumbnails.high.height - The height of the high thumbnail of the video.
 * @property {string} snippet.channelTitle - The title of the channel that uploaded the video.
 * @property {string} snippet.liveBroadcastContent - The live broadcast content of the video.
 * @property {string} snippet.publishTime - The publish date and time of the video.
 */

/**
 * @typedef {Object} YoutubePlaylistVideoItem
 * @property {string} kind - The type of the API resource (always "youtube#playlistItem" for this case).
 * @property {string} etag - The ETag of the playlist item resource.
 * @property {string} id - The ID of the playlist item resource.
 * @property {Object} snippet - The snippet object containing details about the playlist item.
 * @property {string} snippet.publishedAt - The date and time when the playlist item was published.
 * @property {string} snippet.channelId - The ID of the YouTube channel that the playlist item belongs to.
 * @property {string} snippet.title - The title of the playlist item.
 * @property {string} snippet.description - The description of the playlist item.
 * @property {Object} snippet.thumbnails - The object containing URLs and dimensions of the playlist item's thumbnail images.
 * @property {Object} snippet.thumbnails.default - The object containing the URL and dimensions of the default quality thumbnail image.
 * @property {string} snippet.thumbnails.default.url - The URL of the default quality thumbnail image.
 * @property {number} snippet.thumbnails.default.width - The width of the default quality thumbnail image.
 * @property {number} snippet.thumbnails.default.height - The height of the default quality thumbnail image.
 * @property {Object} snippet.thumbnails.medium - The object containing the URL and dimensions of the medium quality thumbnail image.
 * @property {string} snippet.thumbnails.medium.url - The URL of the medium quality thumbnail image.
 * @property {number} snippet.thumbnails.medium.width - The width of the medium quality thumbnail image.
 * @property {number} snippet.thumbnails.medium.height - The height of the medium quality thumbnail image.
 * @property {Object} snippet.thumbnails.high - The object containing the URL and dimensions of the high quality thumbnail image.
 * @property {string} snippet.thumbnails.high.url - The URL of the high quality thumbnail image.
 * @property {number} snippet.thumbnails.high.width - The width of the high quality thumbnail image.
 * @property {number} snippet.thumbnails.high.height - The height of the high quality thumbnail image.
 * @property {Object} snippet.thumbnails.standard - The object containing the URL and dimensions of the standard quality thumbnail image.
 * @property {string} snippet.thumbnails.standard.url - The URL of the standard quality thumbnail image.
 * @property {number} snippet.thumbnails.standard.width - The width of the standard quality thumbnail image.
 * @property {number} snippet.thumbnails.standard.height - The height of the standard quality thumbnail image.
 */

/**
 * @typedef {Object} PlaylistVideoItem
 * @property {YoutubePlaylistVideoItem[]} items
 * @property {string} name
 * @property {string} slug
 */

/**
 * @param {Object} props
 * @param {YoutubeSearchedVideoItem} props.highestViewCountVideo
 * @param {YoutubeSearchedVideoItem[]} props.latestVideos
 * @param {PlaylistVideoItem[]} props.playlistsVideos
 */
export default function SectionVideohub({
  highestViewCountVideo,
  latestVideos,
  playlistsVideos,
}) {
  return (
    <div>
      <h2>熱門影片</h2>
    </div>
  )
}

export async function getServerSideProps({ req }) {
  const traceHeader = req.headers?.['x-cloud-trace-context']
  let globalLogFields = {}
  if (traceHeader && !Array.isArray(traceHeader)) {
    const [trace] = traceHeader.split('/')
    globalLogFields[
      'logging.googleapis.com/trace'
    ] = `projects/${GCP_PROJECT_ID}/traces/${trace}`
  }

  const date = new Date()
  // 1 week ago
  date.setDate(date.getDate() - 7)
  const oneWeekAgoTS = date.toISOString()

  let responses = await Promise.allSettled([
    axios({
      method: 'get',
      url: `${URL_RESTFUL_SERVER}/youtube/search`,
      params: new URLSearchParams([
        ['channelId', 'UCYkldEK001GxR884OZMFnRw'],
        ['part', 'snippet'],
        ['order', 'viewCount'],
        ['maxResults', '1'],
        ['publishedAfter', oneWeekAgoTS],
        ['type', 'video'],
      ]),
    }),
    axios({
      method: 'get',
      url: `${URL_RESTFUL_SERVER}/youtube/search`,
      params: new URLSearchParams([
        ['channelId', 'UCYkldEK001GxR884OZMFnRw'],
        ['part', 'snippet'],
        ['order', 'date'],
        ['maxResults', '4'],
        ['type', 'video'],
      ]),
    }),
    client.query({
      query: fetchSectionWithCategory,
      variables: {
        where: {
          slug: 'videohub',
        },
      },
    }),
  ])

  let handledResponses = responses.map((response) => {
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

  const highestViewCountVideo = handledResponses[0]?.items?.[0]
  const latestVideos = handledResponses[1]?.items

  const categories = handledResponses[2]?.section.categories

  const channelIds = categories.map(
    (category) => VIDEOHUB_CATEGORIES_PLAYLIST_MAPPING[category.slug]
  )

  responses = await Promise.allSettled([
    ...channelIds.map((channelId) =>
      axios({
        method: 'get',
        url: `${URL_RESTFUL_SERVER}/youtube/playlistItems`,
        // use URLSearchParams to add two values for key 'part'
        params: new URLSearchParams([
          ['playlistId', channelId],
          ['part', 'snippet'],
          ['part', 'status'],
          ['maxResults', '10'],
          ['pageToken', ''],
        ]),
      })
    ),
  ])
  handledResponses = responses.map((response) => {
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

  const playlistsVideos = categories.map((category, index) => ({
    ...category,
    items: handledResponses[index].items
      ?.filter((item) => item.status.privacyStatus === 'public')
      .slice(0, 4),
  }))

  const props = {
    highestViewCountVideo,
    latestVideos,
    playlistsVideos,
  }
  return { props }
}
