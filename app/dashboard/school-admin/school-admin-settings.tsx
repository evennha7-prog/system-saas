"use client";

import * as React from "react";
import { translations } from "@/lib/translations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import {
  getSchools,
  createSchool,
  updateSchoolProfile,
  type SchoolPayload,
} from "@/lib/api";
import { toast } from "sonner";

const t = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key;
};

const colorToOKLCH: Record<string, string> = {
  "#3b82f6": "oklch(0.527 0.154 150.069)",
  "#10b981": "oklch(0.545 0.179 162.275)",
  "#f59e0b": "oklch(0.75 0.150 45.605)",
  "#ef4444": "oklch(0.577 0.245 27.325)",
  "#8b5cf6": "oklch(0.608 0.249 291.276)",
  "#0d5ea6": "oklch(0.55 0.18 210)",
  "#ea4dc7": "oklch(0.65 0.22 320)",
  "#64dc78": "oklch(0.65 0.18 150)",
  "#a3ba16": "oklch(0.65 0.18 80)",
  "#d28": "oklch(0.55 0.18 340)",
};

export function SchoolAdminSettings() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasSchool, setHasSchool] = React.useState(false);
  const [formData, setFormData] = React.useState({
    tenant_id: "",
    khname: "",
    enname: "",
    zhname: "",
    short_school: "",
    student_code_prefix: "",
    student_code_suffix: "",
    student_code_digit: "",
  });

  const emptyForm = {
    tenant_id: "",
    khname: "",
    enname: "",
    zhname: "",
    short_school: "",
    student_code_prefix: "",
    student_code_suffix: "",
    student_code_digit: "",
  };

  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    }
    return "light";
  });
  const [primaryColor, setPrimaryColor] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("primaryColor");
      if (saved) {
        return saved;
      }
    }
    return "#3b82f6";
  });
  const [fontSize, setFontSize] = React.useState("medium");

  React.useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor");
    if (savedColor) {
      const oklchColor = colorToOKLCH[savedColor] || savedColor;
      document.documentElement.style.setProperty("--primary", oklchColor);
      document.documentElement.style.setProperty("--accent", oklchColor);
      document.documentElement.style.setProperty("--ring", oklchColor);
    }
  }, []);

  const fetchSchool = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token") ?? undefined;
      if (!token) return;
      const response = await getSchools(token);
      if (response?.data?.length) {
        const s = response.data[0];
        setFormData({
          tenant_id: s.tenant_id ?? "",
          khname: s.khname ?? "",
          enname: s.enname ?? "",
          zhname: s.zhname ?? "",
          short_school: s.short_school ?? "",
          student_code_prefix: s.student_code_prefix ?? "",
          student_code_suffix: s.student_code_suffix ?? "",
          student_code_digit: String(s.student_code_digit ?? ""),
        });
        setHasSchool(true);
      } else {
        setHasSchool(false);
        setFormData(emptyForm);
      }
    } catch {
      setHasSchool(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSchool();
  }, [fetchSchool]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSchool = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token") ?? undefined;
      if (!token) throw new Error("Not authenticated");
      const payload: SchoolPayload = {
        khname: formData.khname || undefined,
        enname: formData.enname || undefined,
        zhname: formData.zhname || undefined,
        short_school: formData.short_school || undefined,
        student_code_prefix: formData.student_code_prefix || undefined,
        student_code_suffix: formData.student_code_suffix || undefined,
        student_code_digit: formData.student_code_digit ? Number(formData.student_code_digit) : undefined,
      };
      await createSchool(token, payload);
      toast.success("School created successfully");
      await fetchSchool();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create school");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSchool = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token") ?? undefined;
      if (!token) throw new Error("Not authenticated");
      const payload: Partial<SchoolPayload> = {
        khname: formData.khname || undefined,
        enname: formData.enname || undefined,
        zhname: formData.zhname || undefined,
        short_school: formData.short_school || undefined,
        student_code_prefix: formData.student_code_prefix || undefined,
        student_code_suffix: formData.student_code_suffix || undefined,
        student_code_digit: formData.student_code_digit ? Number(formData.student_code_digit) : undefined,
      };
      await updateSchoolProfile(token, payload);
      toast.success("School information updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update school");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    const oklchColor = colorToOKLCH[color] || color;
    document.documentElement.style.setProperty("--primary", oklchColor);
    document.documentElement.style.setProperty("--accent", oklchColor);
    document.documentElement.style.setProperty("--ring", oklchColor);
    localStorage.setItem("primaryColor", color);
  };

  const handleLanguageChange = (lang: string) => {
    localStorage.setItem("language", lang);
    window.dispatchEvent(new Event("languagechange"));
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div>
        <h2 className="text-2xl font-bold">
          {t("sidebar.settings", language)}
        </h2>
        <p className="text-muted-foreground">
          Manage your school settings and preferences
        </p>
      </div>

      <div className="grid gap-4">


        <Card>
          <CardHeader>
            <CardTitle>{hasSchool ? "School Information" : "Create School"}</CardTitle>
            <CardDescription>
              {hasSchool ? "Update your school details" : "Set up your school information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading school information...</p>
            ) : (
              <>
                {hasSchool ? (
                  <div className="grid gap-2">
                    <Label htmlFor="tenant_id">Tenant ID (Logical ID)</Label>
                    <Input id="tenant_id" value={formData.tenant_id} disabled />
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <Label htmlFor="enname">School Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="enname"
                    placeholder="Enter English name"
                    value={formData.enname}
                    onChange={(e) => handleChange("enname", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="khname">Khmer Name</Label>
                  <Input
                    id="khname"
                    placeholder="Enter Khmer name"
                    value={formData.khname}
                    onChange={(e) => handleChange("khname", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zhname">Chinese Name</Label>
                  <Input
                    id="zhname"
                    placeholder="Enter Chinese name"
                    value={formData.zhname}
                    onChange={(e) => handleChange("zhname", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="short_school">Short Name</Label>
                  <Input
                    id="short_school"
                    placeholder="e.g. NK ONE"
                    value={formData.short_school}
                    onChange={(e) => handleChange("short_school", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="student_code_prefix">Code Prefix</Label>
                    <Input
                      id="student_code_prefix"
                      placeholder="e.g. STU-"
                      value={formData.student_code_prefix}
                      onChange={(e) => handleChange("student_code_prefix", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="student_code_suffix">Code Suffix</Label>
                    <Input
                      id="student_code_suffix"
                      placeholder="e.g. -CS"
                      value={formData.student_code_suffix}
                      onChange={(e) => handleChange("student_code_suffix", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="student_code_digit">Code Digits</Label>
                    <Input
                      id="student_code_digit"
                      type="number"
                      min={0}
                      placeholder="e.g. 4"
                      value={formData.student_code_digit}
                      onChange={(e) => handleChange("student_code_digit", e.target.value)}
                    />
                  </div>
                </div>
                {hasSchool ? (
                  <Button onClick={handleSaveSchool} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                ) : (
                  <Button onClick={handleCreateSchool} disabled={isSaving}>
                    {isSaving ? "Creating..." : "Create School"}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Setup</CardTitle>
            <CardDescription>Customize color and font</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Preset Colors</Label>
              <div className="grid grid-cols-5 gap-2">
                <Button
                  variant={primaryColor === "#3b82f6" ? "default" : "outline"}
                  className="h-10 bg-blue-500 border-2"
                  onClick={() => handleColorChange("#3b82f6")}
                />
                <Button
                  variant={primaryColor === "#10b981" ? "default" : "outline"}
                  className="h-10 bg-green-500 border-2"
                  onClick={() => handleColorChange("#10b981")}
                />
                <Button
                  variant={primaryColor === "#f59e0b" ? "default" : "outline"}
                  className="h-10 bg-yellow-500 border-2"
                  onClick={() => handleColorChange("#f59e0b")}
                />
                <Button
                  variant={primaryColor === "#ef4444" ? "default" : "outline"}
                  className="h-10 bg-red-500 border-2"
                  onClick={() => handleColorChange("#ef4444")}
                />
                <Button
                  variant={primaryColor === "#8b5cf6" ? "default" : "outline"}
                  className="h-10 bg-purple-500 border-2"
                  onClick={() => handleColorChange("#8b5cf6")}
                />
                <Button
                  variant={primaryColor === "#0d5ea6" ? "default" : "outline"}
                  className="h-10 bg-[#0d5ea6] border-2"
                  onClick={() => handleColorChange("#0d5ea6")}
                />
                <Button
                  variant={primaryColor === "#ea4dc7" ? "default" : "outline"}
                  className="h-10 bg-[#ea4dc7] border-2"
                  onClick={() => handleColorChange("#ea4dc7")}
                />
                <Button
                  variant={primaryColor === "#64dc78" ? "default" : "outline"}
                  className="h-10 bg-[#64dc78] border-2"
                  onClick={() => handleColorChange("#64dc78")}
                />
                <Button
                  variant={primaryColor === "#a3ba16" ? "default" : "outline"}
                  className="h-10 bg-[#a3ba16] border-2"
                  onClick={() => handleColorChange("#a3ba16")}
                />
                <Button
                  variant={primaryColor === "#d28" ? "default" : "outline"}
                  className="h-10 bg-[#d28] border-2"
                  onClick={() => handleColorChange("#d28")}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Custom Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="h-10 w-20 p-1 cursor-pointer"
                  value={primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                />
                <Input
                  placeholder="#000000"
                  value={primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Font Size</Label>
              <div className="flex gap-2">
                <Button
                  variant={fontSize === "small" ? "default" : "outline"}
                  onClick={() => setFontSize("small")}
                >
                  Small
                </Button>
                <Button
                  variant={fontSize === "medium" ? "default" : "outline"}
                  onClick={() => setFontSize("medium")}
                >
                  Medium
                </Button>
                <Button
                  variant={fontSize === "large" ? "default" : "outline"}
                  onClick={() => setFontSize("large")}
                >
                  Large
                </Button>
              </div>
            </div>
            <Button>Save Theme</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
