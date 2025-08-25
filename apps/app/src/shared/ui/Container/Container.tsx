import { DetailedHTMLProps, FC, HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

import styles from './Container.module.css'

interface ContainerProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: ReactNode
}

export const Container: FC<ContainerProps> = (props) => {
  const { children, className, ...otherProps } = props

  return (
    <div className={clsx(styles.container, className)} {...otherProps}>
      {children}
    </div>
  )
}
