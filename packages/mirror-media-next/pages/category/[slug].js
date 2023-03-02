import errors from '@twreporter/errors'
import styled from 'styled-components'

import client from '../../apollo/apollo-client'
import { fetchPosts } from '../../apollo/query/posts'
import { fetchCategorySections } from '../../apollo/query/categroies'
import CategoryArticles from '../../components/category-articles'
import { GCP_PROJECT_ID } from '../../config'

const CategoryContainer = styled.main`
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
const CategoryTitle = styled.h1`
  margin: 20px 0 16px 16px;
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
    font-size: 20.8px;
    font-weight: 600;
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
 * @param {import('../../type/category').Category} props.category
 * @param {Number} props.postsCount
 * @returns {React.ReactElement}
 */
export default function Category({ postsCount, posts, category }) {
  return (
    <CategoryContainer>
      <CategoryTitle sectionName={category?.sections?.slug}>
        {category?.name}
      </CategoryTitle>
      <CategoryArticles
        postsCount={postsCount}
        posts={posts}
        category={category}
        renderPageSize={RENDER_PAGE_SIZE}
      />
    </CategoryContainer>
  )
}

/**
 * @type {import('next').GetServerSideProps}
 */
export async function getServerSideProps({ query, req }) {
  const categorySlug = query.slug
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
          categories: { some: { slug: { equals: categorySlug } } },
        },
      },
    }),
    client.query({
      query: fetchCategorySections,
      variables: {
        categorySlug,
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
        'Error occurs while getting index page data'
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
  /** @type {import('../../type/category').Category} */
  const category = handledResponses[1]?.category || {}
  const isMember = category.isMemberOnly

  const props = {
    postsCount,
    posts,
    category,
    isMember,
  }

  return { props }
}
