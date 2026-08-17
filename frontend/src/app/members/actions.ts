//frontend/src/app/members/sctions.ts
'use server';

import db from '@/lib/sqlite';
import { revalidatePath } from 'next/cache';

export interface Member {
  ID?: number;
  CallSign: string;
  LicenseClass: string;
  CARCOfficer: string;
  FirstName: string;
  LastName: string;
  Address: string;
  Apt_Suite: string;
  City: string;
  State: string;
  ZIP: number | null;
  HomePhone: string;
  CellPhone: string;
  CellTxt: string;
  Email1: string;
  Email2: string;
  CARCMember: number;
  Active: number;
  Inactive: number;
  DuesDue: number;
  DuesPaid: number;
  DatePaid: string;
  LastPaid: string;
  NextDue: string;
  AmountPaid: number | null;
  YrsLicensed: string;
  MemberSince: number | null;
  DonateTo: string;
  DonationAmt: number | null;
  ARRL: number;
  ARES: number;
  RACES: number;
  CERT: number;
  Packet: string;
}

export async function getMembers(search: string = ''): Promise<Member[]> {
  if (search.trim()) {
    const stmt = db.prepare(`
      SELECT * FROM members 
      WHERE CallSign LIKE ? OR FirstName LIKE ? OR LastName LIKE ?
      ORDER BY LastName, FirstName
    `);
    const wildcard = `%${search.trim()}%`;
    return stmt.all(wildcard, wildcard, wildcard) as Member[];
  }
  return db.prepare('SELECT * FROM members ORDER BY LastName, FirstName').all() as Member[];
}

export async function saveMember(formData: FormData) {
  const id = formData.get('ID') ? Number(formData.get('ID')) : null;

  const data = {
    CallSign: (formData.get('CallSign') as string) || '',
    LicenseClass: (formData.get('LicenseClass') as string) || '',
    CARCOfficer: (formData.get('CARCOfficer') as string) || '',
    FirstName: (formData.get('FirstName') as string) || '',
    LastName: (formData.get('LastName') as string) || '',
    Address: (formData.get('Address') as string) || '',
    Apt_Suite: (formData.get('Apt_Suite') as string) || '',
    City: (formData.get('City') as string) || '',
    State: (formData.get('State') as string) || '',
    ZIP: formData.get('ZIP') ? Number(formData.get('ZIP')) : null,
    HomePhone: (formData.get('HomePhone') as string) || '',
    CellPhone: (formData.get('CellPhone') as string) || '',
    CellTxt: (formData.get('CellTxt') as string) || '',
    Email1: (formData.get('Email1') as string) || '',
    Email2: (formData.get('Email2') as string) || '',
    CARCMember: formData.get('CARCMember') === 'on' ? 1 : 0,
    Active: formData.get('Active') === 'on' ? 1 : 0,
    Inactive: formData.get('Inactive') === 'on' ? 1 : 0,
    DuesDue: formData.get('DuesDue') === 'on' ? 1 : 0,
    DuesPaid: formData.get('DuesPaid') === 'on' ? 1 : 0,
    DatePaid: (formData.get('DatePaid') as string) || '',
    LastPaid: (formData.get('LastPaid') as string) || '',
    NextDue: (formData.get('NextDue') as string) || '',
    AmountPaid: formData.get('AmountPaid') ? Number(formData.get('AmountPaid')) : null,
    YrsLicensed: (formData.get('YrsLicensed') as string) || '',
    MemberSince: formData.get('MemberSince') ? Number(formData.get('MemberSince')) : null,
    DonateTo: (formData.get('DonateTo') as string) || '',
    DonationAmt: formData.get('DonationAmt') ? Number(formData.get('DonationAmt')) : null,
    ARRL: formData.get('ARRL') === 'on' ? 1 : 0,
    ARES: formData.get('ARES') === 'on' ? 1 : 0,
    RACES: formData.get('RACES') === 'on' ? 1 : 0,
    CERT: formData.get('CERT') === 'on' ? 1 : 0,
    Packet: (formData.get('Packet') as string) || ''
  };

  if (id) {
    // Update existing member
    const stmt = db.prepare(`
      UPDATE members SET
        CallSign = @CallSign, LicenseClass = @LicenseClass, CARCOfficer = @CARCOfficer,
        FirstName = @FirstName, LastName = @LastName, Address = @Address, Apt_Suite = @Apt_Suite,
        City = @City, State = @State, ZIP = @ZIP, HomePhone = @HomePhone, CellPhone = @CellPhone,
        CellTxt = @CellTxt, Email1 = @Email1, Email2 = @Email2, CARCMember = @CARCMember,
        Active = @Active, Inactive = @Inactive, DuesDue = @DuesDue, DuesPaid = @DuesPaid,
        DatePaid = @DatePaid, LastPaid = @LastPaid, NextDue = @NextDue, AmountPaid = @AmountPaid,
        YrsLicensed = @YrsLicensed, MemberSince = @MemberSince, DonateTo = @DonateTo,
        DonationAmt = @DonationAmt, ARRL = @ARRL, ARES = @ARES, RACES = @RACES, CERT = @CERT,
        Packet = @Packet
      WHERE ID = @id
    `);
    stmt.run({ ...data, id });
  } else {
    // Insert new member
    const stmt = db.prepare(`
      INSERT INTO members (
        CallSign, LicenseClass, CARCOfficer, FirstName, LastName, Address, Apt_Suite,
        City, State, ZIP, HomePhone, CellPhone, CellTxt, Email1, Email2,
        CARCMember, Active, Inactive, DuesDue, DuesPaid, DatePaid, LastPaid, NextDue,
        AmountPaid, YrsLicensed, MemberSince, DonateTo, DonationAmt, ARRL, ARES, RACES, CERT, Packet
      ) VALUES (
        @CallSign, @LicenseClass, @CARCOfficer, @FirstName, @LastName, @Address, @Apt_Suite,
        @City, @State, @ZIP, @HomePhone, @CellPhone, @CellTxt, @Email1, @Email2,
        @CARCMember, @Active, @Inactive, @DuesDue, @DuesPaid, @DatePaid, @LastPaid, @NextDue,
        @AmountPaid, @YrsLicensed, @MemberSince, @DonateTo, @DonationAmt, @ARRL, @ARES, @RACES, @CERT, @Packet
      )
    `);
    stmt.run(data);
  }

  revalidatePath('/members');
}

export async function deleteMember(id: number) {
  const stmt = db.prepare('DELETE FROM members WHERE ID = ?');
  stmt.run(id);
  revalidatePath('/members');
}