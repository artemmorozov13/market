import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Box, 
  Button, 
  Tab, 
  Tabs,
  Typography 
} from '@mui/material';
import { storeSchema } from '../../lib/editStoreSchema';
import { StoreEditFormType } from '../../types/storeEditTypes';
import { StoreBaseType } from '@core/types/store-type';
import { useUpdateStore } from '../../api/updateStore';
import { useTelegramAuthData, useTelegramIntegrate, useUser } from '@entities/User';
import { storeSettingTabs } from '../../lib/storeSettingsTabs';
import { GeneralForm } from '../forms/GeneralForm/GeneralForm';
import { DeliveryStoreForm } from '../forms/DeliveryForm/DeliveryStoreForm';
import { IntegrationsForm } from '../forms/IntegrationsForm/IntegrationsForm';
import { LinksForm } from '../forms/LinksForm/LinksForm';
import { HelpForm } from '../forms/HelpForm/HelpForm';
import { PartnersForm } from '../forms/PartnersForm/PartnersForm';
import { API } from '@shared/api/instance';
import { toast } from 'react-toastify';
import { routeConfig } from '@shared/lib/consts/routeConfig';
import { EditStoreTabEnum } from '../../types/editStoreTabsType';

import styles from './StoreEditForm.module.scss';

interface StoreEditFormProps {
  storeData: StoreBaseType;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: EditStoreTabEnum;
  value: EditStoreTabEnum;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`store-settings-tabpanel-${index}`}
      aria-labelledby={`store-settings-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const StoreEditForm: FC<StoreEditFormProps> = ({ storeData }) => {
  const [activeTab, setActiveTab] = useState<EditStoreTabEnum>(EditStoreTabEnum.General);
  
  const { initData } = useTelegramAuthData();
  const { connectTelegram } = useTelegramIntegrate();
  const { mutate: updateStore } = useUpdateStore();
  const { refetch } = useUser();

  const methods = useForm<StoreEditFormType>({
    resolver: yupResolver(storeSchema) as any,
    defaultValues: storeData
  });

  const onSubmit = async (data: StoreEditFormType) => {
    await updateStore(data);
    refetch();
  };

  useEffect(() => {
    if (initData) {
      connectTelegram(initData)
        .then(() => window.location.replace(routeConfig['shop/settings']))
        .catch(console.error);
    }
  }, [initData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: EditStoreTabEnum) => {
    setActiveTab(newValue);
  };

  return (
    <FormProvider {...methods}>
      <Box className={styles.formContainer}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {Object.entries(storeSettingTabs).map(([key, tab]) => (
                <Tab 
                  key={key}
                  label={tab.label}
                  value={key as EditStoreTabEnum}
                />
              ))}
            </Tabs>
          </Box>

          {Object.entries(storeSettingTabs).map(([key, tab]) => (
            <TabPanel 
              key={key}
              value={activeTab}
              index={key as EditStoreTabEnum}
            >
              {tab.children}
            </TabPanel>
          ))}

          <Box className={styles.actions}>
            <Button
              className={styles.saveButton}
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Сохранить изменения
            </Button>
          </Box>
        </form>
      </Box>
    </FormProvider>
  );
};