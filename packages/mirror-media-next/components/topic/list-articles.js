import styled from 'styled-components'
import ListArticlesItem from './list-articles-item'

const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: 320px;
  justify-content: center;
  row-gap: 20px;
  margin-top: 40px;

  ${({ theme }) => theme.breakpoint.md} {
    grid-template-columns: repeat(3, 220px);
    gap: 32px 10px;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    grid-template-columns: repeat(4, 220px);
    gap: 48px;
  }
`

/**
 * @typedef {import('./list-articles-item').Article} Article
 */

/**
 * @param {Object} props
 * @param {Article[]} props.renderList
 * @returns {React.ReactElement}
 */
export default function ListArticles({ renderList }) {
  return (
    <ItemContainer>
      {renderList.map((item) => (
        <ListArticlesItem key={item.id} item={item} />
      ))}
    </ItemContainer>
  )
}
