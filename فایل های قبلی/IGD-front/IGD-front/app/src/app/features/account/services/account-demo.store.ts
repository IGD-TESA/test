import { Injectable, signal } from '@angular/core';

import {
  AccountProfile,
  AccountLegalEntity,
  AccountContact,
  AccountDevice,
  AccountSession,
  AccountPermission,
  LocalVerificationDocument,
} from '../models/account.models';

/**
 * Temporary frontend-only state.
 *
 * This store is intentionally in-memory.
 * It does not authenticate users, persist credentials,
 * or claim that remote operations have succeeded.
 *
 * Replace this implementation with the verified Account API
 * adapter when backend contracts are ready.
 */
@Injectable({
  providedIn: 'root',
})
export class AccountDemoStore {
  readonly profile = signal<AccountProfile>({
    firstName: '',
    lastName: '',
    nationalId: '',
    birthDate: '',
    fatherName: '',
    address: '',
    postalCode: '',
  });

  readonly legalEntity = signal<AccountLegalEntity>({
    legalName: '',
    nationalId: '',
    registrationNumber: '',
    economicCode: '',
    legalType: '',
    registrationDate: '',
  });

  readonly phones = signal<AccountContact[]>([]);
  readonly emails = signal<AccountContact[]>([]);

  readonly documents = signal<LocalVerificationDocument[]>([]);

  readonly devices = signal<AccountDevice[]>([
    {
      id: 'device-demo-1',
      name: 'دستگاه فعلی',
      browser: 'مرورگر فعلی',
      lastSeen: 'این نشست نمایشی',
      active: true,
      trusted: true,
    },
    {
      id: 'device-demo-2',
      name: 'دستگاه نمونه دوم',
      browser: 'Chrome / Windows',
      lastSeen: 'اطلاعات آزمایشی',
      active: true,
      trusted: false,
    },
  ]);

  readonly sessions = signal<AccountSession[]>([
    {
      id: 'session-demo-1',
      device: 'دستگاه فعلی',
      location: 'نشست نمایشی',
      createdAt: 'اطلاعات آزمایشی',
      lastActivity: 'اکنون',
      current: true,
      active: true,
    },
    {
      id: 'session-demo-2',
      device: 'دستگاه نمونه دوم',
      location: 'موقعیت ثبت نشده',
      createdAt: 'اطلاعات آزمایشی',
      lastActivity: 'اطلاعات آزمایشی',
      current: false,
      active: true,
    },
  ]);

  readonly permissions = signal<AccountPermission[]>([
    {
      code: 'user.read',
      name: 'مشاهده اطلاعات کاربر',
      description: 'مشاهده اطلاعات پایه حساب کاربری',
      category: 'حساب کاربری',
    },
    {
      code: 'user.update',
      name: 'ویرایش اطلاعات کاربر',
      description: 'ویرایش اطلاعات مجاز حساب',
      category: 'حساب کاربری',
    },
    {
      code: 'profile.read',
      name: 'مشاهده مشخصات',
      description: 'مشاهده اطلاعات تکمیلی پروفایل',
      category: 'پروفایل',
    },
    {
      code: 'profile.update',
      name: 'ویرایش مشخصات',
      description: 'ویرایش اطلاعات تکمیلی پروفایل',
      category: 'پروفایل',
    },
    {
      code: 'verification.read',
      name: 'مشاهده احراز هویت',
      description: 'مشاهده وضعیت درخواست‌های احراز هویت',
      category: 'احراز هویت',
    },
    {
      code: 'verification.request',
      name: 'درخواست احراز هویت',
      description: 'ثبت درخواست احراز هویت',
      category: 'احراز هویت',
    },
    {
      code: 'market.read',
      name: 'مشاهده بازار',
      description: 'دسترسی مشاهده‌ای به بازار',
      category: 'بازار',
    },
    {
      code: 'order.create',
      name: 'ایجاد سفارش',
      description: 'مجوز ایجاد سفارش در محدوده مجاز',
      category: 'بازار',
    },
  ]);

  private sequence = 0;

  private createId(prefix: string): string {
    this.sequence += 1;
    return `${prefix}-${Date.now()}-${this.sequence}`;
  }

  updateProfile(value: AccountProfile): void {
    this.profile.set({ ...value });
  }

  updateLegalEntity(value: AccountLegalEntity): void {
    this.legalEntity.set({ ...value });
  }

  addPhone(value: string): void {
    const items = this.phones();
    this.phones.set([
      ...items,
      {
        id: this.createId('phone'),
        value,
        primary: items.length === 0,
        verified: false,
      },
    ]);
  }

  removePhone(id: string): void {
    const remaining = this.phones().filter(item => item.id !== id);
    if (remaining.length > 0 && !remaining.some(item => item.primary)) {
      remaining[0].primary = true;
    }
    this.phones.set([...remaining]);
  }

  setPrimaryPhone(id: string): void {
    this.phones.update(items =>
      items.map(item => ({ ...item, primary: item.id === id })),
    );
  }

  addEmail(value: string): void {
    const items = this.emails();
    this.emails.set([
      ...items,
      {
        id: this.createId('email'),
        value,
        primary: items.length === 0,
        verified: false,
      },
    ]);
  }

  removeEmail(id: string): void {
    const remaining = this.emails().filter(item => item.id !== id);
    if (remaining.length > 0 && !remaining.some(item => item.primary)) {
      remaining[0].primary = true;
    }
    this.emails.set([...remaining]);
  }

  setPrimaryEmail(id: string): void {
    this.emails.update(items =>
      items.map(item => ({ ...item, primary: item.id === id })),
    );
  }

  addDocument(type: string, fileName: string): void {
    this.documents.update(items => [
      ...items,
      {
        id: this.createId('document'),
        type,
        fileName,
        selectedAt: new Date().toLocaleString('fa-IR'),
        state: 'local_only',
      },
    ]);
  }

  removeDocument(id: string): void {
    this.documents.update(items => items.filter(item => item.id !== id));
  }

  revokeDevice(id: string): void {
    this.devices.update(items =>
      items.map(item =>
        item.id === id ? { ...item, active: false } : item,
      ),
    );
  }

  endSession(id: string): void {
    this.sessions.update(items =>
      items.map(item =>
        item.id === id ? { ...item, active: false } : item,
      ),
    );
  }

  endOtherSessions(): void {
    this.sessions.update(items =>
      items.map(item =>
        item.current ? item : { ...item, active: false },
      ),
    );
  }
}