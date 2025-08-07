import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Approval, ContentItem, Client, User as UserType } from '../types';

interface ApprovalCenterProps {
  approvals: Approval[];
  contentItems: ContentItem[];
  clients: Client[];
  users: UserType[];
  onApprovalAction: (approvalId: string, action: 'approve' | 'reject', feedback?: string) => void;
}

const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  approvals,
  contentItems,
  clients,
  users,
  onApprovalAction,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'changes-requested': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'changes-requested': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentItem = (itemId: string) => {
    return contentItems.find(item => item.id === itemId);
  };

  const getApproverInfo = (approver: UserType | Client) => {
    // Check if it's a client or user based on properties
    if ('company' in approver) {
      return {
        name: approver.name,
        role: `${approver.role} at ${approver.company}`,
        avatar: approver.avatar,
        type: 'client' as const
      };
    } else {
      return {
        name: approver.name,
        role: approver.role,
        avatar: approver.avatar,
        type: 'user' as const
      };
    }
  };

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const recentApprovals = approvals.filter(a => a.status !== 'pending').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
              {pendingApprovals.length > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  {pendingApprovals.length} pending
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">No pending approvals</p>
              <p className="text-sm text-gray-400">All content has been reviewed</p>
            </div>
          ) : (
            pendingApprovals.map(approval => {
              const content = getContentItem(approval.itemId);
              const approverInfo = getApproverInfo(approval.approver);
              
              if (!content) return null;

              return (
                <div key={approval.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={approverInfo.avatar} 
                        alt={approverInfo.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {content.title}
                        </h4>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(approval.status)}`}>
                          {getStatusIcon(approval.status)}
                          <span className="capitalize">{approval.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{approverInfo.name}</span>
                          <span className="text-gray-400">•</span>
                          <span>{approverInfo.role}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Requested {approval.requestedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {content.content}
                      </p>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onApprovalAction(approval.id, 'approve')}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        
                        <button
                          onClick={() => onApprovalAction(approval.id, 'reject')}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>Request Changes</span>
                        </button>
                        
                        <button className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Approvals */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Approvals</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {recentApprovals.map(approval => {
            const content = getContentItem(approval.itemId);
            const approverInfo = getApproverInfo(approval.approver);
            
            if (!content) return null;

            return (
              <div key={approval.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={approverInfo.avatar} 
                      alt={approverInfo.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {content.title}
                      </h4>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(approval.status)}`}>
                        {getStatusIcon(approval.status)}
                        <span className="capitalize">{approval.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <span>{approverInfo.name}</span>
                      <span>•</span>
                      <span>{approval.respondedAt?.toLocaleDateString()}</span>
                    </div>
                    
                    {approval.feedback && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-2">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{approval.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApprovalCenter;