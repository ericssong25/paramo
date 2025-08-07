import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Share2, 
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { Campaign, ContentItem } from '../types';

interface CampaignDashboardProps {
  campaigns: Campaign[];
  contentItems: ContentItem[];
}

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  campaigns,
  contentItems,
}) => {
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalReach = campaigns.reduce((sum, c) => sum + (c.metrics?.reach || 0), 0);
  const totalEngagement = campaigns.reduce((sum, c) => sum + (c.metrics?.engagement || 0), 0);
  const avgROI = campaigns.reduce((sum, c) => sum + (c.metrics?.roi || 0), 0) / campaigns.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'awareness': return 'bg-purple-100 text-purple-800';
      case 'engagement': return 'bg-blue-100 text-blue-800';
      case 'conversion': return 'bg-green-100 text-green-800';
      case 'retention': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{activeCampaigns.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(totalReach)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8.2%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(totalEngagement)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+15.3%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average ROI</p>
              <p className="text-2xl font-bold text-gray-900">{avgROI.toFixed(1)}x</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+5.7%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {activeCampaigns.map(campaign => (
            <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCampaignTypeColor(campaign.type)}`}>
                      {campaign.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{campaign.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {campaign.startDate.toLocaleDateString()} - {campaign.endDate.toLocaleDateString()}
                      </span>
                    </div>
                    {campaign.budget && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(campaign.budget)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{campaign.platforms.length} platforms</span>
                    </div>
                  </div>
                </div>

                {campaign.metrics && (
                  <div className="ml-6 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(campaign.metrics.reach)}
                      </div>
                      <div className="text-xs text-gray-500">Reach</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(campaign.metrics.engagement)}
                      </div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {campaign.metrics.conversions}
                      </div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {campaign.metrics.roi.toFixed(1)}x
                      </div>
                      <div className="text-xs text-gray-500">ROI</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Campaign Progress</span>
                  <span>
                    {Math.round(
                      ((new Date().getTime() - campaign.startDate.getTime()) / 
                       (campaign.endDate.getTime() - campaign.startDate.getTime())) * 100
                    )}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, Math.round(
                        ((new Date().getTime() - campaign.startDate.getTime()) / 
                         (campaign.endDate.getTime() - campaign.startDate.getTime())) * 100
                      ))}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">
              7 days
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              30 days
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              90 days
            </button>
          </div>
        </div>
        
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Performance chart would be displayed here</p>
            <p className="text-sm text-gray-400">Integration with analytics tools coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;