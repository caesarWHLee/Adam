//TODO: adjust margin and padding of all margin and padding after implement advertisement.
//TODO: add component to add html head dynamically, not jus write head in every pag

import { useCallback } from 'react'
import client from '../../apollo/apollo-client'
import errors from '@twreporter/errors'
import styled, { css } from 'styled-components'
import Link from 'next/link'
import Head from 'next/head'

import MockAdvertisement from '../../components/mock-advertisement'
import Image from 'next/image'
import ArticleInfo from '../../components/story/normal/article-info'
import ArticleBrief from '../../components/story/normal/brief'
import AsideArticleList from '../../components/story/normal/aside-article-list'
import FbPagePlugin from '../../components/story/normal/fb-page-plugin'
import SocialNetworkService from '../../components/story/normal/social-network-service'
import SubscribeInviteBanner from '../../components/story/normal/subscribe-invite-banner'
import DonateBanner from '../../components/story/shared/donate-banner'
import MagazineInviteBanner from '../../components/story/shared/magazine-invite-banner'
import RelatedArticleList from '../../components/story/normal/related-article-list'
import {
  transformTimeDataIntoTaipeiTime,
  sortArrayWithOtherArrayId,
} from '../../utils'
import { fetchListingPosts } from '../../apollo/query/posts'
import { fetchPostBySlug } from '../../apollo/query/post'
import { MirrorMedia } from '@mirrormedia/lilith-draft-renderer'
const { DraftRenderer } = MirrorMedia
/**
 * @typedef {import('../../type/theme').Theme} Theme
 */

/**
 * @typedef {import('../../components/story/normal/aside-article-list').ArticleData} AsideArticleData
 */

/**
 * @typedef {import('../../components/story/normal/article-info').Contacts} Contacts
 */

/**
 * @typedef {(import('../../apollo/query/post').Section &
 * { id: string, slug: string, name: string })[]} Sections
 */

/**
 * @typedef {import('../../apollo/query/post').HeroImage &
 * {
 *  id: string,
 *  resized: {
 *    original: string,
 *    w480: string,
 *    w800: string,
 *    w1200: string,
 *    w1600: string,
 *    w2400: string
 *  }
 * } } HeroImage
 */

/**
 * @typedef {import('../../apollo/query/post').HeroVideo & {
 * id: string, name:string, urlOriginal: string}} HeroVideo
 */

/**
 * @typedef {import('../../apollo/query/post').Draft} Draft
 */

/**
 * @typedef {import('../../components/story/normal/related-article-list').Relateds} Relateds
 */

/**
 * @typedef {Pick<import('../../apollo/query/post').Post, 'id' | 'slug' | 'title' | 'titleColor' |
 *  'subtitle' | 'publishedDate' | 'updatedAt' | 'state' | 'sections' | 'manualOrderOfSections'| 'writers' | 'manualOrderOfWriters' | 'photographers' | 'camera_man'
 * | 'designers' | 'engineers' | 'vocals' | 'extend_byline' | 'tags' | 'heroVideo' | 'heroImage' | 'heroCaption' | 'brief' | 'content' | 'relateds'> } PostData
 */

const sectionColor = css`
  ${
    /**
     * @param {Object} props
     * @param {String} [props.sectionSlug]
     * @param {Theme} [props.theme]
     */
    ({ sectionSlug, theme }) =>
      sectionSlug && theme.color.sectionsColor[sectionSlug]
        ? theme.color.sectionsColor[sectionSlug]
        : 'black'
  };
`

const StoryContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  height: auto;
  max-width: 1200px;
`

const PC_HD_Advertisement = styled(MockAdvertisement)`
  display: none;
  margin: 24px auto;
  text-align: center;
`
const PC_R1_Advertisement = styled(MockAdvertisement)`
  display: none;
  margin: 0 auto;
  text-align: center;
  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
  }
`
const PC_R2_Advertisement = styled(MockAdvertisement)`
  display: none;
  margin: 20px auto;
  text-align: center;
  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
  }
`
const M_AT3_Advertisement = styled(MockAdvertisement)`
  margin: 0 -20px;
  width: 100vw;
  max-width: 336px;
  @media (min-width: 336px) {
    margin: 0 auto;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`

const Title = styled.h1`
  margin: 0 auto;
  width: 100%;
  text-align: center;
  font-weight: 400;
  font-size: 24px;
  line-height: 34px;
  ${({ theme }) => theme.breakpoint.md} {
    font-weight: 500;
    font-size: 32px;
    line-height: 1.25;
    text-align: left;
  }
`
const Main = styled.main`
  padding: 0 20px;
  ${({ theme }) => theme.breakpoint.md} {
    padding: 0 64px;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    display: flex;
    justify-content: center;
    padding: 0 40px 0 77px;
    justify-content: space-between;
  }
`
const Article = styled.article`
  max-width: 640px;
  margin: 0 auto;
  ${({ theme }) => theme.breakpoint.xl} {
    max-width: 640px;
  }
`

const Section = styled.div`
  color: ${
    /**
     * @param {{ sectionSlug: String}} props
     */
    ({ sectionSlug }) => sectionSlug && sectionColor
  };
  margin-left: 4px;
  padding-left: 8px;
  position: relative;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  ${({ theme }) => theme.breakpoint.md} {
    font-size: 18px;
    line-height: 25px;
    text-align: left;
  }
  &::before {
    display: none;

    ${({ theme }) => theme.breakpoint.md} {
      display: block;
      position: absolute;
      content: '';
      background-color: ${({ sectionSlug }) => sectionSlug && sectionColor};
      left: -4px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
    }
  }
`

const Date = styled.div`
  width: fit-content;
  height: auto;
  font-size: 14px;
  line-height: 1.5;
  color: #a1a1a1;
  display: none;
  ${({ theme }) => theme.breakpoint.md} {
    display: block;
  }
`

const SectionAndDate = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  ${({ theme }) => theme.breakpoint.md} {
    justify-content: space-between;
    margin-bottom: 10px;
  }
`

const HeroImage = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  margin: 20px 0 0;

  .caption {
    width: 100%;
    height: auto;
    margin-top: 9px;
    font-size: 18px;
    line-height: 25px;
    font-weight: 600;
    color: #9d9d9d;
  }
  ${({ theme }) => theme.breakpoint.md} {
    margin: 0;
  }
`
const InfoAndHero = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoint.md} {
    ${HeroImage} {
      order: 10;
    }
  }
`
const SocialNetworkServiceSmall = styled(SocialNetworkService)`
  display: none;
  ${({ theme }) => theme.breakpoint.md} {
    display: flex;
    margin-top: 20px;
  }
`
const SocialNetworkServiceLarge = styled(SocialNetworkService)`
  display: flex;
  margin-top: 20px;
  margin-bottom: 24px;
  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`
const StoryMoreInfo = styled.p`
  font-size: 18px;
  line-height: 1.5;
  color: black;
  margin: 0 auto;
  text-align: center;
  a {
    color: ${({ theme }) => theme.color.brandColor.lightBlue};
    border-bottom: 1px solid ${({ theme }) => theme.color.brandColor.lightBlue};
  }
`

const StoryEnd = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 60px auto 0;
  padding: 0 23.5px;
  ${({ theme }) => theme.breakpoint.md} {
    width: 640px;

    margin-top: 24px auto 0;
    gap: 16px;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    gap: 36px;
    padding: 0;
  }
`
const StoryEndMobileTablet = styled(StoryEnd)`
  display: flex;
  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`
const StoryEndDesktop = styled(StoryEnd)`
  display: none;
  ${({ theme }) => theme.breakpoint.xl} {
    display: flex;
  }
`
const Aside = styled.aside`
  max-width: 640px;
  margin: 0 auto;
  ${({ theme }) => theme.breakpoint.xl} {
    max-width: 365px;
  }
`
const AsideFbPagePlugin = styled(FbPagePlugin)`
  display: none;
  text-align: center;
  height: 500px;
  margin: 20px 0;
  ${
    /**
     * @param {Object} param
     * @param {Theme} param.theme
     */
    ({ theme }) => theme.breakpoint.md
  } {
    display: block;
  }
`
const AdvertisementDable = styled.div`
  text-align: center;
  background-color: #eeeeee;
`
const AdvertisementDableDesktop = styled(AdvertisementDable)`
  display: none;
  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
    width: 640px;
    margin: 0 auto;
  }
`
const AdvertisementDableMobile = styled(AdvertisementDable)`
  display: block;
  margin: 0 auto;
  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
    width: 640px;
  }
`
const DivideLine = styled.div`
  background-color: #000000;
  width: 208px;
  height: 2px;
  margin: 32px auto 36px;
  ${({ theme }) => theme.breakpoint.md} {
    width: 100%;
    margin: 36px auto;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`

/**
 *
 * @param {Object} props
 * @param {PostData} props.postData
 * @returns {JSX.Element}
 */
export default function Story({ postData }) {
  const {
    title = '',
    slug = '',
    sections = [],
    manualOrderOfSections = [],
    publishedDate = '',
    updatedAt = '',
    writers = [],
    manualOrderOfWriters = [],
    photographers = [],
    camera_man = [],
    designers = [],
    engineers = [],
    vocals = [],
    extend_byline = '',
    tags = [],
    brief = [],
    relateds = [],
    manualOrderOfRelateds = [],
    content = {},
  } = postData

  const sectionsWithOrdered =
    manualOrderOfSections && manualOrderOfSections.length
      ? sortArrayWithOtherArrayId(sections, manualOrderOfSections)
      : sections
  const relatedsWithOrdered =
    manualOrderOfRelateds && manualOrderOfRelateds.length
      ? sortArrayWithOtherArrayId(relateds, manualOrderOfRelateds)
      : relateds

  const writersWithOrdered =
    manualOrderOfWriters && manualOrderOfWriters.length
      ? sortArrayWithOtherArrayId(writers, manualOrderOfWriters)
      : writers

  const [section] = sectionsWithOrdered

  /**
   * @returns {Promise<AsideArticleData[] | []>}
   */
  const handleFetchLatestNews = useCallback(async () => {
    try {
      /**
       * @type {import('@apollo/client').ApolloQueryResult<{posts: AsideArticleData[]}>}
       */
      const res = await client.query({
        query: fetchListingPosts,
        variables: {
          take: 6,
          sectionSlug: section.slug,
          storySlug: slug,
        },
      })
      return res.data?.posts
    } catch (err) {
      return []
    }
  }, [section, slug])

  const credits = [
    { writers: writersWithOrdered },
    { photographers: photographers },
    { camera_man: camera_man },
    { designers: designers },
    { engineers: engineers },
    { vocals: vocals },
    { extend_byline: extend_byline },
  ]
  const headJsx = (
    <Head>
      <title>{title}</title>
    </Head>
  )
  const publishedTaipeiTime = transformTimeDataIntoTaipeiTime(publishedDate)
  const updatedTaipeiTime = transformTimeDataIntoTaipeiTime(updatedAt)

  return (
    <>
      {headJsx}
      <StoryContainer>
        <PC_HD_Advertisement
          width="970px"
          height="250px"
          text="PC_HD 970*250"
        ></PC_HD_Advertisement>
        <Main>
          <Article>
            <SectionAndDate>
              <Section sectionSlug={section?.slug}>
                {section?.name || ''}
              </Section>
              <Date>{publishedTaipeiTime}</Date>
            </SectionAndDate>
            <Title>{title}</Title>
            <InfoAndHero>
              <HeroImage>
                <Image
                  src={
                    'https://storage.googleapis.com/static-mirrormedia-dev/images/20160929123258-7818228bd4c9933a170433e57a90616c-tablet.png'
                  }
                  width={640}
                  height={427}
                  alt="首圖"
                ></Image>
                <p className="caption">這是首圖圖說</p>
              </HeroImage>

              <ArticleInfo
                updatedDate={updatedTaipeiTime}
                publishedDate={publishedTaipeiTime}
                credits={credits}
                tags={tags}
              ></ArticleInfo>
            </InfoAndHero>
            <ArticleBrief
              sectionSlug={section?.slug}
              brief={brief}
            ></ArticleBrief>
            <div>
              <DraftRenderer
                rawContentBlock={content}
                image="/images/default-og-img.png"
              ></DraftRenderer>
            </div>
            <DonateBanner />
            <SocialNetworkServiceSmall />
            <SubscribeInviteBanner />
            <RelatedArticleList relateds={relatedsWithOrdered} />
            <M_AT3_Advertisement
              text="M_AT3 336*280"
              width="336px"
              height="280px"
              className="ad"
            />
            <SocialNetworkServiceLarge
              shouldShowLargePagePlugin={true}
              flexDirection="column"
            />
            <M_AT3_Advertisement
              text="M_E1 336*280"
              width="336px"
              height="280px"
              className="ad"
            />
            <AdvertisementDableMobile>
              dable廣告(手機版)施工中......
            </AdvertisementDableMobile>
            <StoryEndDesktop>
              <StoryMoreInfo>
                更多內容，歡迎&nbsp;
                <Link href="/papermag" target="_blank">
                  鏡週刊紙本雜誌
                </Link>
                、
                <Link href="/subscribe" target="_blank">
                  鏡週刊數位訂閱
                </Link>
                、
                <Link href="/story/webauthorize/" target="_blank">
                  了解內容授權資訊
                </Link>
                。
              </StoryMoreInfo>
              <MagazineInviteBanner />
              <AdvertisementDableDesktop>
                dable廣告 (桌機版) 施工中......
              </AdvertisementDableDesktop>
            </StoryEndDesktop>
          </Article>
          <Aside>
            <PC_R1_Advertisement
              text="PC_R1 300*600"
              width="300px"
              height="600px"
              className="ad"
            ></PC_R1_Advertisement>
            <AsideArticleList
              heading="最新文章"
              fetchArticle={handleFetchLatestNews}
              shouldReverseOrder={false}
              renderAmount={6}
            ></AsideArticleList>

            <PC_R2_Advertisement
              text="PC_R2 300*600"
              width="300px"
              height="600px"
              className="ad"
            ></PC_R2_Advertisement>
            <DivideLine />
            <AsideArticleList
              heading="熱門文章"
              fetchArticle={handleFetchLatestNews}
              shouldReverseOrder={false}
              renderAmount={6}
            ></AsideArticleList>
            <AsideFbPagePlugin></AsideFbPagePlugin>
          </Aside>
        </Main>
        <StoryEndMobileTablet>
          <StoryMoreInfo>
            更多內容，歡迎&nbsp;
            <Link href="/papermag" target="_blank">
              鏡週刊紙本雜誌
            </Link>
            、
            <Link href="/subscribe" target="_blank">
              鏡週刊數位訂閱
            </Link>
            、
            <Link href="/story/webauthorize/" target="_blank">
              了解內容授權資訊
            </Link>
            。
          </StoryMoreInfo>
          <MagazineInviteBanner />
          <AdvertisementDableDesktop>
            dable廣告 (桌機版) 施工中......
          </AdvertisementDableDesktop>
        </StoryEndMobileTablet>
      </StoryContainer>
    </>
  )
}

/**
 * @type {import('next').GetServerSideProps}
 */
export async function getServerSideProps({ params }) {
  const { slug } = params
  try {
    const result = await client.query({
      query: fetchPostBySlug,
      variables: { slug },
    })
    /**
     * @type {PostData}
     */
    const postData = result?.data?.post
    if (!postData) {
      return { notFound: true }
    }

    return {
      props: {
        postData,
      },
    }
  } catch (err) {
    const { graphQLErrors, clientErrors, networkError } = err
    const annotatingError = errors.helpers.wrap(
      err,
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
      })
    )
    return { notFound: true }
  }
}
