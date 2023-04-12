import styled from 'styled-components'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper'
import TopicListArticles from '../topic-list-articles'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import css from 'styled-jsx/css'

const Container = styled.main`
  margin: 0 auto;
  background: #eee;

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 0;
  }

  // custom css from cms, mainly used class name .topic, .topic-title, .leading
  ${({ customCss }) =>
    customCss &&
    css`
      ${customCss}
    `}
`

const Topic = styled.div`
  background-repeat: no-repeat;
  height: auto;
  padding-top: 66.66%;
  background-position: 50%;
  background-size: cover;

  ${({ theme }) => theme.breakpoint.md} {
  }
  ${({ theme }) => theme.breakpoint.xl} {
    height: 600px;
    background-size: contain;
  }
`
const TopicTitle = styled.div`
  background-repeat: no-repeat;
`
const TopicLeading = styled.div`
  width: 50%;
  margin: 0 auto;
`

/**
 * @typedef
 * @typedef {import('../../../apollo/fragments/topic').Topic}
 */

/**
 *
 * @param {Object} props
 * @param {Article[]} props.posts
 * @param {number} props.renderPageSize
 * @returns {React.ReactElement}
 */
export default function TopicList({ topic, renderPageSize, slideshowData }) {
  const { postsCount, posts, id, style } = topic

  return (
    <>
      <Container customCss={style}>
        <Topic className="topic">
          <TopicTitle className="topic-title" />
          <TopicLeading className="leading">
            {!!slideshowData.length && (
              <Swiper
                spaceBetween={100}
                centeredSlides={true}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                }}
                loop={true}
                speed={750}
                navigation={true}
                modules={[Autoplay, Navigation]}
              >
                {slideshowData.map((item) => (
                  <SwiperSlide key={item._id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image?.resizedTargets?.tablet?.url}
                      alt={item.description}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </TopicLeading>
        </Topic>
        <TopicListArticles
          topicId={id}
          posts={posts}
          postsCount={postsCount}
          renderPageSize={renderPageSize}
        />
      </Container>
    </>
  )
}
