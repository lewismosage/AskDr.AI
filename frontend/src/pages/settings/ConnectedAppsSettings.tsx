import React from 'react';
import { Link, Trash2, AlertTriangle, ChevronRight } from 'lucide-react';

interface ConnectedApp {
  id: string;
  name: string;
  logo: string;
  permissions: string[];
  lastUsed: string;
  scopes: string[];
}

interface ConnectedAppsSettingsProps {
  connectedApps: ConnectedApp[];
  onRevokeAccess: (appId: string) => void;
  onViewPermissions: (appId: string) => void;
}

const ConnectedAppsSettings: React.FC<ConnectedAppsSettingsProps> = ({
  connectedApps,
  onRevokeAccess,
  onViewPermissions
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Link className="h-5 w-5 mr-2" />
        Connected Apps
      </h2>

      {connectedApps.length === 0 ? (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
          <p className="text-blue-800">No apps connected to your account</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Third-party access</h3>
              <p className="text-sm text-yellow-700">
                Review apps that have access to your account. Remove any you don't recognize or no longer use.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {connectedApps.map((app) => (
              <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      {app.logo ? (
                        <img src={app.logo} alt={app.name} className="w-6 h-6" />
                      ) : (
                        <span className="text-xs font-medium text-gray-500">{app.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{app.name}</h3>
                      <p className="text-sm text-gray-500">
                        Last used {app.lastUsed} • {app.scopes.length} permissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => onViewPermissions(app.id)}
                      className="text-primary hover:text-primary-dark text-sm font-medium flex items-center"
                    >
                      View details <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                    <button
                      onClick={() => onRevokeAccess(app.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
            <h3 className="font-medium mb-2">About app permissions</h3>
            <p className="text-sm text-gray-600">
              Connected apps can access certain information as described in their permissions. 
              You should only authorize apps you trust.
            </p>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default ConnectedAppsSettings;