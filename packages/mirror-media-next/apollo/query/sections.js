import { gql } from '@apollo/client'
import { section, sectionWithCategory } from '../fragments/section'

const fetchSection = gql`
  ${section}
  query ($where: SectionWhereUniqueInput!) {
    section(where: $where) {
      ...section
    }
  }
`

const fetchSectionWithCategory = gql`
  ${sectionWithCategory}
  query ($where: SectionWhereUniqueInput!) {
    section(where: $where) {
      ...section
    }
  }
`

export { fetchSection, fetchSectionWithCategory }
