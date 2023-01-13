import React, { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'

// force page index start from 1 to prevent counting miscalculation
const INITIAL_PAGE = 1

export default function InfiniteScrollList({
  initialList,
  renderPageSize,
  pageCount,
  fetchListInPage = () => {},
  propsIS,
  children,
}) {
  const [list, setList] = useState(initialList)
  const [renderCount, setRenderCount] = useState(renderPageSize)
  const [page, setPage] = useState(INITIAL_PAGE)
  const [isLoading, setIsLoading] = useState(false)

  const renderList = list.slice(0, renderCount)

  function handleLoadMore() {
    console.log('handleLoadMore', list.length, renderCount, page)
    if (isLoading) {
      return
    }

    if (list.length === renderCount && page === pageCount) {
      return
    }

    if (page !== pageCount && list.length - renderCount <= renderPageSize) {
      const newPage = page + 1
      setIsLoading(true)
      fetchListInPage(newPage).then((newList) => {
        if (newList && newList.length) {
          setPage(newPage)
          setList((oldList) => [...oldList, ...newList])
          setIsLoading(false)
        }
      })
    }
    setRenderCount((preVal) => (preVal += renderPageSize))
  }

  return (
    <InfiniteScroll
      {...propsIS}
      loadMore={handleLoadMore}
      hasMore={!(list.length === renderCount && page === pageCount)}
    >
      {children(renderList)}
    </InfiniteScroll>
  )
}
