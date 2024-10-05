import { ContentDiv } from "@components/content-div"
import { HeaderLayout, type IHeaderLayoutProps } from "./header-layout"

export function ContentLayout({ children, ...props }: IHeaderLayoutProps) {
  return (
    <HeaderLayout {...props}>
      <ContentDiv>
        <> {children}</>
      </ContentDiv>
    </HeaderLayout>
  )
}
