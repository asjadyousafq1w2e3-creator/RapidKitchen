import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Settings, Store, Truck, Sliders, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const defaultSlides = [
  {
    bg: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop",
    productId: "aero-blend-mixer",
    tag: "🔥 Top Rated — 312 Reviews",
    headingLine1: "Blend Smarter,",
    headingAccent: "Not Harder",
    urgency: "Only 12 left in stock",
  },
  {
    bg: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=1200&h=600&fit=crop",
    productId: "smart-chopper-pro",
    tag: "⭐ Best Seller — 234 Reviews",
    headingLine1: "Chop, Mince,",
    headingAccent: "Done in Seconds",
    urgency: "Free shipping today",
  },
  {
    bg: "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=1200&h=600&fit=crop",
    productId: "ceramic-knife-set",
    tag: "🏆 Chef's Favorite",
    headingLine1: "Cut Like a",
    headingAccent: "Master Chef",
    urgency: "Includes knife block",
  }
];

const defaultSettings: Record<string, string> = {
  store_name: "Kitchub Store",
  store_email: "hello@kitchub.store",
  store_phone: "+92 300 1234567",
  store_address: "Lahore, Pakistan",
  currency: "PKR",
  free_shipping_threshold: "3500",
  shipping_fee: "250",
  tax_rate: "0",
  order_notification_email: "",
  meta_title: "Kitchub Store | Premium Daily Home & Kitchen Products",
  meta_description: "Shop Kitchub Store for the best daily home products, premium kitchen gadgets, and small items every mom wants in her house. Free shipping above PKR 3,500.",
  hero_slides: JSON.stringify(defaultSlides),
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({ ...defaultSettings });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"general" | "shipping" | "seo" | "hero">("general");
  const [slides, setSlides] = useState<any[]>(defaultSlides);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        const data = json.settings || [];
        const map: Record<string, string> = { ...defaultSettings };
        data.forEach((s: any) => { map[s.key] = s.value; });
        setSettings(map);
        
        if (map.hero_slides) {
          try {
            setSlides(JSON.parse(map.hero_slides));
          } catch (e) {
            setSlides(defaultSlides);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings, hero_slides: JSON.stringify(slides) };
      const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: payload }) });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved successfully!');
      fetchSettings();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const set = (key: string, value: string) => setSettings({ ...settings, [key]: value });

  const updateSlideField = (index: number, field: string, value: any) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
    set("hero_slides", JSON.stringify(updated));
  };

  const addSlide = () => {
    const newSlide = {
      bg: "https://images.unsplash.com/photo-1556919114-f6e7ad7d3136?w=1200&h=600&fit=crop",
      productId: "smart-chopper-pro",
      tag: "⭐ New Product",
      headingLine1: "New Product Title,",
      headingAccent: "Premium Quality",
      urgency: "Limited stock available",
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    set("hero_slides", JSON.stringify(updated));
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error("You must keep at least 1 hero slide!");
      return;
    }
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    set("hero_slides", JSON.stringify(updated));
  };

  const tabs = [
    { id: "general" as const, label: "General", icon: Store },
    { id: "shipping" as const, label: "Shipping & Tax", icon: Truck },
    { id: "seo" as const, label: "SEO", icon: Settings },
    { id: "hero" as const, label: "Hero Slideshow", icon: Sliders },
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 shadow-soft"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
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

          {tab === "hero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-lg text-foreground">Hero Header Slideshow</h3>
                <button
                  onClick={addSlide}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4" /> Add Slide
                </button>
              </div>

              <div className="space-y-6">
                {slides.map((slide, idx) => (
                  <div key={idx} className="p-5 bg-background border border-border rounded-2xl relative space-y-4">
                    <button
                      onClick={() => deleteSlide(idx)}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <h4 className="font-medium text-foreground text-sm">Slide #{idx + 1}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Background Image URL (Cloudinary / Unsplash)</label>
                        <input
                          value={slide.bg}
                          onChange={(e) => updateSlideField(idx, "bg", e.target.value)}
                          placeholder="https://cloudinary.com/..."
                          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Linked Product Slug / ID</label>
                        <input
                          value={slide.productId}
                          onChange={(e) => updateSlideField(idx, "productId", e.target.value)}
                          placeholder="e.g. smart-chopper-pro"
                          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Tagline / Badge Text</label>
                        <input
                          value={slide.tag}
                          onChange={(e) => updateSlideField(idx, "tag", e.target.value)}
                          placeholder="e.g. ⭐ Best Seller"
                          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Heading Line 1</label>
                        <input
                          value={slide.headingLine1}
                          onChange={(e) => updateSlideField(idx, "headingLine1", e.target.value)}
                          placeholder="e.g. Chop, Mince,"
                          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Heading Accent / Color Text</label>
                        <input
                          value={slide.headingAccent}
                          onChange={(e) => updateSlideField(idx, "headingAccent", e.target.value)}
                          placeholder="e.g. Done in Seconds"
                          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Urgency / Subtitle Text</label>
                        <input
                          value={slide.urgency}
                          onChange={(e) => updateSlideField(idx, "urgency", e.target.value)}
                          placeholder="e.g. Only 12 left in stock"
                          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
