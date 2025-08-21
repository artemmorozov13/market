import { FC } from 'react'

import styles from './MenuCard.module.css'
import { MenuType } from '../..'
import { Link } from 'react-router'

interface MenuCardProps {
  menu: MenuType
}

export const MenuCard: FC<MenuCardProps> = (props) => {
  const { menu } = props

  return (
    <Link to={`/products?menuCategory=${menu.id}`} className={styles.root}>
      <span>{menu.title}</span>
    </Link>
  )
}
