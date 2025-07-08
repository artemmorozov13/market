import { ChangeEvent, FC, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadFile } from '../api/uploadFile';
import { Button, Typography, Box, CircularProgress, Chip, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './Uploader.module.scss';
import { UploaderReturnType } from '@core/types/uploader-type';

interface UploaderProps {
    value: string | null;
    onChange?: (file: UploaderReturnType) => void;
}

export const Uploader: FC<UploaderProps> = (props) => {
    const { value, onChange } = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<{size: number; type: string} | null>(null);

    const compressImage = async (file: File): Promise<File> => {
        // Поддерживаемые форматы
        const supportedFormats = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            'image/gif',
            'image/bmp',
            'image/tiff'
        ];

        // Проверка формата
        if (!supportedFormats.includes(file.type.toLowerCase())) {
            throw new Error(`Неподдерживаемый формат изображения: ${file.type}`);
        }

        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 2048,
            useWebWorker: true,
            // Сохраняем исходный тип файла, кроме HEIC/HEIF - конвертируем в JPEG
            fileType: file.type.match(/heic|heif/i) ? 'image/jpeg' : file.type,
            initialQuality: 0.8,
            preserveExif: true, // Сохраняем метаданные
            onProgress: (progress: number) => {
                console.log(`Прогресс сжатия: ${progress}%`);
            }
        };

        try {
            // Для HEIC/HEIF может потребоваться дополнительная обработка
            if (file.type.match(/heic|heif/i)) {
                console.log('Конвертация HEIC/HEIF в JPEG...');
            }
            
            const compressedFile = await imageCompression(file, options);
            
            // Переименовываем файл, если изменился его тип
            const newFileName = file.type.match(/heic|heif/i) 
                ? file.name.replace(/\.[^/.]+$/, '.jpg')
                : file.name;
                
            return new File([compressedFile], newFileName, {
                type: options.fileType,
                lastModified: Date.now()
            });
        } catch (error) {
            console.error('Ошибка сжатия изображения:', error);
            throw new Error('Не удалось сжать изображение');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            setIsLoading(true);
            setError(null);
            setFileInfo(null);

            try {
                // Валидация типа файла
                if (!file.type.startsWith('image/')) {
                    throw new Error('Пожалуйста, загрузите файл изображения');
                }

                // Сжатие изображения
                const compressedFile = await compressImage(file);
                setFileInfo({
                    size: compressedFile.size,
                    type: compressedFile.type
                });

                // Загрузка на сервер
                const fileData = await uploadFile(compressedFile);
                
                if (!fileData.success) {
                    throw new Error(fileData.message || 'Ошибка при загрузке файла');
                }

                onChange?.(fileData);
            } catch (err) {
                console.error('Upload error:', err);
                setError(err instanceof Error ? err.message : 'Ошибка при загрузке файла');
            } finally {
                setIsLoading(false);
                event.target.value = ''; // Сброс input для возможности повторной загрузки того же файла
            }
        }
    };

    return (
        <Box className={styles.uploaderContainer}>
            {!!value && (
                <Box className={styles.imagePreview}>
                    <img
                        src={value}
                        alt="uploaded"
                        className={styles.uploadedImage}
                    />
                    <Chip
                        icon={<CheckCircleIcon />}
                        label="Изображение загружено"
                        color="success"
                        size="small"
                        className={styles.uploadedBadge}
                    />
                </Box>
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
                    {isLoading ? 'Загрузка...' : 'Загрузить изображение'}
                </Button>
            </label>

            {fileInfo && (
                <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={fileInfo.type.split('/')[1].toUpperCase()} size="small" />
                    <Chip label={formatFileSize(fileInfo.size)} size="small" />
                </Stack>
            )}

            {isLoading && (
                <Box className={styles.progressContainer}>
                    <CircularProgress size={24} />
                    <Typography variant="caption" mt={1}>
                        Сжатие и загрузка изображения...
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography variant="body2" color="error" className={styles.errorText}>
                    {error}
                </Typography>
            )}

            <Typography variant="caption" display="block" mt={1} color="textSecondary">
                Максимальный размер: 1MB. Рекомендуемый формат: JPEG
            </Typography>
        </Box>
    );
};