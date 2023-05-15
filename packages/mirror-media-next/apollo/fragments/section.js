import { gql } from '@apollo/client'

/**
 * @typedef {Object} sectionWithCategory
 * @property {string} name
 * @property {string} slug
 */

/**
 * @typedef {Object} Section
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {sectionWithCategory[]} categories
 */

export const section = gql`
  fragment section on Section {
    id
    name
    slug
  }
`

export const sectionWithCategory = gql`
  fragment section on Section {
    id
    name
    slug
    categories {
      name
      slug
    }
  }
`
