import { FC, useEffect } from 'react';

import styles from './MenuList.module.css';
import { MenuCard } from '../MenuCard/MenuCard';
import { menuStore } from '../../store/menuStore';
import { observer } from 'mobx-react-lite';

export const MenuList: FC = observer(() => {
    const { menuList, fetchMenuList } = menuStore

    useEffect(() => {
        fetchMenuList()
    }, [])

    return (
        <div className={styles.parentContainer}>
            <div className={styles.root}>
                <h3 className={styles.title}>Категории</h3>
                <div className={styles.rootList}>
                {menuList.map(menuItem => (
                    <MenuCard key={menuItem.id} menu={menuItem} />
                ))}
                </div>
            </div>
        </div>

    );
});