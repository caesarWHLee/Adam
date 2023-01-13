import styled from 'styled-components'
import LatestNewsItem from './new-latest-news-item'

const ItemContainer = styled.div`
  ${({ theme }) => theme.breakpoint.md} {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, 244px);
    justify-content: center;
  }
`

export default function NewLatestNewsItems({ renderList }) {
  return (
    <ItemContainer>
      {renderList.map((item) => (
        <LatestNewsItem key={item.slug} item={item} />
      ))}
    </ItemContainer>
  )
}
