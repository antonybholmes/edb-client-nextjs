import { type IModuleInfo } from "@interfaces/module-info"

import { ModuleInfoButton } from "@components/header/module-info-button"

import { BasicAlertDialog } from "@components/dialog/basic-alert-dialog"
import { useState } from "react"

import { formatString } from "@lib/text/format-string"
import { SignInLayout, type ISignInLayoutProps } from "./signin-layout"

export interface IModuleLayoutProps extends ISignInLayoutProps {
  info: IModuleInfo
}

export function ModuleLayout({
  info,
  className,
  children,
  ...props
}: IModuleLayoutProps) {
  //const path = usePathname()

  //const crumbs = createCrumbs(path)

  const [modalVisible, setModalVisible] = useState(false)

  return (
    <SignInLayout
      className={className}
      headerLeftChildren={
        // <BaseButton onClick={() => setModalVisible(true)}>
        //   <FontAwesomeIcon
        //     icon={faGear}
        //     className="text-white/50 trans-300 transition-color group-hover:text-white"
        //   />
        // </BaseButton>

        <ModuleInfoButton onClick={() => setModalVisible(true)}>
          {info.name}
        </ModuleInfoButton>
      }
      {...props}
    >
      <BasicAlertDialog
        open={modalVisible}
        title={info.name}
        onReponse={() => setModalVisible(false)}
        className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
      >
        <p>Version {info.version}</p>
        <p>{formatString(info.copyright)}</p>
      </BasicAlertDialog>

      {children}
    </SignInLayout>
  )
}
