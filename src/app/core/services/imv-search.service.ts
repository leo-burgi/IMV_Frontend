import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImvSearchService {
  private readonly searchTermSubject = new BehaviorSubject<string>('');
  readonly searchTerm$ = this.searchTermSubject.asObservable();

  setSearch(term: string): void {
    this.searchTermSubject.next((term || '').trim());
  }

  getSearch(): string {
    return this.searchTermSubject.getValue();
  }

  clearSearch(): void {
    this.searchTermSubject.next('');
  }
}
