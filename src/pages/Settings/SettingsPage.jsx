
import { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import {
  Settings,
  Bell,
  Shield,
  Sliders,
  Check,
  Server,
  Activity,
  Save,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";

const SETTINGS_STORAGE_KEY = "bugtracker_user_settings";

const defaultSettings = {
  inAppToasts: true,
  autoRefreshNotifications: true,
  refreshInterval: "15",
  tableDensity: "comfortable",
  confirmBeforeDelete: true,
};

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900";

const headingClass =
  "text-sm font-bold text-slate-900 dark:text-slate-100";

const descriptionClass =
  "mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400";

const dividerClass =
  "border-b border-slate-200 pb-3 dark:border-slate-800";

const fieldClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-500/20";

const ToggleSwitch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
      }`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"
        }`}
    />
  </button>
);

const SectionHeading = ({ icon: Icon, title, description }) => (
  <div className={`flex items-center gap-3 ${dividerClass}`}>
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
      <Icon size={19} />
    </div>

    <div>
      <h2 className={headingClass}>{title}</h2>
      <p className={descriptionClass}>{description}</p>
    </div>
  </div>
);

const SettingsPage = () => {
  const { user } = useContext(AuthContext);

  const [settings, setSettings] = useState(defaultSettings);
  const [pingStatus, setPingStatus] = useState(null);
  const [pinging, setPinging] = useState(false);

  // Load saved preferences.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        setSettings({
          ...defaultSettings,
          ...parsed,
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Could not load saved preferences");
    }
  }, []);

  const handleToggle = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const handleSelect = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const savePreferences = () => {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );

      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save preferences");
    }
  };

  const resetPreferences = () => {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      setSettings({ ...defaultSettings });
      toast.success("Reset to default preferences");
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error("Failed to reset preferences");
    }
  };

  // Test backend connectivity using the existing API client.
  const handleTestConnection = async () => {
    setPinging(true);
    setPingStatus(null);

    const start = Date.now();

    try {
      await API.get("/bugs");

      const latency = Date.now() - start;
      setPingStatus({ ok: true, latency });
      toast.success(`Connected to API server in ${latency}ms`);
    } catch (error) {
      const latency = Date.now() - start;

      console.error("API connection test failed:", error);
      setPingStatus({ ok: false, latency });
      toast.error("Could not reach API server");
    } finally {
      setPinging(false);
    }
  };

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080/api";

  const uploadsBaseUrl =
    import.meta.env.VITE_UPLOADS_BASE_URL ||
    "http://localhost:8080/uploads";

  return (
    <div className="mx-auto min-h-full max-w-6xl space-y-6 bg-slate-50 p-4 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Settings size={22} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Settings &amp; Preferences
            </h1>

            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              Workspace
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage your preferences and inspect your backend connection.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetPreferences}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={savePreferences}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            <Save size={15} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Preferences */}
        <div className="space-y-6 lg:col-span-2">
          {/* Notifications */}
          <section className={`${cardClass} space-y-5`}>
            <SectionHeading
              icon={Bell}
              title="Notification Behavior"
              description="Choose your notification preferences."
            />

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    In-App Toast Alerts
                  </p>
                  <p className={descriptionClass}>
                    Preference for popup confirmations and status messages.
                  </p>
                </div>

                <ToggleSwitch
                  label="In-App Toast Alerts"
                  checked={settings.inAppToasts}
                  onChange={() => handleToggle("inAppToasts")}
                />
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Auto-Poll Notifications
                  </p>
                  <p className={descriptionClass}>
                    Save your preference for background notification checks.
                  </p>
                </div>

                <ToggleSwitch
                  label="Auto-Poll Notifications"
                  checked={settings.autoRefreshNotifications}
                  onChange={() =>
                    handleToggle("autoRefreshNotifications")
                  }
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Poll Frequency
                  </p>
                  <p className={descriptionClass}>
                    Preferred interval for notification updates.
                  </p>
                </div>

                <select
                  value={settings.refreshInterval}
                  onChange={(event) =>
                    handleSelect("refreshInterval", event.target.value)
                  }
                  className={fieldClass}
                >
                  <option value="15">Every 15 seconds</option>
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every 1 minute</option>
                </select>
              </div>
            </div>
          </section>

          {/* Display options */}
          <section className={`${cardClass} space-y-5`}>
            <SectionHeading
              icon={Sliders}
              title="Interface Display Options"
              description="Customize your preferred table density and confirmations."
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Table Row Spacing
                </p>
                <p className={descriptionClass}>
                  Choose comfortable or compact spacing.
                </p>
              </div>

              <div
                className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950"
                role="group"
                aria-label="Table row spacing"
              >
                {["comfortable", "compact"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={settings.tableDensity === mode}
                    onClick={() => handleSelect("tableDensity", mode)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${settings.tableDensity === mode
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Confirm Destructive Actions
                </p>
                <p className={descriptionClass}>
                  Preference for confirmation prompts before deletions.
                </p>
              </div>

              <ToggleSwitch
                label="Confirm Destructive Actions"
                checked={settings.confirmBeforeDelete}
                onChange={() => handleToggle("confirmBeforeDelete")}
              />
            </div>
          </section>
        </div>

        {/* System information */}
        <div className="space-y-6">
          {/* API diagnostics */}
          <section className={`${cardClass} space-y-5`}>
            <SectionHeading
              icon={Server}
              title="API Diagnostics"
              description="Backend connection and configured endpoints."
            />

            <div className="space-y-4">
              <div>
                <span className={attributeLabel}>
                  API Base Endpoint
                </span>
                <code className="block break-all rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-indigo-700 dark:border-slate-800 dark:bg-slate-950 dark:text-indigo-300">
                  {apiBaseUrl}
                </code>
              </div>

              <div>
                <span className={attributeLabel}>
                  Uploads Directory URL
                </span>
                <code className="block break-all rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  {uploadsBaseUrl}
                </code>
              </div>

              <div>
                <span className={attributeLabel}>Environment</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {import.meta.env.MODE || "development"}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={pinging}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              >
                {pinging ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Activity size={16} />
                )}
                {pinging
                  ? "Testing Connection..."
                  : "Test Backend Connection"}
              </button>

              {pingStatus && (
                <div
                  className={`mt-3 flex items-center justify-between gap-2 rounded-xl border p-3 text-xs ${pingStatus.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                    }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {pingStatus.ok ? (
                      <Check size={15} />
                    ) : (
                      <Activity size={15} />
                    )}
                    {pingStatus.ok ? "Connection successful" : "Connection failed"}
                  </span>

                  <span className="shrink-0 font-mono font-bold">
                    {pingStatus.latency} ms
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Session information */}
          <section className={`${cardClass} space-y-5`}>
            <SectionHeading
              icon={Shield}
              title="Active Session"
              description="Current account information."
            />

            <div className="space-y-4">
              <div>
                <span className={attributeLabel}>Logged in as</span>
                <p className={headingClass}>
                  {user?.name || "User"}
                </p>
              </div>

              <div>
                <span className={attributeLabel}>Email Address</span>
                <p className="break-all text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.email || "N/A"}
                </p>
              </div>

              <div>
                <span className={attributeLabel}>Role</span>
                <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {user?.role || "Member"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Authentication
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Check size={14} />
                  JWT Session
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Shared label style for diagnostic and account fields.
const attributeLabel =
  "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

export default SettingsPage;
