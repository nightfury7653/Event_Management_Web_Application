import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Event } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function MyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [monthlyEvents, setMonthlyEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  async function fetchMyEvents() {
    try {
      // Fetch events created by the user
      const { data: createdEvents, error: createdError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id);

      if (createdError) throw createdError;

      // First get the event IDs the user is attending
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', user?.id);

      if (attendeeError) throw attendeeError;

      // Then fetch the actual events using those IDs
      const eventIds = attendeeData?.map(entry => entry.event_id) || [];
      const { data: attendingEvents, error: attendingError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds);

      if (attendingError) throw attendingError;

      // Combine and deduplicate events
      const allEvents = [
        ...(createdEvents || []),
        ...(attendingEvents || [])
      ];
      const uniqueEvents = Array.from(
        new Map(allEvents.map((event) => [event.id, event])).values()
      );

      setEvents(uniqueEvents);

      // Process data for charts
      processChartData(uniqueEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  function processChartData(events: Event[]) {
    // Attendance ratio data
    const attendanceData = events.map((event) => ({
      name: event.title,
      value: (event.current_attendees / event.max_attendees) * 100,
    }));
    setAttendanceData(attendanceData);

    // Monthly events data
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlyData = events
      .filter(
        (event) =>
          parseISO(event.date) >= monthStart && parseISO(event.date) <= monthEnd
      )
      .reduce((acc: any[], event) => {
        const day = format(parseISO(event.date), 'd');
        const existing = acc.find((item) => item.day === day);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ day, count: 1 });
        }
        return acc;
      }, []);

    setMonthlyEvents(monthlyData);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <Link
          to="/create-event"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create New Event
        </Link>
      </div>

      {events.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Attendance Rate Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Event Attendance Rates</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Events Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                Events This Month
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyEvents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Event List</h2>
              <div className="space-y-4">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(event.date), 'PPP')}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.current_attendees} / {event.max_attendees} attendees
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">You haven't created or joined any events yet.</p>
          <Link
            to="/create-event"
            className="mt-4 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Create Your First Event
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyEvents;