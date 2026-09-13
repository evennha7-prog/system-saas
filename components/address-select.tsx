"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import provincesData from "@/app/json-address/CambodiaProvinceList2025.json"
import districtsData from "@/app/json-address/CambodiaDistrictList2025.json"
import communesData from "@/app/json-address/CambodiaCommuneList2025.json"
import villagesData from "@/app/json-address/CambodiaVillagesList2025.json"

interface AddressItem {
  [key: string]: string
}

interface AddressSelectProps {
  prefix: "pob_" | "cur_"
  formData: Record<string, string>
  handleInputChange: (field: string, value: string) => void
  language: string
}

const provinces = provincesData as AddressItem[]
const districts = districtsData as AddressItem[]
const communes = communesData as AddressItem[]
const villages = villagesData as AddressItem[]

function getName(item: AddressItem, field: string, lang: string): string {
  if (lang === "km") {
    return item[`${field}_kh`] || item[`${field}_en`] || ""
  }
  return item[`${field}_en`] || item[`${field}_kh`] || ""
}

export function AddressSelect({ prefix, formData, handleInputChange, language }: AddressSelectProps) {
  const selectedProvince = formData[`${prefix}province`] || ""
  const selectedDistrict = formData[`${prefix}district`] || ""
  const selectedCommune = formData[`${prefix}commune`] || ""

  const filteredDistricts = React.useMemo(
    () => districts.filter((d) => d.province_code === selectedProvince),
    [selectedProvince]
  )

  const filteredCommunes = React.useMemo(
    () => communes.filter((c) => c.district_code === selectedDistrict),
    [selectedDistrict]
  )

  const filteredVillages = React.useMemo(
    () => villages.filter((v) => v.commune_code === selectedCommune),
    [selectedCommune]
  )

  return (
    <div className="grid grid-cols-2 gap-12 py-14">
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}province`}>
          {language === "en" ? "Province" : language === "km" ? "ខេត្ត" : "省"}
        </Label>
        <Select
          value={selectedProvince}
          onValueChange={(value) => {
            handleInputChange(`${prefix}province`, value)
            handleInputChange(`${prefix}district`, "")
            handleInputChange(`${prefix}commune`, "")
            handleInputChange(`${prefix}village`, "")
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={language === "en" ? "Select Province" : language === "km" ? "ជ្រើសខេត្ត" : "选择省"} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.province_code} value={p.province_code}>
                {getName(p, "province", language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}district`}>
          {language === "en" ? "District" : language === "km" ? "ស្រុក" : "区"}
        </Label>
        <Select
          value={selectedDistrict}
          onValueChange={(value) => {
            handleInputChange(`${prefix}district`, value)
            handleInputChange(`${prefix}commune`, "")
            handleInputChange(`${prefix}village`, "")
          }}
          disabled={!selectedProvince}
        >
          <SelectTrigger>
            <SelectValue placeholder={language === "en" ? "Select District" : language === "km" ? "ជ្រើសស្រុក" : "选择区"} />
          </SelectTrigger>
          <SelectContent>
            {filteredDistricts.map((d) => (
              <SelectItem key={d.district_code} value={d.district_code}>
                {getName(d, "district", language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}commune`}>
          {language === "en" ? "Commune" : language === "km" ? "ឃុំ" : "乡"}
        </Label>
        <Select
          value={selectedCommune}
          onValueChange={(value) => {
            handleInputChange(`${prefix}commune`, value)
            handleInputChange(`${prefix}village`, "")
          }}
          disabled={!selectedDistrict}
        >
          <SelectTrigger>
            <SelectValue placeholder={language === "en" ? "Select Commune" : language === "km" ? "ជ្រើសឃុំ" : "选择乡"} />
          </SelectTrigger>
          <SelectContent>
            {filteredCommunes.map((c) => (
              <SelectItem key={c.commune_code} value={c.commune_code}>
                {getName(c, "commune", language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}village`}>
          {language === "en" ? "Village" : language === "km" ? "ភូមិ" : "村"}
        </Label>
        <Select
          value={formData[`${prefix}village`] || ""}
          onValueChange={(value) => handleInputChange(`${prefix}village`, value)}
          disabled={!selectedCommune}
        >
          <SelectTrigger>
            <SelectValue placeholder={language === "en" ? "Select Village" : language === "km" ? "ជ្រើសភូមិ" : "选择村"} />
          </SelectTrigger>
          <SelectContent>
            {filteredVillages.map((v) => (
              <SelectItem key={v.village_code} value={v.village_code}>
                {getName(v, "village", language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
