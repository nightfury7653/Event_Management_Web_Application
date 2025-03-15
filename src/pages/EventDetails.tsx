import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Calendar as CalendarIcon, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Event } from '../types';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
    if (user) {
      checkRegistration();
    }
  }, [id, user]);

  async function fetchEvent() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Error loading event');
      navigate('/');
      return;
    }

    setEvent(data);
    setLoading(false);
  }

  async function checkRegistration() {
    if (!user || !id) return;

    const { data, error } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error checking registration:', error);
      return;
    }

    setIsRegistered(data && data.length > 0);
  }

  async function handleRegistration() {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!event) return;

    setRegistering(true);
    try {
      if (isRegistered) {
        // Unregister
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update attendee count
        await supabase
          .from('events')
          .update({ current_attendees: event.current_attendees - 1 })
          .eq('id', event.id);

        toast.success('Successfully unregistered from event');
        setIsRegistered(false);
        setEvent({ ...event, current_attendees: event.current_attendees - 1 });
      } else {
        // Check if event is full
        if (event.current_attendees >= event.max_attendees) {
          toast.error('Event is full');
          return;
        }

        // Register
        const { error } = await supabase.from('event_attendees').insert({
          event_id: event.id,
          user_id: user.id,
        });

        if (error) throw error;

        // Update attendee count
        await supabase
          .from('events')
          .update({ current_attendees: event.current_attendees + 1 })
          .eq('id', event.id);

        toast.success('Successfully registered for event');
        setIsRegistered(true);
        setEvent({ ...event, current_attendees: event.current_attendees + 1 });
      }
    } catch (error) {
      toast.error('Error updating registration');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg shadow-lg mb-8"
        />
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <span>{format(new Date(event.date), 'PPP')}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span>{format(new Date(event.date), 'p')}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span>
                {event.current_attendees} / {event.max_attendees} attendees
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleRegistration}
              disabled={registering}
              className={`px-6 py-3 rounded-lg font-semibold text-white ${
                isRegistered
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full md:w-auto`}
            >
              {registering
                ? 'Processing...'
                : isRegistered
                ? 'Cancel Registration'
                : 'Register for Event'}
            </button>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Event Description
          </h2>
          <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;