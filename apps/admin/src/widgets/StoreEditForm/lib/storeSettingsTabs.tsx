import { EditStoreTab, EditStoreTabEnum } from '../types/editStoreTabsType'
import { DeliveryStoreForm } from '../ui/forms/DeliveryForm/DeliveryStoreForm'
import { GeneralForm } from '../ui/forms/GeneralForm/GeneralForm'
import { HelpForm } from '../ui/forms/HelpForm/HelpForm'
import { IntegrationsForm } from '../ui/forms/IntegrationsForm/IntegrationsForm'
import { LinksForm } from '../ui/forms/LinksForm/LinksForm'
import { PartnersForm } from '../ui/forms/PartnersForm/PartnersForm'

export const storeSettingTabs: Record<EditStoreTabEnum, EditStoreTab> = {
  General: {
    label: 'Основные',
    children: <GeneralForm />,
  },
  Delivery: {
    label: 'Доставка',
    children: <DeliveryStoreForm />,
  },
  Help: {
    label: 'Поддержка',
    children: <HelpForm />,
  },
  Integrations: {
    label: 'Интеграции',
    children: <IntegrationsForm />,
  },
  Links: {
    label: 'Ссылки',
    children: <LinksForm />,
  },
  Partners: {
    label: 'Партнеры',
    children: <PartnersForm />,
  },
}
