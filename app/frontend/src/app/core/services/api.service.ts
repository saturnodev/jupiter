import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from '../utils/api-url';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = getApiUrl();

  constructor(private http: HttpClient) {}

  get url(): string {
    return this.baseUrl;
  }
}
