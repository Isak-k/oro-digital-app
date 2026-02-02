import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'om' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (translations: Record<Language, string>) => string;
  tk: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Common translations
export const translations = {
  dashboard: { en: 'Dashboard', om: 'Dhashiboordii', am: 'ዳሽቦርድ' },
  students: { en: 'Students', om: 'Barattootaa', am: 'ተማሪዎች' },
  courses: { en: 'Courses', om: 'Koorsiiwwan', am: 'ኮርሶች' },
  registrations: { en: 'Registrations', om: 'Galmeewwan', am: 'ምዝገባዎች' },
  payments: { en: 'Payments', om: 'Kaffaltii', am: 'ክፍያዎች' },
  announcements: { en: 'Announcements', om: 'Beeksisa', am: 'ማስታወቂያዎች' },
  news: { en: 'News', om: 'Oduu', am: 'ዜና' },
  gallery: { en: 'Gallery', om: 'Gaalerii', am: 'ጋለሪ' },
  notifications: { en: 'Notifications', om: 'Beeksisa', am: 'ማሳወቂያዎች' },
  settings: { en: 'Settings', om: 'Qindaa\'ina', am: 'ቅንብሮች' },
  requests: { en: 'Requests', om: 'Gaaffiiwwan', am: 'ጥያቄዎች' },
  add: { en: 'Add', om: 'Dabali', am: 'ጨምር' },
  edit: { en: 'Edit', om: 'Gulaali', am: 'አርትዕ' },
  delete: { en: 'Delete', om: 'Haqi', am: 'ሰርዝ' },
  save: { en: 'Save', om: 'Kuusi', am: 'አስቀምጥ' },
  cancel: { en: 'Cancel', om: 'Dhiisi', am: 'ሰርዝ' },
  close: { en: 'Close', om: 'Cufi', am: 'ዝጋ' },
  search: { en: 'Search', om: 'Barbaadi', am: 'ፈልግ' },
  filter: { en: 'Filter', om: 'Filtera', am: 'አጣራ' },
  status: { en: 'Status', om: 'Haala', am: 'ሁኔታ' },
  active: { en: 'Active', om: 'Hojii irra', am: 'ንቁ' },
  inactive: { en: 'Inactive', om: 'Hojii irra hin jiru', am: 'ንቁ አይደለም' },
  paid: { en: 'Paid', om: 'Kaffalame', am: 'የተከፈለ' },
  unpaid: { en: 'Unpaid', om: 'Hin kaffalamne', am: 'ያልተከፈለ' },
  month: { en: 'Month', om: 'Ji\'a', am: 'ወር' },
  year: { en: 'Year', om: 'Waggaa', am: 'ዓመት' },
  amount: { en: 'Amount', om: 'Hamma', am: 'መጠን' },
  total: { en: 'Total', om: 'Waliigala', am: 'ጠቅላላ' },
  print: { en: 'Print', om: 'Maxxansi', am: 'አትም' },
  printList: { en: 'Print List', om: 'Tarree Maxxansi', am: 'ዝርዝር አትም' },
  receipt: { en: 'Receipt', om: 'Rasitii', am: 'ደረሰኝ' },
  report: { en: 'Report', om: 'Gabaasa', am: 'ሪፖርት' },
  noData: { en: 'No data available', om: 'Daataan hin argamne', am: 'ምንም መረጃ የለም' },
  loading: { en: 'Loading...', om: 'Fe\'aa...', am: 'በመጫን ላይ...' },
  fullName: { en: 'Full Name', om: 'Maqaa Guutuu', am: 'ሙሉ ስም' },
  phone: { en: 'Phone', om: 'Bilbila', am: 'ስልክ' },
  course: { en: 'Course', om: 'Koorsii', am: 'ኮርስ' },
  student: { en: 'Student', om: 'Barataa', am: 'ተማሪ' },
  paymentMethod: { en: 'Payment Method', om: 'Haala Kaffaltii', am: 'የክፍያ ዘዴ' },
  actions: { en: 'Actions', om: 'Gocha', am: 'ድርጊቶች' },
  confirm: { en: 'Confirm', om: 'Mirkaneessi', am: 'አረጋግጥ' },
  selectStudent: { en: 'Select Student', om: 'Barataa Filadhu', am: 'ተማሪ ምረጥ' },
  selectCourse: { en: 'Select Course', om: 'Koorsii Filadhu', am: 'ኮርስ ምረጥ' },
  selectMonth: { en: 'Select Month', om: 'Ji\'a Filadhu', am: 'ወር ምረጥ' },
  selectYear: { en: 'Select Year', om: 'Waggaa Filadhu', am: 'ዓመት ምረጥ' },
  paymentStatus: { en: 'Payment Status', om: 'Haala Kaffaltii', am: 'የክፍያ ሁኔታ' },
  registerStudent: { en: 'Register Student', om: 'Barataa Galmeessi', am: 'ተማሪ ምዝገባ' },
  addPayment: { en: 'Add Payment', om: 'Kaffaltii Dabali', am: 'ክፍያ ጨምር' },
  viewReceipt: { en: 'View Receipt', om: 'Rasitii Ilaali', am: 'ደረሰኝ ይመልከቱ' },
  monthlyReport: { en: 'Monthly Report', om: 'Gabaasa Ji\'aa', am: 'ወርሃዊ ሪፖርት' },
  yearlyReport: { en: 'Yearly Report', om: 'Gabaasa Waggaa', am: 'ዓመታዊ ሪፖርት' },
  // News translations
  newsTitle: { en: 'Title', om: 'Mata Duree', am: 'ርዕስ' },
  newsContent: { en: 'Content', om: 'Qabiyyee', am: 'ይዘት' },
  newsDescription: { en: 'Publish news and updates', om: 'Oduu fi haaromsa maxxansi', am: 'ዜና እና ዝማኔዎችን አውጣ' },
  publishNews: { en: 'Publish News', om: 'Oduu Maxxansi', am: 'ዜና አውጣ' },
  publish: { en: 'Publish', om: 'Maxxansi', am: 'አውጣ' },
  deleteNews: { en: 'Delete News', om: 'Oduu Haqi', am: 'ዜና ሰርዝ' },
  deleteNewsConfirm: { en: 'Are you sure you want to delete this news? This action cannot be undone.', om: 'Oduu kana haquuf mirkaneeffataa? Gocha kun deebisuu hin danda\'amu.', am: 'ይህን ዜና መሰረዝ ይፈልጋሉ? ይህ ድርጊት መመለስ አይቻልም።' },
  imageUrl: { en: 'Image URL', om: 'URL Suuraa', am: 'የምስል URL' },
  optional: { en: 'optional', om: 'filannoo', am: 'አማራጭ' },
  about: { en: 'About', om: 'Waa’ee', am: 'ስለ እኛ' },
  contact: { en: 'Contact', om: 'Quunnamtii', am: 'አግኙን' },
  admin: { en: 'Admin', om: 'Bulchaa', am: 'አድሚን' },
  registerCourses: { en: 'Register for Courses', om: 'Koorsiiwwan Galmaa’i', am: 'ኮርሶች ይመዝገቡ' },
  viewAll: { en: 'View All', om: 'Hunda Ilaali', am: 'ሁሉንም አሳይ' },
  noAnnouncements: { en: 'No announcements available.', om: 'Beeksisni hin jiru.', am: 'ማስታወቂያ የለም።' },
  notificationsLabel: { en: 'Notifications', om: 'Beeksisa', am: 'ማሳወቂያዎች' },
  markAllRead: { en: 'Mark all read', om: 'Hunda dubbifame jedhi', am: 'ሁሉን አንብብ አድርግ' },
  noNotifications: { en: 'No new notifications', om: 'Beeksisa haaraa hin jiru', am: 'አዲስ ማሳወቂያ አልተጨመረም' },
  logout: { en: 'Logout', om: 'Ba’i', am: 'ውጣ' },
  administratorLabel: { en: 'Administrator', om: 'Bulchaa', am: 'አድሚን' },
  searchStudentsPlaceholder: { en: 'Search students...', om: 'Barattoota barbaadi...', am: 'ተማሪዎችን ፈልግ...' },
  searchGenericPlaceholder: { en: 'Search...', om: 'Barbaadi...', am: 'ፈልግ...' },
  
  // Home page translations
  welcomeTitle: { en: 'Welcome to ORO DIGITAL', om: 'Baga Nagaan Dhuftan ORO DIGITAL', am: 'ወደ ORO DIGITAL እንኳን በደህና መጡ' },
  welcomeSubtitle: { en: 'Your gateway to digital excellence. Explore our courses, stay updated with news, and join our community.', om: 'Karra keessan gara bu\'uura dijitaalaa. Koorsiiwwan keenya qoradhu, oduu haaromfamaa argadhu, fi hawaasa keenya keessatti makamaa.', am: 'ወደ ዲጂታል ብቃት የሚወስደው መንገድዎ። ኮርሶቻችንን ያስሱ፣ በዜና ዝማኔ ይቆዩ፣ እና ማህበረሰባችንን ይቀላቀሉ።' },
  ourCourses: { en: 'Our Courses', om: 'Koorsiiwwan Keenya', am: 'የእኛ ኮርሶች' },
  register: { en: 'Register', om: 'Galmaa\'i', am: 'ይመዝገቡ' },
  latestNews: { en: 'Latest News', om: 'Oduu Haaraa', am: 'የቅርብ ጊዜ ዜና' },
  photoGallery: { en: 'Photo Gallery', om: 'Gaalerii Suuraa', am: 'የፎቶ ጋለሪ' },
  aboutOroDigital: { en: 'About ORO DIGITAL', om: 'Waa\'ee ORO DIGITAL', am: 'ስለ ORO DIGITAL' },
  aboutDescription: { en: 'We provide comprehensive training programs designed to prepare you for the digital world.', om: 'Sagantaalee leenjii bal\'aa addunyaa dijitaalaa keessatti si qopheessan ni kennina.', am: 'ለዲጂታል ዓለም የሚያዘጋጁዎት ሰፊ የስልጠና ፕሮግራሞችን እንሰጣለን።' },
  expertInstructors: { en: 'Expert Instructors', om: 'Barsiisota Ogummaa', am: 'ባለሙያ አስተማሪዎች' },
  expertInstructorsDesc: { en: 'Learn from industry professionals with years of experience.', om: 'Ogeeyyii industirii muuxannoo waggootaa qaban irraa baradhu.', am: 'ከዓመታት ልምድ ካላቸው የኢንዱስትሪ ባለሙያዎች ይማሩ።' },
  handsOnTraining: { en: 'Hands-on Training', om: 'Leenjii Harkaan', am: 'ተግባራዊ ስልጠና' },
  handsOnTrainingDesc: { en: 'Practical, project-based learning for real-world skills.', om: 'Barnoota pirojektii irratti hundaa\'e, dandeettii addunyaa dhugaa argachuuf.', am: 'ለእውነተኛ ዓለም ክህሎቶች ተግባራዊ፣ በፕሮጀክት ላይ የተመሰረተ ትምህርት።' },
  certifiedPrograms: { en: 'Certified Programs', om: 'Sagantaalee Ragaa Qaban', am: 'የተረጋገጡ ፕሮግራሞች' },
  certifiedProgramsDesc: { en: 'Receive recognized certificates upon completion.', om: 'Xumura booda ragaa beekamaa argadhu.', am: 'ሲጨርሱ የተረጋገጠ ሰርተፍኬት ይቀበላሉ።' },
  getInTouch: { en: 'Get In Touch', om: 'Nu Quunnamaa', am: 'ያግኙን' },
  getInTouchDesc: { en: 'Ready to start your journey? Contact us today for more information.', om: 'Imala keessan jalqabuuf qophaa\'aa? Odeeffannoo dabalataa argachuuf har\'a nu quunnamaa.', am: 'ጉዞዎን ለመጀመር ዝግጁ ነዎት? ለተጨማሪ መረጃ ዛሬ ያግኙን።' },
  contactInformation: { en: 'Contact Information', om: 'Odeeffannoo Quunnamtii', am: 'የመገናኛ መረጃ' },
  location: { en: 'Location', om: 'Bakka', am: 'አድራሻ' },
  locationValue: { en: 'Oromia, Ethiopia', om: 'Oromiyaa, Itoophiyaa', am: 'ኦሮሚያ፣ ኢትዮጵያ' },
  email: { en: 'Email', om: 'Imeelii', am: 'ኢሜይል' },
  emailValue: { en: 'info@orodigital.com', om: 'info@orodigital.com', am: 'info@orodigital.com' },
  phoneValue: { en: '+251 911 234 567', om: '+251 911 234 567', am: '+251 911 234 567' },
  quickActions: { en: 'Quick Actions', om: 'Gochaalee Saffisaa', am: 'ፈጣን እርምጃዎች' },
  quickActionsDesc: { en: 'Get started with these quick actions', om: 'Gochaalee saffisaa kanaan jalqabaa', am: 'በእነዚህ ፈጣን እርምጃዎች ይጀምሩ' },
  adminPortal: { en: 'Admin Portal', om: 'Balbala Bulchaa', am: 'የአድሚን ፖርታል' },
  viewLocation: { en: 'View Location', om: 'Bakka Ilaali', am: 'አድራሻ ይመልከቱ' },
  successRate: { en: 'Success Rate', om: 'Sadarkaa Milkaa\'inaa', am: 'የስኬት መጠን' },
  years: { en: 'Years', om: 'Waggootaa', am: 'ዓመታት' },
  noNewsAvailable: { en: 'No news available.', om: 'Oduu hin jiru.', am: 'ዜና የለም።' },
  noGalleryImages: { en: 'No gallery images available.', om: 'Suuraalee gaalerii hin jiran.', am: 'የጋለሪ ምስሎች የሉም።' },
  adminLogin: { en: 'Admin Login', om: 'Seensa Bulchaa', am: 'የአድሚን መግቢያ' },
  light: { en: 'Light', om: 'Ifa', am: 'ብሩህ' },
  dark: { en: 'Dark', om: 'Dukkanaa\'aa', am: 'ጨለማ' },
};

export const MONTHS = [
  { en: 'January', om: 'Amajjii', am: 'ጥር' },
  { en: 'February', om: 'Guraandhala', am: 'የካቲት' },
  { en: 'March', om: 'Bitootessa', am: 'መጋቢት' },
  { en: 'April', om: 'Ebla', am: 'ሚያዝያ' },
  { en: 'May', om: 'Caamsaa', am: 'ግንቦት' },
  { en: 'June', om: 'Waxabajjii', am: 'ሰኔ' },
  { en: 'July', om: 'Adoolessa', am: 'ሐምሌ' },
  { en: 'August', om: 'Hagayya', am: 'ነሐሴ' },
  { en: 'September', om: 'Fuulbana', am: 'መስከረም' },
  { en: 'October', om: 'Onkoloolessa', am: 'ጥቅምት' },
  { en: 'November', om: 'Sadaasa', am: 'ህዳር' },
  { en: 'December', om: 'Muddee', am: 'ታህሳስ' },
];

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_language');
      if (saved === 'en' || saved === 'om' || saved === 'am') {
        setLanguage(saved as Language);
      }
    } catch {}
  }, []);

  const t = (translationObj: Record<Language, string>) => {
    return translationObj[language] || translationObj.en;
  };
  
  const tk = (key: keyof typeof translations) => {
    const obj = translations[key];
    return obj[language] || obj.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: (lang) => { setLanguage(lang); try { localStorage.setItem('app_language', lang); } catch {} }, t, tk }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
