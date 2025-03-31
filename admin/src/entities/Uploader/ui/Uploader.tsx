import { ChangeEvent, FC, useState } from 'react';
import { uploadFile } from '../api/uploadFile';
import { UploaderReturnType } from '../types/uploaderTypes';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import styles from './Uploader.module.scss';

interface UploaderProps {
    value: string | null
    onChange?: (file: UploaderReturnType) => void;
}

export const Uploader: FC<UploaderProps> = (props) => {
    const { value, onChange } = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            setIsLoading(true);
            setError(null);

            try {
                const fileData = await uploadFile(file);
                onChange?.(fileData);
            } catch (err) {
                setError('Ошибка при загрузке файла. Попробуйте снова.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Box className={styles.uploaderContainer}>
            {!!value && (
                <img
                    src={value}
                    alt="uoliaded-image"
                    className={styles.uploadedImage}
                />
            )}
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="upload-file-input"
                type="file"
                onChange={handleFileChange}
                disabled={isLoading}
            />
            <label htmlFor="upload-file-input">
                <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={isLoading}
                    className={styles.button}
                    fullWidth
                >
                    {isLoading ? 'Загрузка...' : 'Загрузить файл'}
                </Button>
            </label>

            {isLoading && (
                <Box className={styles.progressContainer}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {error && (
                <Typography variant="body2" color="error" className={styles.errorText}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};
