import errors from '@twreporter/errors'
import styled from 'styled-components'

import client from '../../apollo/apollo-client'
import { fetchPosts } from '../../apollo/query/posts'
import { fetchSection } from '../../apollo/query/sections'
import SectionArticles from '../../components/shared/section-articles'
import { GCP_PROJECT_ID } from '../../config/index.mjs'

const SectionContainer = styled.main`
  width: 320px;
  margin: 0 auto;

  ${({ theme }) => theme.breakpoint.md} {
    width: 672px;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    width: 1024px;
    padding: 0;
  }
`
const SectionTitle = styled.h1`
  margin: 16px 17px;
  font-size: 16px;
  line-height: 1.15;
  font-weight: 500;
  color: ${
    /**
     * @param {Object} props
     * @param {String } props.sectionName
     * @param {Theme} [props.theme]
     */
    ({ sectionName, theme }) =>
      sectionName && theme.color.sectionsColor[sectionName]
        ? theme.color.sectionsColor[sectionName]
        : theme.color.brandColor.lightBlue
  };
  ${({ theme }) => theme.breakpoint.md} {
    margin: 20px 0 24px;
    font-size: 28px;
    font-weight: 600;
    display: flex;
    align-items: center;
    &::before,
    &::after {
      content: '';
      display: inline-block;
      height: 2px;
      background: black;
      flex-grow: 1;
    }
    &::before {
      margin-right: 30px;
    }
    &::after {
      margin-left: 40px;
    }
  }
  ${({ theme }) => theme.breakpoint.xl} {
    margin: 24px 0 28px;
    font-size: 28px;
  }
`

const RENDER_PAGE_SIZE = 12

/**
 * @param {Object} props
 * @param {import('../../type/shared/article').Article[]} props.posts
 * @param {import('../../type/section').Section} props.section
 * @param {number} props.postsCount
 * @param {boolean} props.isPremium
 * @returns {React.ReactElement}
 */
export default function Section({ postsCount, posts, section, isPremium }) {
  return (
    <SectionContainer>
      <SectionTitle sectionName={section?.slug}>{section?.name}</SectionTitle>
      <SectionArticles
        postsCount={postsCount}
        posts={posts}
        section={section}
        renderPageSize={RENDER_PAGE_SIZE}
        isPremium={isPremium}
      />
    </SectionContainer>
  )
}

/**
 * @type {import('next').GetServerSideProps}
 */
export async function getServerSideProps({ query, req }) {
  const sectionSlug = query.slug
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
      query: fetchPosts,
      variables: {
        take: RENDER_PAGE_SIZE * 2,
        skip: 0,
        orderBy: { publishedDate: 'desc' },
        filter: {
          state: { equals: 'published' },
          AND: [
            { sections: { some: { slug: { equals: sectionSlug } } } },
            { sections: { some: { slug: { equals: 'member' } } } },
          ],
        },
      },
    }),
    client.query({
      query: fetchSection,
      variables: {
        where: { slug: sectionSlug },
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
        'Error occurs while getting premiumsection page data'
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

  /** @type {Number} postsCount */
  const postsCount = handledResponses[0]?.postsCount || 0
  /** @type {import('../../type/shared/article').Article[]} */
  const posts = handledResponses[0]?.posts || []
  /** @type {import('../../type/section').Section} */
  const section = handledResponses[1]?.section || {}

  const props = {
    postsCount,
    posts,
    section,
    isPremium: true,
  }

  return { props }
}