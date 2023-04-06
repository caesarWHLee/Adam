import { gql } from '@apollo/client'
import { simpleTopic, topic } from '../fragments/topic'

const fetchTopics = gql`
  ${simpleTopic}
  query (
    $take: Int
    $skip: Int
    $orderBy: [TopicOrderByInput!]!
    $filter: TopicWhereInput!
  ) {
    topicsCount(where: $filter)
    topics(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {
      ...simpleTopic
    }
  }
`

const fetchTopic = gql`
  ${topic}
  query (
    $topicFilter: TopicWhereUniqueInput!
    $postsFilter: PostWhereInput!
    $postsOrderBy: [PostOrderByInput!]!
  ) {
    topic(where: $topicFilter) {
      ...topic
    }
  }
`

export { fetchTopics, fetchTopic }
