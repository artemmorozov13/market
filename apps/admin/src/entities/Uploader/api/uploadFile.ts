import { UploaderReturnType } from '@core/types/uploader-type'
import { API } from '@shared/api/instance'

export const uploadFile = async (file: File): Promise<UploaderReturnType> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await API.post<UploaderReturnType>('/file-uploader/upload', formData)

    if (response.data && response.data.url && response.data.filename) {
      return response.data
    } else {
      throw new Error('Неверный формат ответа от сервера')
    }
  } catch (error) {
    throw new Error('Ошибка при загрузке файла')
  }
}
