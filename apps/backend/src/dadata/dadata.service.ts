import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DadataService {
  constructor(
    private readonly httpService: HttpService
  ) {}

  private readonly API_URL = process.env.DADATA_API_URL;
  private readonly API_KEY = process.env.DADATA_API_KEY;

  async suggestAddress(query: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.API_URL,
          {
            query,
            count: 15,
            locations: [
              { region: 'Санкт-Петербург' },
              { region: 'Ленинградская' }
            ],
            restrict_value: true
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Token ${this.API_KEY}`
            }
          }
        )
      );
      return response.data.suggestions;
    } catch (error) {
      console.error('Dadata error:', error);
      return [];
    }
  }
}