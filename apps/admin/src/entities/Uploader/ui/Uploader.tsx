import { ChangeEvent, FC, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadFile } from '../api/uploadFile';
import { Button, Typography, Box, CircularProgress, Chip, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import styles from './Uploader.module.scss';
import { UploaderReturnType } from '@core/types/uploader-type';

interface UploaderProps {
    value: string | null;
    onChange?: (file: UploaderReturnType) => void;
    allowedFileTypes?: string[];
    maxFileSizeMB?: number;
}

export const Uploader: FC<UploaderProps> = (props) => {
    const { 
        value, 
        onChange, 
        allowedFileTypes = ['image/*'], 
        maxFileSizeMB = 10 
    } = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<{
        name: string;
        size: number; 
        type: string;
        url: string;
        originalFile?: File;
    } | null>(null);

    console.log(value)

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
            maxSizeMB: maxFileSizeMB,
            maxWidthOrHeight: 2048,
            useWebWorker: true,
            fileType: file.type.match(/heic|heif/i) ? 'image/jpeg' : file.type,
            initialQuality: 0.8,
            preserveExif: true,
            onProgress: (progress: number) => {
                console.log(`Прогресс сжатия: ${progress}%`);
            }
        };

        try {
            const compressedFile = await imageCompression(file, options);
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

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) {
            return (
                <img
                    // @ts-ignore
                    src={fileInfo?.url || value} 
                    alt="Preview" 
                    className={styles.filePreview}
                />
            );
        }
        return <InsertDriveFileIcon className={styles.fileIcon} />;
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            // Проверка размера файла
            if (file.size > maxFileSizeMB * 1024 * 1024) {
                throw new Error(`Файл слишком большой. Максимальный размер: ${maxFileSizeMB}MB`);
            }

            // Проверка типа файла
            const isAllowed = allowedFileTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.replace('/*', '/'));
                }
                return file.type === type;
            });

            if (!isAllowed) {
                throw new Error(`Неподдерживаемый тип файла. Разрешены: ${allowedFileTypes.join(', ')}`);
            }

            let processedFile = file;
            
            // Сжимаем только изображения
            if (file.type.startsWith('image/')) {
                processedFile = await compressImage(file);
            }

            // Сохраняем информацию о файле
            const fileData = {
                name: processedFile.name,
                size: processedFile.size,
                type: processedFile.type,
                originalFile: file,
                url: URL.createObjectURL(processedFile) // временный URL для превью
            };

            setFileInfo(fileData);

            // Загрузка на сервер
            const uploadResponse = await uploadFile(processedFile);
            
            if (!uploadResponse.success) {
                throw new Error(uploadResponse.message || 'Ошибка при загрузке файла');
            }

            // Обновляем URL после загрузки на сервер
            setFileInfo(prev => prev ? { ...prev, url: uploadResponse.url } : null);
            onChange?.(uploadResponse);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке файла');
        } finally {
            setIsLoading(false);
            event.target.value = '';
        }
    };

    return (
        <Box className={styles.uploaderContainer}>
            <input
                accept={allowedFileTypes.join(',')}
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

            {(fileInfo || value) && (
                <Box className={styles.fileInfoContainer}>
                    <Box className={styles.filePreviewContainer}>
                        {getFileIcon(fileInfo?.type || 'image/*')}
                    </Box>
                    
                    <Box className={styles.fileDetails}>
                        <Typography variant="subtitle2" noWrap>
                            {fileInfo?.name || 'Загруженный файл'}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} mt={1}>
                            {fileInfo?.type && (
                                <Chip 
                                    label={fileInfo.type.split('/')[1].toUpperCase()} 
                                    size="small" 
                                />
                            )}
                            {fileInfo?.size && (
                                <Chip 
                                    label={formatFileSize(fileInfo.size)} 
                                    size="small" 
                                />
                            )}
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Загружено"
                                color="success"
                                size="small"
                            />
                        </Stack>
                    </Box>
                </Box>
            )}

            {isLoading && (
                <Box className={styles.progressContainer}>
                    <CircularProgress size={24} />
                    <Typography variant="caption" mt={1}>
                        {fileInfo?.type.startsWith('image/') 
                            ? 'Сжатие и загрузка изображения...' 
                            : 'Загрузка файла...'}
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography variant="body2" color="error" className={styles.errorText}>
                    {error}
                </Typography>
            )}

            <Typography variant="caption" display="block" mt={1} color="textSecondary">
                Максимальный размер: {maxFileSizeMB}MB. Разрешённые форматы: {allowedFileTypes.join(', ')}
            </Typography>
        </Box>
    );
};