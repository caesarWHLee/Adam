/**
 * @typedef {import('../type/raw-data.typedef').RawData} RawData
 */

/**
 * Get path of article base on different article style, and whether is external article.
 * @param {String} slug
 * @param {import('../type/raw-data.typedef').ArticleStyle} style
 * @param {Object |''} partner
 * @returns {String}
 */
const getArticleHref = (slug, style, partner) => {
  if (partner) {
    return `/external/${slug}/`
  }
  if (style === 'campaign') {
    return `/campaigns/${slug}`
  } else if (style === 'projects') {
    return `/projects/${slug}/`
  }
  /**
   * TODO: condition `isPremiumMember` is whether user is log in and is premium member,
   * We haven't migrate membership system yet, so remove this condition temporally.
   */
  // else if (isPremiumMember) {
  //   return `pre/story/${slug}/`
  // }

  return `/story/${slug}/`
}

/**
 * Get section name based on different condition
 * @param {import('../type/raw-data.typedef').Section[]} sections
 * @param {Object | ''} partner
 * @returns {String | undefined}
 */
function getSectionName(sections = [], partner = '') {
  if (partner) {
    return 'external'
  } else if (sections?.some((section) => section.name === 'member')) {
    return 'member'
  }
  return sections[0]?.name
}

/**
 * Get section title based on different condition
 * @param {import('../type/raw-data.typedef').Section[]} sections
 * @param {Object | ''} partner
 * @returns {String | undefined}
 */
function getSectionTitle(sections = [], partner) {
  if (partner) {
    if (partner.name === 'healthnews') {
      return '生活'
    } else if (partner.name === 'ebc') {
      return '時事'
    } else {
      return '時事'
    }
  }

  if (sections.length > 0) {
    if (sections.some((section) => section.name === 'member')) {
      return '會員專區'
    } else {
      return sections[0]?.title
    }
  }
  return undefined
}

//TODO:
// - remove function for handling data from k3 server
// - adjust typedef of Section
/**
 * Get section name based on different condition
 * Because data structure of keystone 6 response is different from keystone 3, we create this function to handle data from keystone 6 server.
 * @param {import('../type/raw-data.typedef').Section[]} sections
 * @param {Object | ''} partner
 * @returns {String | undefined}
 */
function getSectionNameGql(sections = [], partner = '') {
  if (partner) {
    return 'external'
  } else if (sections?.some((section) => section.name === 'member')) {
    return 'member'
  }
  return sections[0]?.name
}

/**
 * Get section title based on different condition
 * Because data structure of keystone 6 response is different from keystone 3, we create this function to handle data from keystone 6 server.
 * @param {import('../type/raw-data.typedef').Section[]} sections
 * @param {Object | ''} partner
 * @returns {String | undefined}
 */
function getSectionTitleGql(sections = [], partner) {
  if (partner) {
    if (partner.name === 'healthnews') {
      return '生活'
    } else if (partner.name === 'ebc') {
      return '時事'
    } else {
      return '時事'
    }
  }

  if (sections.length > 0) {
    if (sections.some((section) => section.name === 'member')) {
      return '會員專區'
    } else {
      return sections[0]?.slug
    }
  }
  return undefined
}
/**
 * Transform the item in the array into a specific data structure, which will be applied to a specific list page
 * @param {RawData[]} rawData
 * @returns {import('../type/index').ArticleInfoCard[]}
 */
const transformRawDataToArticleInfo = (rawData) => {
  return rawData?.map((article) => {
    const {
      slug = '',
      title = '',
      heroImage = {
        image: { resizedTargets: { mobile: { url: '' }, tablet: { url: '' } } },
      },
      sections = [],
      partner = {},
      style,
    } = article || {}

    const { mobile = {}, tablet = {} } = heroImage?.image
      ? heroImage?.image?.resizedTargets
      : {}
    return {
      title,
      slug,
      href: getArticleHref(slug, style, partner),
      imgSrcMobile: mobile?.url || '/images/default-og-img.png',
      imgSrcTablet: tablet?.url || '/images/default-og-img.png',
      sectionTitle: getSectionTitle(sections, partner),
      sectionName: getSectionName(sections, partner),
    }
  })
}

/**
 * Transform params `time` into `YYYY.MM.DD HH:MM 臺北時間` || `YYYY/MM/DD HH:MM` pattern
 * depend on the type 'dot' or 'slash'
 * If `time` is not a valid date, this function will return undefined
 * @param {string} time
 * @param {'dot' | 'slash'} format
 * @returns {string | undefined}
 */
const transformTimeData = (time, format) => {
  const timeData = new Date(time)
  const timestamp = timeData.getTime()
  if (isNaN(timestamp)) {
    return undefined
  } else {
    const year = timeData.getFullYear()
    const month = timeData.getMonth() + 1
    const date = timeData.getDate()
    const hour = timeData.getHours()
    const minute = timeData.getMinutes()
    const formattedUnit = (unit) => {
      if (unit < 10) {
        return `0${unit}`
      } else {
        return unit
      }
    }

    switch (format) {
      case 'dot':
        return `${year}.${formattedUnit(month)}.${formattedUnit(
          date
        )} ${formattedUnit(hour)}:${formattedUnit(minute)} 臺北時間`
      case 'slash':
        return `${year}/${formattedUnit(month)}/${formattedUnit(
          date
        )} ${formattedUnit(hour)}:${formattedUnit(minute)}`
      default:
        return undefined
    }
  }
}

/**
 * Transform params `time` into `YYYY.MM.DD HH:MM 臺北時間` pattern
 * Transform params `time` into certain type
 * If `time` is not a valid date, this function will return undefined
 * @param {String} time
 * @returns {string | undefined}
 */
const transformTimeDataIntoTaipeiTime = (time) => {
  return transformTimeData(time, 'dot')
}

/**
 * Transform params `time` into `YYYY/MM/DD HH:MM` pattern
 * If `time` is not a valid date, this function will return undefined
 * @param {String} time
 * @returns {string | undefined}
 */
const transformTimeDataIntoSlashFormat = (time) => {
  return transformTimeData(time, 'slash')
}

//TODO: add more specific type in param `arrayNeedToSort` and `arraySortReference`
/**
 * Sorts an array of objects based on the order of ids in another array of objects.
 * @template T
 * @param {Array<{id: string, [key:string]: any} & T>} arrayNeedToSort
 * @param {{id: string, [key:string]: any}[]} arraySortReference
 * @returns {Array<T>}
 */
const sortArrayWithOtherArrayId = (arrayNeedToSort, arraySortReference) => {
  const sortedArray = arrayNeedToSort.slice().sort((a, b) => {
    const aIndex = arraySortReference.findIndex((x) => x.id === a.id)
    console.log(aIndex)
    const bIndex = arraySortReference.findIndex((x) => x.id === b.id)
    console.log(bIndex)
    return aIndex - bIndex
  })
  return sortedArray
}

export {
  transformRawDataToArticleInfo,
  transformTimeDataIntoTaipeiTime,
  transformTimeDataIntoSlashFormat,
  getSectionNameGql,
  getSectionTitleGql,
  getArticleHref,
  sortArrayWithOtherArrayId,
}
