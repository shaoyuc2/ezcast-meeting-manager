
export interface Participant {
  name: string;
  email: string;
}

export interface Booking {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  attendees: Participant[];
  host: {
    name: string;
    email: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
}

export interface AssignmentMap {
  [bookingId: string]: string; // bookingId -> memberId
}

export interface AppState {
  members: TeamMember[];
  assignments: AssignmentMap;
}

export enum ViewType {
  BOOKINGS = 'BOOKINGS',
  MEMBERS = 'MEMBERS'
}
