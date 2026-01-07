// file: components/districts/KarakalpakstanDistricts.tsx
"use client";

import React, { useState } from "react";

// Districts of Karakalpakstan Republic - matching real map
export const KARAKALPAKSTAN_DISTRICTS = [
  { id: "kungrad", name: "Qo'ng'irot", nameRu: "Кунград", center: "Kungrad" },
  { id: "moynaq", name: "Mo'ynoq", nameRu: "Муйнак", center: "Mo'ynoq" },
  { id: "taxtakupir", name: "Taxtako'pir", nameRu: "Тахтакупыр", center: "Taxtako'pir" },
  { id: "bozatau", name: "Bo'zatov", nameRu: "Бозатау", center: "Bo'zatov" },
  { id: "chimboy", name: "Chimboy", nameRu: "Чимбай", center: "Chimboy" },
  { id: "kegeyli", name: "Kegeyli", nameRu: "Кегейли", center: "Kegeyli" },
  { id: "nukus", name: "Nukus", nameRu: "Нукус", center: "Nukus" },
  { id: "qaraozak", name: "Qara o'zak", nameRu: "Караузяк", center: "Qara o'zak" },
  { id: "kanlikol", name: "Qanliko'l", nameRu: "Канлыкуль", center: "Qanliko'l" },
  { id: "shumanay", name: "Shumanay", nameRu: "Шуманай", center: "Shumanay" },
  { id: "xojayli", name: "Xo'jayli", nameRu: "Ходжейли", center: "Xo'jayli" },
  { id: "takhiatash", name: "Taxiatosh", nameRu: "Тахиаташ", center: "Taxiatosh" },
  { id: "amudaryo", name: "Amudaryo", nameRu: "Амударья", center: "Mang'it" },
  { id: "beruniy", name: "Beruniy", nameRu: "Беруни", center: "Beruniy" },
  { id: "ellikkala", name: "Ellikkala", nameRu: "Элликкала", center: "Buston" },
  { id: "turtkul", name: "To'rtko'l", nameRu: "Турткуль", center: "To'rtko'l" },
];

// Accurate SVG paths based on real Karakalpakstan map
// The region has an inverted triangle shape with Aral Sea in north
const DISTRICT_PATHS: Record<string, string> = {
  // Kungrad - Very large northwestern district (olive green)
  // Forms the western "wedge" of Karakalpakstan
  kungrad: "M 30,320 L 50,240 L 80,160 L 120,100 L 180,60 L 250,40 L 300,50 L 320,80 L 300,120 L 260,160 L 240,220 L 260,280 L 280,320 L 260,360 L 220,380 L 180,360 L 140,340 L 100,340 L 60,340 Z",

  // Muynak - Northern district near Aral Sea (tan/brown)
  moynaq: "M 250,40 L 320,30 L 400,50 L 460,100 L 480,160 L 460,200 L 400,220 L 340,200 L 300,160 L 300,120 L 320,80 L 300,50 Z",

  // Takhtakupir - Large northeastern district (gray)
  taxtakupir: "M 460,100 L 540,80 L 620,120 L 660,200 L 640,300 L 580,360 L 520,340 L 480,300 L 460,240 L 460,200 L 480,160 Z",

  // Bozatau - Small district between Muynak and Chimboy (yellow)
  bozatau: "M 340,200 L 400,220 L 420,260 L 400,300 L 360,300 L 340,260 Z",

  // Chimboy - Central district (teal/cyan)
  chimboy: "M 360,300 L 400,300 L 440,320 L 480,360 L 460,420 L 420,440 L 380,420 L 360,380 L 340,340 Z",

  // Kegeyli - West-central district (green)
  kegeyli: "M 260,280 L 300,260 L 340,260 L 360,300 L 340,340 L 320,380 L 280,400 L 240,380 L 240,340 L 260,320 Z",

  // Nukus - Capital city, small district (red)
  nukus: "M 320,380 L 360,380 L 380,420 L 360,460 L 320,460 L 300,420 Z",

  // Karauzyak - East of Chimboy (tan/orange)
  qaraozak: "M 420,440 L 480,420 L 520,460 L 540,520 L 500,560 L 440,540 L 420,500 L 400,460 Z",

  // Kanlikkul - Small western district (gray)
  kanlikol: "M 180,360 L 220,380 L 240,420 L 220,460 L 180,460 L 160,420 L 160,380 Z",

  // Shumanay - Southwestern district (olive)
  shumanay: "M 100,340 L 140,340 L 180,360 L 160,420 L 140,480 L 100,500 L 60,480 L 50,420 L 60,360 Z",

  // Hojeili - South of Nukus (purple/magenta)
  xojayli: "M 280,400 L 320,380 L 360,420 L 380,480 L 360,520 L 320,540 L 280,520 L 260,480 L 260,440 Z",

  // Takhiatash - Small city district near Hojeili (light purple)
  takhiatash: "M 240,420 L 280,400 L 280,460 L 260,500 L 220,500 L 200,460 Z",

  // Amudarya - Southern district along river (brown)
  amudaryo: "M 200,460 L 260,480 L 280,520 L 260,580 L 220,620 L 160,600 L 120,560 L 140,500 L 160,460 Z",

  // Beruni - Large southeastern district (tan/olive)
  beruniy: "M 360,520 L 440,540 L 500,580 L 540,640 L 520,720 L 460,760 L 400,740 L 360,680 L 340,620 L 340,560 Z",

  // Ellikkala - Far eastern elongated district (pink/salmon)
  ellikkala: "M 540,520 L 600,480 L 660,520 L 700,600 L 680,700 L 640,780 L 560,800 L 500,760 L 520,680 L 540,640 L 500,580 Z",

  // Turtkul - Southern district (green)
  turtkul: "M 340,620 L 400,640 L 460,720 L 440,800 L 360,840 L 280,800 L 260,740 L 280,680 L 320,640 Z",
};

// Clean color scheme - blue for active, light gray for default
const MAP_COLORS = {
  default: "#F3F4F6",        // Light gray - default state
  hover: "#93C5FD",          // Light blue hover
  selected: "#3B82F6",       // Blue - selected
  stroke: "#D1D5DB",         // Gray border
  selectedStroke: "#1E40AF", // Dark blue border selected
};

// Label positions adjusted for accurate paths
const DISTRICT_LABELS: Record<string, { x: number; y: number; fontSize?: number }> = {
  kungrad: { x: 180, y: 220, fontSize: 14 },
  moynaq: { x: 380, y: 130, fontSize: 12 },
  taxtakupir: { x: 560, y: 220, fontSize: 11 },
  bozatau: { x: 370, y: 260, fontSize: 9 },
  chimboy: { x: 400, y: 370, fontSize: 10 },
  kegeyli: { x: 290, y: 330, fontSize: 10 },
  nukus: { x: 340, y: 420, fontSize: 9 },
  qaraozak: { x: 470, y: 490, fontSize: 9 },
  kanlikol: { x: 190, y: 420, fontSize: 8 },
  shumanay: { x: 100, y: 420, fontSize: 9 },
  xojayli: { x: 310, y: 480, fontSize: 9 },
  takhiatash: { x: 240, y: 460, fontSize: 8 },
  amudaryo: { x: 200, y: 540, fontSize: 9 },
  beruniy: { x: 440, y: 640, fontSize: 12 },
  ellikkala: { x: 600, y: 640, fontSize: 10 },
  turtkul: { x: 360, y: 740, fontSize: 10 },
};

interface KarakalpakstanDistrictsProps {
  selectedDistrict: string | null;
  onDistrictClick: (districtId: string) => void;
  onBack: () => void;
}

export default function KarakalpakstanDistricts({
  selectedDistrict,
  onDistrictClick,
  onBack,
}: KarakalpakstanDistrictsProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const getDistrictFill = (districtId: string) => {
    if (selectedDistrict === districtId) return MAP_COLORS.selected;
    if (hoveredDistrict === districtId) return MAP_COLORS.hover;
    return MAP_COLORS.default;
  };

  const getDistrictStroke = (districtId: string) => {
    if (selectedDistrict === districtId) return MAP_COLORS.selectedStroke;
    return MAP_COLORS.stroke;
  };

  return (
    <div className="relative w-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-2 left-2 z-10 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Назад к областям</span>
      </button>

      {/* Title */}
      <div className="text-center mb-4 pt-2">
        <h3 className="text-lg font-semibold text-gray-800">Республика Каракалпакстан</h3>
        <p className="text-sm text-gray-500">Районы</p>
      </div>

      <svg
        viewBox="0 0 740 880"
        className="w-full h-auto"
        style={{ maxHeight: "520px" }}
      >
        {/* Aral Sea (blue water area in north) */}
        <path
          d="M 320,30 L 400,50 L 460,100 L 480,160 L 460,200 L 400,220 L 340,200 L 300,160 L 300,120 L 320,80 L 320,30 Z"
          fill="#64B5F6"
          opacity="0.5"
          className="pointer-events-none"
        />
        <text x="380" y="140" textAnchor="middle" fontSize="11" fill="#1565C0" fontWeight="500">
          Арал теңизи
        </text>

        {/* Districts - render in order for proper layering */}
        {KARAKALPAKSTAN_DISTRICTS.map((district) => (
          <g key={district.id}>
            <path
              d={DISTRICT_PATHS[district.id]}
              fill={getDistrictFill(district.id)}
              stroke={getDistrictStroke(district.id)}
              strokeWidth={selectedDistrict === district.id ? 2.5 : 1.5}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredDistrict(district.id)}
              onMouseLeave={() => setHoveredDistrict(null)}
              onClick={() => onDistrictClick(district.id)}
            />
            {/* District label */}
            <text
              x={DISTRICT_LABELS[district.id]?.x || 0}
              y={DISTRICT_LABELS[district.id]?.y || 0}
              textAnchor="middle"
              className="pointer-events-none select-none"
              style={{
                fontSize: `${DISTRICT_LABELS[district.id]?.fontSize || 10}px`,
                fontWeight: selectedDistrict === district.id ? 700 : 600,
                fill: selectedDistrict === district.id ? "#FFFFFF" : "#1F2937",
                textShadow: "1px 1px 2px rgba(255,255,255,0.9)",
              }}
            >
              {district.nameRu}
            </text>
          </g>
        ))}

        {/* Border labels */}
        <text x="580" y="60" fontSize="13" fill="#6B7280" fontStyle="italic" fontWeight="500">
          Қазақстан
        </text>
        <text x="80" y="540" fontSize="13" fill="#6B7280" fontStyle="italic" fontWeight="500">
          Туркменистан
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-2">Нажмите на район для выбора</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm border border-gray-300"
              style={{ backgroundColor: MAP_COLORS.selected }}
            />
            <span className="text-xs text-gray-600">Выбранный</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm border border-gray-300"
              style={{ backgroundColor: MAP_COLORS.default }}
            />
            <span className="text-xs text-gray-600">Не выбранный</span>
          </div>
        </div>
      </div>
    </div>
  );
}
