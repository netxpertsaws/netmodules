/**
 * Canonical list of the 13 Vadamarachchi secondary schools in display order.
 * Stable ids are seeded into PostgreSQL so the public form can render
 * without a database round-trip and still match the rows on submit.
 */
export type SchoolRecord = {
  id: string;
  slug: string;
  nameEn: string;
  nameTa: string;
  placeEn: string;
  placeTa: string;
  sortOrder: number;
};

export const SCHOOLS: SchoolRecord[] = [
  {
    id: "school_hartley",
    slug: "hartley-college",
    nameEn: "Hartley College",
    nameTa: "ஹாட்லி கல்லூரி",
    placeEn: "Point Pedro",
    placeTa: "பருத்தித்துறை",
    sortOrder: 1,
  },
  {
    id: "school_mghs",
    slug: "methodist-girls-high-school",
    nameEn: "Methodist Girls' High School",
    nameTa: "மெதடிஸ்ட் பெண்கள் உயர்தரப் பாடசாலை",
    placeEn: "Point Pedro",
    placeTa: "பருத்தித்துறை",
    sortOrder: 2,
  },
  {
    id: "school_vhgc",
    slug: "vadamaradchy-hindu-girls-college",
    nameEn: "Vadamaradchy Hindu Girls' College",
    nameTa: "வடமராட்சி இந்து மகளிர் கல்லூரி",
    placeEn: "Point Pedro",
    placeTa: "பருத்தித்துறை",
    sortOrder: 3,
  },
  {
    id: "school_velautham",
    slug: "velautham-maha-vidyalayam",
    nameEn: "Velautham Maha Vidyalayam",
    nameTa: "வேலாயுதம் மகா வித்தியாலயம்",
    placeEn: "Point Pedro",
    placeTa: "பருத்தித்துறை",
    sortOrder: 4,
  },
  {
    id: "school_uduppiddy_am",
    slug: "uduppiddy-american-mission-college",
    nameEn: "Udupiddy American Mission College",
    nameTa: "உடுப்பிட்டி அமெரிக்கன் மிஷன் கல்லூரி",
    placeEn: "Udupiddy",
    placeTa: "உடுப்பிட்டி",
    sortOrder: 5,
  },
  {
    id: "school_uduppiddy_girls",
    slug: "uduppiddy-girls-college",
    nameEn: "Udupiddy Girls' College",
    nameTa: "உடுப்பிட்டி மகளிர் கல்லூரி",
    placeEn: "Udupiddy",
    placeTa: "உடுப்பிட்டி",
    sortOrder: 6,
  },
  {
    id: "school_nelliady",
    slug: "nelliady-mmv",
    nameEn: "Nelliady Madhya Maha Vidyalayam",
    nameTa: "நெல்லியடி மத்திய மகா வித்தியாலயம்",
    placeEn: "Nelliady",
    placeTa: "நெல்லியடி",
    sortOrder: 7,
  },
  {
    id: "school_vclc",
    slug: "vadamaradchy-central-ladies-college",
    nameEn: "Vadamaradchy Central Ladies' College",
    nameTa: "வடமராட்சி மத்திய மகளிர் கல்லூரி",
    placeEn: "Karaveddy",
    placeTa: "கரவெட்டி",
    sortOrder: 8,
  },
  {
    id: "school_vathiry",
    slug: "vathiry-sacred-heart-college",
    nameEn: "Vathiry Sacred Heart College",
    nameTa: "வாதிரி புனித இதயக் கல்லூரி",
    placeEn: "Vathiry",
    placeTa: "வாதிரி",
    sortOrder: 9,
  },
  {
    id: "school_gnanasariyar",
    slug: "gnanasariyar-college",
    nameEn: "Gnanasariyar College",
    nameTa: "ஞானசரியார் கல்லூரி",
    placeEn: "Thunnalai",
    placeTa: "துன்னாலை",
    sortOrder: 10,
  },
  {
    id: "school_thevarayali",
    slug: "thevarayali-hindu-college",
    nameEn: "Thevarayali Hindu College",
    nameTa: "தேவராயலி இந்து கல்லூரி",
    placeEn: "Nelliady",
    placeTa: "நெல்லியடி",
    sortOrder: 11,
  },
  {
    id: "school_vikneswara",
    slug: "vikneswara-college",
    nameEn: "Vikneswara College",
    nameTa: "விக்னேஸ்வரா கல்லூரி",
    placeEn: "Karaveddy",
    placeTa: "கரவெட்டி",
    sortOrder: 12,
  },
  {
    id: "school_thondaimanaru",
    slug: "thondaimanaru-veerakaththipillai-mv",
    nameEn: "Thondaimanaru Veerakaththipillai Maha Vidyalayam",
    nameTa: "தொண்டைமானாறு வீரகத்திப்பிள்ளை மகா வித்தியாலயம்",
    placeEn: "Thondaimanaru",
    placeTa: "தொண்டைமானாறு",
    sortOrder: 13,
  },
];

export const SCHOOL_IDS = new Set(SCHOOLS.map((school) => school.id));

export function schoolById(id: string | null | undefined) {
  return SCHOOLS.find((school) => school.id === id) ?? null;
}
