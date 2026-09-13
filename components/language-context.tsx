"use client"

import * as React from "react"

type Language = "en" | "km" | "zh"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  translations: Record<string, string>
}

const translations: Record<Language, Record<string, string>> = {
  en: {},
  km: {},
  zh: {},
}

export const LanguageContext = React.createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  translations: {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>("en")

  React.useEffect(() => {
    const saved = localStorage.getItem("language")
    if (saved && ["en", "km", "zh"].includes(saved)) {
      setLanguage(saved as Language)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

export const getTranslation = (key: string, lang: string): string => {
  const langTranslations: Record<string, Record<string, string>> = {
    en: {
      "dashboard.title": "Dashboard",
      "dashboard.branch": "Branch",
      "dashboard.student": "Student",
      "dashboard.teacher": "Teacher",
      "dashboard.level": "Level",
      "dashboard.report": "Report",
      "dashboard.superAdmin": "Super Admin",
      "dashboard.schoolAdmin": "School Admin",
      "sidebar.customUI": "Custom UI",
      "table.addNew": "Add New",
      "table.actions": "Actions",
      "table.edit": "Edit",
      "table.delete": "Delete",
      "table.save": "Save",
      "table.cancel": "Cancel",
      "table.update": "Update",
      "table.search": "Search",
      "table.noResults": "No results",
      "form.save": "Save",
      "form.cancel": "Cancel",
      "form.update": "Update",
      "form.status": "Status",
      "form.branch": "Branch",
      "form.level": "Level",
      "form.gender": "Gender",
      "form.dob": "Date of Birth",
      "form.nationality": "Nationality",
      "form.selectNationality": "Select Nationality",
      "form.religion": "Religion",
      "form.selectReligion": "Select Religion",
      "form.pob": "Place of Birth",
      "form.current": "Current Address",
      "form.province": "Province",
      "form.district": "District",
      "form.commune": "Commune",
      "form.village": "Village",
      "form.joinSchool": "Join School",
      "form.leftSchool": "Left School",
      "form.selectBranch": "Select Branch",
      "form.selectLevel": "Select Level",
      "form.selectGender": "Select Gender",
      "form.selectStatus": "Select Status",
      "form.studentCode": "Student Code",
      "form.teacherCode": "Teacher Code",
      "form.englishName": "English Name",
      "form.khmerName": "Khmer Name",
      "form.chineseName": "Chinese Name",
      "form.tenantId": "Tenant ID",
      "form.subject": "Subject",
      "form.address": "Address",
      "tab.informations": "Informations",
      "tab.pob": "PoB Address",
      "tab.current": "Current Address",
      "tab.status": "Status",
      "gender.male": "Male",
      "gender.female": "Female",
      "status.active": "Active",
      "status.inactive": "Inactive",
    },
    km: {
      "dashboard.title": "ផ្ទាំងគ្រប់គ្រង",
      "dashboard.branch": "សាខា",
      "dashboard.student": "សិស្ស",
      "dashboard.teacher": "គ្រូ",
      "dashboard.level": "កម្រិត",
      "dashboard.report": "របាយការណ៍",
      "dashboard.superAdmin": "អ្នកគ្រប់គ្រងកំពូល",
      "dashboard.schoolAdmin": "អ្នកគ្រប់គ្រងសាលា",
      "sidebar.customUI": "Custom UI",
      "table.addNew": "បន្ថែម",
      "table.actions": "សកម្មភាព",
      "table.edit": "កែប្រែ",
      "table.delete": "លុប",
      "form.save": "រក្សាទុក",
      "form.cancel": "បោះបង់",
      "form.update": "ធ្វើបច្ចុប្បន្ន",
      "form.status": "ស្ថានភាព",
      "form.branch": "សាខា",
      "form.level": "កម្រិត",
      "form.gender": "ភេទ",
      "form.dob": "ថ្ងៃខែឆ្នាំកំណើត",
      "form.nationality": "សញ្ជាតិ",
      "form.selectNationality": "ជ្រើសសញ្ជាតិ",
      "form.religion": "សាសនា",
      "form.selectReligion": "ជ្រើសសាសនា",
      "form.pob": "ទីកន្លែងកំណើត",
      "form.current": "អាសយដ្ឋានបច្ចុប្បន្ន",
      "form.province": "ខេត្ត",
      "form.district": "ស្រុក",
      "form.commune": "ឃុំ",
      "form.village": "ភូមិ",
      "form.joinSchool": "ចូលរៀន",
      "form.leftSchool": "ចេញពីសាលា",
      "form.selectBranch": "ជ្រើសសាខា",
      "form.selectLevel": "ជ្រើសកម្រិត",
      "form.selectGender": "ជ្រើសភេទ",
      "form.selectStatus": "ជ្រើសស្ថានភាព",
      "form.studentCode": "កូដសិស្ស",
      "form.teacherCode": "កូដគ្រូ",
      "form.englishName": "ឈ្មោះអង់គ្លេស",
      "form.khmerName": "ឈ្មោះខ្មែរ",
      "form.chineseName": "ឈ្មោះចិន",
      "form.tenantId": "លេខ Tenant",
      "form.subject": "មុខវិជ្ជា",
      "form.address": "អាសយដ្ឋាន",
      "tab.informations": "ព័ត៌មាន",
      "tab.pob": "ទីកន្លែងកំណើត",
      "tab.current": "អាសយដ្ឋាន",
      "tab.status": "ស្ថានភាព",
      "gender.male": "ប្រុស",
      "gender.female": "ស្រី",
      "status.active": "សកម្ម",
      "status.inactive": "មិនសកម្ម",
    },
    zh: {
      "dashboard.title": "仪表板",
      "dashboard.branch": "分校",
      "dashboard.student": "学生",
      "dashboard.teacher": "老师",
      "dashboard.level": "级别",
      "dashboard.report": "报告",
      "dashboard.superAdmin": "超级管理员",
      "dashboard.schoolAdmin": "学校管理员",
      "sidebar.customUI": "Custom UI",
      "table.addNew": "新增",
      "table.actions": "操作",
      "table.edit": "编辑",
      "table.delete": "删除",
      "form.save": "保存",
      "form.cancel": "取消",
      "form.update": "更新",
      "form.status": "状态",
      "form.branch": "分校",
      "form.level": "级别",
      "form.gender": "性别",
      "form.dob": "出生日期",
      "form.nationality": "国籍",
      "form.selectNationality": "选择国籍",
      "form.religion": "宗教",
      "form.selectReligion": "选择宗教",
      "form.pob": "出生地",
      "form.current": "当前地址",
      "form.province": "省",
      "form.district": "区",
      "form.commune": "乡",
      "form.village": "村",
      "form.joinSchool": "入学日期",
      "form.leftSchool": "离校日期",
      "form.selectBranch": "选择分校",
      "form.selectLevel": "选择级别",
      "form.selectGender": "选择性别",
      "form.selectStatus": "选择状态",
      "form.studentCode": "学生代码",
      "form.teacherCode": "老师代码",
      "form.englishName": "英文名",
      "form.khmerName": "柬文名",
      "form.chineseName": "中文名",
      "form.tenantId": "租户ID",
      "form.subject": "科目",
      "form.address": "地址",
      "tab.informations": "信息",
      "tab.pob": "出生地",
      "tab.current": "当前地址",
      "tab.status": "状态",
      "gender.male": "男",
      "gender.female": "女",
      "status.active": "激活",
      "status.inactive": "未激活",
    },
  }

  return langTranslations[lang]?.[key] || key
}
