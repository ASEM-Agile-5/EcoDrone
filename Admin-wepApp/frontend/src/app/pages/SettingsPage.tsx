import { Bell, Shield, Radio, Database } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import React from "react";

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#8A1538' }}>Settings</h1>
        <p className="text-gray-600">Manage system preferences and configurations</p>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#8A1538]" />
          </div>
          <div>
            <h3 className="text-lg">Notification Settings</h3>
            <p className="text-sm text-gray-600">Configure alert preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <Label htmlFor="delivery-alerts">Delivery Alerts</Label>
              <p className="text-sm text-gray-500">Get notified about delivery status changes</p>
            </div>
            <Switch id="delivery-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <Label htmlFor="environmental-alerts">Environmental Alerts</Label>
              <p className="text-sm text-gray-500">Alerts for unusual environmental readings</p>
            </div>
            <Switch id="environmental-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <Label htmlFor="system-alerts">System Alerts</Label>
              <p className="text-sm text-gray-500">Technical issues and maintenance notifications</p>
            </div>
            <Switch id="system-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label htmlFor="email-digest">Daily Email Digest</Label>
              <p className="text-sm text-gray-500">Receive daily summary reports via email</p>
            </div>
            <Switch id="email-digest" />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#8A1538]" />
          </div>
          <div>
            <h3 className="text-lg">Security Settings</h3>
            <p className="text-sm text-gray-600">Manage access and authentication</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" placeholder="••••••••" />
          </div>

          <Button className="bg-[#8A1538] hover:bg-[#6d1029] text-white">
            Update Password
          </Button>
        </div>
      </div>

      {/* Drone Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
            <Radio className="w-5 h-5 text-[#8A1538]" />
          </div>
          <div>
            <h3 className="text-lg">Drone Configuration</h3>
            <p className="text-sm text-gray-600">Fleet management settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <Label htmlFor="auto-assign">Auto-assign Deliveries</Label>
              <p className="text-sm text-gray-500">Automatically assign deliveries to available drones</p>
            </div>
            <Switch id="auto-assign" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <Label htmlFor="return-home">Auto Return to Base</Label>
              <p className="text-sm text-gray-500">Drones return automatically after delivery</p>
            </div>
            <Switch id="return-home" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label htmlFor="low-battery">Low Battery Protocol</Label>
              <p className="text-sm text-gray-500">Prevent takeoff when battery is below 30%</p>
            </div>
            <Switch id="low-battery" defaultChecked />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-[#8A1538]" />
          </div>
          <div>
            <h3 className="text-lg">Data Management</h3>
            <p className="text-sm text-gray-600">Export and backup options</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Export All Delivery Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Export Environmental Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Download System Logs
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
            Clear Historical Data
          </Button>
        </div>
      </div>
    </div>
  );
}