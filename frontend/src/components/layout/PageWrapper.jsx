/**
 * PageWrapper — consistent max-width, horizontal padding, and vertical spacing
 * applied to every page's content area.
 */
export default function PageWrapper({ children }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 w-full">
      {children}
    </div>
  )
}
