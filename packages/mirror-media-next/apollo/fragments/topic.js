import { gql } from '@apollo/client'
import { heroImage } from './photo'
import { post } from './post'

/**
 * @typedef {Object} Topic
 * @property {string} [id]
 * @property {string} [name]
 * @property {import('../../type/draft-js').Draft} [brief]
 * @property {import('./photo').Photo} [heroImage]
 * @property {string} [leading]
 * @property {string} [type]
 * @property {string} [style]
 * @property {import('./post').Post[]} [posts]
 */

export const simpleTopic = gql`
  ${heroImage}
  fragment simpleTopic on Topic {
    id
    name
    brief
    heroImage {
      ...heroImage
    }
  }
`

export const topic = gql`
  ${heroImage}
  ${post}
  fragment topic on Topic {
    id
    name
    brief
    heroImage {
      ...heroImage
    }
    leading
    type
    style
    posts(where: $postsFilter, orderBy: $postsOrderBy) {
      ...post
    }
  }
`
