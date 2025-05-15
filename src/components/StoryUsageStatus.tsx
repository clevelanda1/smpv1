import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { BarChartLine } from 'react-bootstrap-icons';

interface UsageData {
  stories_created: number;
  stories_remaining: number;
  days_remaining: number;
  monthly_limit: number;
}

const StoryUsageStatus: React.FC = () => {
  const { user } = useAuth();
  const { subscriptionDetails } = useSubscription();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUsageData();
    }
  }, [user]);

  const fetchUsageData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_story_usage')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUsageData(data);
      } else {
        setUsageData({
          stories_created: 0,
          stories_remaining: 20,
          days_remaining: 30,
          monthly_limit: 20
        });
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
    } finally {
      setLoading(false);
    }
  };

  // Only show for Storybook Starter plan (price_1RMjaQPLXvC55IxstFbeHc3I)
  if (
    !user || 
    !subscriptionDetails?.price_id || 
    subscriptionDetails.price_id !== 'price_1RMjaQPLXvC55IxstFbeHc3I'
  ) {
    return null;
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-green-50 rounded-xl p-6 border border-green-100">
        <div className="h-6 w-48 bg-green-200 rounded mb-4"></div>
        <div className="h-4 w-32 bg-green-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-xl p-6 border border-red-100">
        <p>Error loading usage data. Please try again later.</p>
      </div>
    );
  }

  const progressPercentage = (usageData.stories_created / usageData.monthly_limit) * 100;

  return (
    <div className="bg-green-50 rounded-xl p-6 border border-green-100">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-semibold text-large text-green-800">Story Creation Status</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-green-700">
              Stories Created: {usageData.stories_created}/{usageData.monthly_limit}
            </span>
            <span className="text-green-700">
              {usageData.stories_remaining} remaining
            </span>
          </div>
          <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-green-600">
          {usageData.days_remaining > 0 
            ? `${Math.ceil(usageData.days_remaining)} days until reset`
            : 'Resets today'
          }
        </p>
      </div>
    </div>
  );
}

export default StoryUsageStatus;