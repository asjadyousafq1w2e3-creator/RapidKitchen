import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Settings, Store, Truck, CreditCard, Bell } from "lucide-react";
import { toast } from "sonner";

const defaultSettings: Record<string, string> = {
  store_name: "ChefEase",
  store_email: "support@chefease.pk",
  store_phone: "+92 300 1234567",
  store_address: "Lahore, Pakistan",
  currency: "PKR",
  free_shipping_threshold: "3000",
  shipping_fee: "250",
  tax_rate: "0",
  order_notification_email: "",
  meta_title: "ChefEase - Premium Kitchen Gadgets",
  meta_description: "Shop premium kitchen gadgets and accessories at ChefEase Pakistan.",
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({ ...defaultSettings });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"general" | "shipping" | "seo">("general");

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("store_settings").select("*");
    if (data) {
      const map: Record<string, string> = { ...defaultSettings };
      data.forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      await supabase.from("store_settings").upsert({ key, value }, { onConflict: "key" });
    }
    toast.success("Settings saved successfully!");
    setSaving(false);
  };

  const set = (key: string, value: string) => setSettings({ ...settings, [key]: value });

  const tabs = [
    { id: "general" as const, label: "General", icon: Store },
    { id: "shipping" as const, label: "Shipping & Tax", icon: Truck },
    { id: "seo" as const, label: "SEO", icon: Settings },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-foreground">Store Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure your store</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft space-y-5">
          {tab === "general" && (
            <>
              <h3 className="font-display text-lg text-foreground">General Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField label="Store Name" value={settings.store_name} onChange={(v) => set("store_name", v)} />
                <SettingField label="Store Email" value={settings.store_email} onChange={(v) => set("store_email", v)} type="email" />
                <SettingField label="Store Phone" value={settings.store_phone} onChange={(v) => set("store_phone", v)} />
                <SettingField label="Currency" value={settings.currency} onChange={(v) => set("currency", v)} />
                <div className="sm:col-span-2">
                  <SettingField label="Store Address" value={settings.store_address} onChange={(v) => set("store_address", v)} />
                </div>
                <SettingField label="Order Notification Email" value={settings.order_notification_email} onChange={(v) => set("order_notification_email", v)} type="email" placeholder="Receive email on new orders" />
              </div>
            </>
          )}

          {tab === "shipping" && (
            <>
              <h3 className="font-display text-lg text-foreground">Shipping & Tax</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField label="Shipping Fee (PKR)" value={settings.shipping_fee} onChange={(v) => set("shipping_fee", v)} type="number" />
                <SettingField label="Free Shipping Threshold (PKR)" value={settings.free_shipping_threshold} onChange={(v) => set("free_shipping_threshold", v)} type="number" />
                <SettingField label="Tax Rate (%)" value={settings.tax_rate} onChange={(v) => set("tax_rate", v)} type="number" />
              </div>
            </>
          )}

          {tab === "seo" && (
            <>
              <h3 className="font-display text-lg text-foreground">SEO Settings</h3>
              <div className="space-y-4">
                <SettingField label="Meta Title" value={settings.meta_title} onChange={(v) => set("meta_title", v)} />
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Meta Description</label>
                  <textarea
                    value={settings.meta_description}
                    onChange={(e) => set("meta_description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const SettingField = ({
  label, value, onChange, type = "text", placeholder = ""
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div>
    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
    />
  </div>
);

export default AdminSettings;
