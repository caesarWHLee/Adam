import { gql } from '@apollo/client'
import { heroImage } from './photo'
import { category } from './category'
import { section } from './section'

/**
 * @typedef {Object} Post
 * @property {string} [id]
 * @property {string} [slug]
 * @property {string} [title]
 * @property {string} [publishedDate]
 * @property {import('../../type/draft-js').Draft} [brief]
 * @property {import('./category').Category} [categories]
 * @property {import('./section').Section} [sections]
 * @property {import('./photo').Photo} [heroImage]
 * @property {boolean} [isFeatured]
 */

export const post = gql`
  ${section}
  ${category}
  ${heroImage}
  fragment post on Post {
    id
    slug
    title
    brief
    publishedDate
    state
    sections {
      ...section
    }
    categories {
      ...category
    }
    heroImage {
      ...heroImage
    }
    isFeatured
  }
`
