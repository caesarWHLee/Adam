import Header from './header'

/**
 *
 * @param {Object} props
 * @param {import('../type').Section[]} props.sectionsData
 * @param {import('../type').Topic[]} props.topicsData
 * @returns {React.ReactElement}
 */
export default function MemberLayout({
  sectionsData = [],
  topicsData = [],
  children,
}) {
  return (
    <>
      <Header sectionsData={sectionsData} topicsData={topicsData} />
      <main>{children}</main>
    </>
  )
}
