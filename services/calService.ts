import { CAL_API_KEY, CAL_API_BASE, FILTER_YEAR_FROM } from '../constants';
import { Booking } from '../types';

export const fetchBookings = async (): Promise<Booking[]> => {
  try {
    const response = await fetch(`${CAL_API_BASE}/bookings?apiKey=${CAL_API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');

    const data = await response.json();
    const bookings: any[] = data.bookings || [];

    const filtered = bookings.filter((b: any) => {
      const start = new Date(b.startTime);
      return start.getFullYear() >= FILTER_YEAR_FROM;
    });

    return filtered.map(b => ({
      id: b.id,
      title: b.title,
      startTime: b.startTime,
      endTime: b.endTime,
      attendees: b.attendees.map((a: any) => ({ name: a.name, email: a.email })),
      host: {
        name: b.user?.name || 'Host',
        email: b.user?.email || '',
      },
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};
