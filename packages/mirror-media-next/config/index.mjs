const GCP_PROJECT_ID = 'mirrormedia-1470651750304'

// The following variables are from environment variables

const ENV = process.env.NEXT_PUBLIC_ENV || 'local'

// The following variables are given values according to different `ENV`

let API_TIMEOUT = 5000
let API_PROTOCOL = 'http'
let API_HOST = ''
let RESTFUL_API_HOST = ''
let API_PORT = ''

let URL_STATIC_PREMIUM_SECTIONS = ''
let URL_STATIC_NORMAL_SECTIONS = ''
let URL_STATIC_TOPICS = ''
let URL_STATIC_POST_FLASH_NEWS = ''
let URL_STATIC_POST_EXTERNAL = ''
let DONATION_PAGE_URL = ''
let GA_MEASUREMENT_ID = ''
let GTM_ID = ''
let SEARCH_URL = 'search-url/search'
let URL_STATIC_POPULAR_NEWS = ''
let URL_RESTFUL_SERVER = ''

switch (ENV) {
  case 'prod':
    API_TIMEOUT = 1500
    API_HOST = '' //currently unset
    RESTFUL_API_HOST = '' //currently unset
    API_PORT = '' //currently unset
    URL_STATIC_PREMIUM_SECTIONS =
      'https://storage.googleapis.com/v3-statics.mirrormedia.mg/files/json/header_member.json'
    URL_STATIC_NORMAL_SECTIONS =
      'https://storage.googleapis.com/v3-statics.mirrormedia.mg/files/json/header_sections.json'
    URL_STATIC_TOPICS =
      'https://storage.googleapis.com/v3-statics.mirrormedia.mg/files/json/header_topics.json'
    URL_STATIC_POST_FLASH_NEWS =
      'https://storage.googleapis.com/v3-statics.mirrormedia.mg/files/json/header_posts.json'
    URL_STATIC_POST_EXTERNAL =
      'https://storage.googleapis.com/v3-statics.mirrormedia.mg/files/json/post_external'
    URL_RESTFUL_SERVER = `${API_PROTOCOL}://${RESTFUL_API_HOST}:${API_PORT}`
    DONATION_PAGE_URL = 'https://mirrormedia.oen.tw/'
    GA_MEASUREMENT_ID = 'G-341XFN0675'
    GTM_ID = 'GTM-NCH86SP'
    SEARCH_URL = 'https://adam-mirror-media-search-prod-ufaummkd5q-de.a.run.app'
    URL_STATIC_POPULAR_NEWS = `https://editools-gcs-${ENV}.readr.tw/popular.json`
    break
  case 'staging':
    API_TIMEOUT = 1500
    API_HOST = '' //currently unset
    RESTFUL_API_HOST = '' //currently unset
    API_PORT = '' //currently unset
    URL_STATIC_PREMIUM_SECTIONS =
      'https://storage.googleapis.com/v3-statics-staging.mirrormedia.mg/files/json/header_member.json'
    URL_STATIC_NORMAL_SECTIONS =
      'https://storage.googleapis.com/v3-statics-staging.mirrormedia.mg/files/json/header_sections.json'
    URL_STATIC_TOPICS =
      'https://storage.googleapis.com/v3-statics-staging.mirrormedia.mg/files/json/header_topics.json'
    URL_STATIC_POST_FLASH_NEWS =
      'https://storage.googleapis.com/v3-statics-staging.mirrormedia.mg/files/json/header_posts.json'
    URL_STATIC_POST_EXTERNAL =
      'https://storage.googleapis.com/v3-statics-staging.mirrormedia.mg/files/json/post_external'
    URL_RESTFUL_SERVER = `${API_PROTOCOL}://${RESTFUL_API_HOST}:${API_PORT}`
    DONATION_PAGE_URL = 'https://mirrormedia.oen.tw/'
    GA_MEASUREMENT_ID = 'G-32D7P3MJ8B'
    GTM_ID = 'GTM-KVDZ27K'
    SEARCH_URL =
      'https://adam-mirror-media-search-staging-ufaummkd5q-de.a.run.app'
    URL_STATIC_POPULAR_NEWS = `https://editools-gcs-${ENV}.readr.tw/popular.json`
    break
  case 'dev':
    API_TIMEOUT = 5000
    API_HOST = 'mirror-cms-gql-dev-ufaummkd5q-de.a.run.app'
    RESTFUL_API_HOST = '104.199.190.189'
    API_PORT = '8080'
    URL_STATIC_PREMIUM_SECTIONS =
      'https://storage.googleapis.com/v3-statics-dev.mirrormedia.mg/files/json/header_member.json'
    URL_STATIC_NORMAL_SECTIONS =
      'https://storage.googleapis.com/v3-statics-dev.mirrormedia.mg/files/json/header_sections.json'
    URL_STATIC_TOPICS =
      'https://storage.googleapis.com/v3-statics-dev.mirrormedia.mg/files/json/header_topics.json'
    URL_STATIC_POST_FLASH_NEWS =
      'https://storage.googleapis.com/v3-statics-dev.mirrormedia.mg/files/json/header_posts.json'
    URL_STATIC_POST_EXTERNAL =
      'https://storage.googleapis.com/v3-statics-dev.mirrormedia.mg/files/json/post_external'
    URL_RESTFUL_SERVER = 'https://rest-dev.mirrormedia.mg'
    DONATION_PAGE_URL = 'https://mirrormedia.testing.oen.tw/'
    GA_MEASUREMENT_ID = 'G-36HYH6NF6P'
    GTM_ID = 'GTM-PBNLSMX'
    SEARCH_URL = 'https://adam-mirror-media-search-dev-ufaummkd5q-de.a.run.app'
    URL_STATIC_POPULAR_NEWS = `https://editools-gcs-${ENV}.readr.tw/popular.json`

    break
  default:
    API_TIMEOUT = 5000
    RESTFUL_API_HOST = 'localhost'
    API_PORT = '8080'
    API_HOST = 'mirror-cms-gql-dev-ufaummkd5q-de.a.run.app'
    URL_STATIC_PREMIUM_SECTIONS = `${API_PROTOCOL}://${RESTFUL_API_HOST}:${API_PORT}/json/header_member.json`
    URL_STATIC_NORMAL_SECTIONS = `${API_PROTOCOL}://${RESTFUL_API_HOST}:${API_PORT}/json/header_sections.json`
    URL_STATIC_TOPICS = `${API_PROTOCOL}://${RESTFUL_API_HOST}:${API_PORT}/json/header_topics.json`
    URL_STATIC_POST_FLASH_NEWS = `${API_PROTOCOL}://${RESTFUL_API_HOST}:${API_PORT}/json/header_posts.json`
    URL_STATIC_POST_EXTERNAL = `${API_PROTOCOL}://${RESTFUL_API_HOST}:${API_PORT}/json/post_external`
    URL_RESTFUL_SERVER = 'https://rest-dev.mirrormedia.mg'
    DONATION_PAGE_URL = 'https://mirrormedia.testing.oen.tw/'
    GA_MEASUREMENT_ID = 'G-36HYH6NF6P'
    GTM_ID = 'GTM-PBNLSMX'
    SEARCH_URL = 'https://adam-mirror-media-search-dev-ufaummkd5q-de.a.run.app'
    URL_STATIC_POPULAR_NEWS = `http://localhost:8080/json/popular.json`
}
export {
  ENV,
  GCP_PROJECT_ID,
  API_TIMEOUT,
  API_HOST,
  URL_STATIC_PREMIUM_SECTIONS,
  URL_STATIC_NORMAL_SECTIONS,
  URL_STATIC_TOPICS,
  URL_STATIC_POST_FLASH_NEWS,
  URL_STATIC_POST_EXTERNAL,
  URL_RESTFUL_SERVER,
  DONATION_PAGE_URL,
  GA_MEASUREMENT_ID,
  GTM_ID,
  SEARCH_URL,
  URL_STATIC_POPULAR_NEWS,
}
