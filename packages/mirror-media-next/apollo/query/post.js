import { gql } from '@apollo/client'

//TODOs:
// 1. specify DraftBlock typedef
// 2. refactor jsDoc, make it follow jsDoc convention of importing and using
// 3. remove this file, move & refactor related code into fragments/post and query/posts

/**
 * @typedef {'published' | 'draft' | 'scheduled' | 'archived' | 'invisible'} PostState
 */

/**
 * @typedef {Object} Section - certain section information
 * @property {string} id - unique id
 * @property {string} slug - slug, using slug can direct to section page `/section/${slug}`
 * @property {string} name - section name
 */

/**
 * @typedef {Object} Contact - certain personal information
 * @property {string} id - unique id
 * @property {string} name - personal name
 */

/**
 * @typedef {Object} Tag - certain tag information
 * @property {string} id - unique id
 * @property {string} slug - slug, using slug can direct to tag page `/tag/${slug}`
 * @property {string} name - displayed name
 */

/**
 * @typedef {Object} HeroVideo - certain video information
 * @property {string} id - unique id
 * @property {string} name - name of the video
 * @property {string} urlOriginal - video url
 */

/**
 * @typedef {Object} HeroImage - certain image information
 * @property {string} id - unique id
 * @property {Object} resized - multiple image url with different size
 * @property {string} resized.original - image url which is not resized
 * @property {string} resized.w480 - image url with 480px width
 * @property {string} resized.w800 - image url with 800px width
 * @property {string} resized.w1200 - image url with 1200px width
 * @property {string} resized.w1600 - image url with 1600px width
 * @property {string} resized.w2400 - image url with 2400px width
 */

/**
 * @typedef {Object} Related
 * @property {string} id - unique id
 * @property {string} slug - post slug
 * @property {string} title - post title
 * @property {HeroImage} heroImage - hero image of the post
 */

/**
 * @typedef {Object} Draft
 * @property {DraftBlock[]} blocks
 * @property {Object} entityMap
 */

/**
 * @typedef {Object} DraftBlock
 * @property {Object} [data]
 * @property {Number} [depth]
 * @property {Array} [entityRanges]
 * @property {Array} [inlineStyleRanges]
 * @property {String} [key]
 * @property {String} [text]
 * @property {String} [type]
 */

/**
 * @typedef {Object} Post
 * @property {string} id - unique id of post
 * @property {string} slug - post slug
 * @property {string} title - post title
 * @property {'dark' | 'light'} titleColor - font color of title should be light or dark
 * @property {string} subtitle - post subtitle
 * @property {string} publishedDate - post published date
 * @property {string} updatedAt - post updated date
 * @property {PostState} state - post state, different states will have different post access of viewing
 * @property {Section[]} sections - which sections does this post belong to
 * @property {Section[] | null} manualOrderOfSections - sections with adjusted order
 * @property {Contact[]} writers -  the field called '作者' in cms
 * @property {Contact[] | null} manualOrderOfWriters - writers with adjusted order
 * @property {Contact[]} photographers - the field called '攝影' in cms
 * @property {Contact[]} camera_man - the field called '影音' in cms
 * @property {Contact[]} designers - the field called '設計' in cms
 * @property {Contact[]} engineers - the field called '工程' in cms
 * @property {Contact[]} vocals - the field called '主播' in cms
 * @property {string} extend_byline - the field called '作者(其他)' in cms
 * @property {Tag[]} tags - tags of the post
 * @property {HeroVideo | null} heroVideo - hero video of the post
 * @property {HeroImage | null} heroImage - hero image of the post
 * @property {string} heroCaption - caption to explain hero video or image
 * @property {Draft} brief - post brief
 * @property {Draft} content - post content
 * @property {Related[] | []} relateds related articles selected by cms users
 * @property {Related[] | [] | null} manualOrderOfRelateds related articles with adjusted order
 */

const fetchPostBySlug = gql`
  query fetchPostBySlug($slug: String) {
    post(where: { slug: $slug }) {
      id
      slug
      title
      titleColor
      subtitle
      style
      state
      publishedDate
      updatedAt
      sections {
        id
        name
        slug
      }
      manualOrderOfSections
      writers {
        id
        name
      }
      manualOrderOfWriters
      photographers {
        id
        name
      }
      camera_man {
        id
        name
      }
      designers {
        id
        name
      }
      engineers {
        id
        name
      }
      vocals {
        id
        name
      }
      extend_byline
      tags {
        id
        name
        slug
      }
      heroVideo {
        id
        name
        urlOriginal
      }
      heroImage {
        id
        name
        resized {
          original
          w480
          w800
          w1200
          w1600
          w2400
        }
      }
      heroCaption
      brief
      content
      relateds {
        id
        slug
        title
        heroImage {
          resized {
            w480
            w800
            w1200
            w1600
            w2400
            original
          }
        }
      }
      manualOrderOfRelateds
    }
  }
`

export { fetchPostBySlug }
