import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, BookOpen, Users, Award, Menu, X, ArrowRight, Loader2, Bell, Calendar, Image, Newspaper, Clock, MapPin, Phone, Mail, ExternalLink, Home, Search, Camera, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import logo from '@/assets/logo.png';
import { useCourses } from '@/hooks/useCourses';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useNews } from '@/hooks/useNews';
import { useGallery } from '@/hooks/useGallery';
import { useNotifications } from '@/hooks/useNotifications';
import StudentRegistrationModal from '@/components/StudentRegistrationModal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { format } from 'date-fns';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage, translations } from '@/contexts/LanguageContext';

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);
  const [activeSection, setActiveSection] = useState('home');
  const [isDark, setIsDark] = useState(false);
  
  const { courses, isLoading: coursesLoading } = useCourses();
  const { announcements, isLoading: announcementsLoading } = useAnnouncements();
  const { news, isLoading: newsLoading } = useNews();
  const { gallery, isLoading: galleryLoading } = useGallery();
  const { notifications, isLoading: notificationsLoading } = useNotifications();
  const { t, tk } = useLanguage();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };
  const handleRegister = (courseId?: string) => {
    setSelectedCourseId(courseId);
    setIsRegistrationOpen(true);
  };

  const activeCourses = courses.filter(c => c.active);
  const publicAnnouncements = announcements.filter(a => a.visibleOnHome && !a.adminOnly).slice(0, 6);
  const latestNews = news.slice(0, 6);
  const recentGallery = gallery.slice(0, 8);
  const recentNotifications = notifications.slice(0, 3);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile App Style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="ORO DIGITAL Logo" className="h-10 w-10 rounded-lg bg-white/10 p-1" />
            <div>
              <h1 className="text-lg font-bold">ORO DIGITAL</h1>
              <p className="text-xs text-primary-foreground/80">Computer Training</p>
            </div>
          </div>

          {/* Top Navigation - About & Contact */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => scrollToSection('about')}
            >
              {tk('about')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => scrollToSection('contact')}
            >
              {tk('contact')}
            </Button>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-white/10"
                onClick={toggleTheme}
              >
                {isDark ? t({ en: 'Light', om: 'Ifa', am: 'ብሩህ' }) : t({ en: 'Dark', om: 'Dukkanaa\'aa', am: 'ጨለማ' })}
              </Button>
            </div>
            <Link to="/login">
              <Button variant="secondary" size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                {tk('admin')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/10"
              onClick={toggleTheme}
            >
              {isDark ? t({ en: 'Light', om: 'Ifa', am: 'ብሩህ' }) : t({ en: 'Dark', om: 'Dukkanaa\'aa', am: 'ጨለማ' })}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-primary/95 backdrop-blur-sm border-t border-white/10"
          >
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  variant="ghost" 
                  className="w-full text-primary-foreground hover:bg-white/10 justify-start gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {t({ en: 'Admin Login', om: 'Seensa Bulchaa', am: 'የአድሚን መግቢያ' })}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full text-primary-foreground hover:bg-white/10 justify-start"
                onClick={() => scrollToSection('about')}
              >
                {tk('about')}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-primary-foreground hover:bg-white/10 justify-start"
                onClick={() => scrollToSection('contact')}
              >
                {tk('contact')}
              </Button>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Hero Section - Mobile App Style */}
      <section id="home" className="pt-20 pb-6 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <img src={logo} alt="ORO DIGITAL" className="w-16 h-16 rounded-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t({ en: 'Welcome to ORO DIGITAL', om: 'Baga Nagaan Dhuftan ORO DIGITAL', am: 'ወደ ORO DIGITAL እንኳን በደህና መጡ' })}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
              {t({ en: 'Your gateway to digital excellence. Explore our courses, stay updated with news, and join our community.', om: 'Karra keessan gara bu\'uura dijitaalaa. Koorsiiwwan keenya qoradhu, oduu haaromfamaa argadhu, fi hawaasa keenya keessatti makamaa.', am: 'ወደ ዲጂታል ብቃት የሚወስደው መንገድዎ። ኮርሶቻችንን ያስሱ፣ በዜና ዝማኔ ይቆዩ፣ እና ማህበረሰባችንን ይቀላቀሉ።' })}
            </p>
            <Button size="lg" className="gradient-primary gap-2" onClick={() => handleRegister()}>
              <BookOpen className="w-5 h-5" />
              {tk('registerCourses')}
            </Button>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { value: '500+', label: t({ en: 'Students', om: 'Barattootaa', am: 'ተማሪዎች' }) },
              { value: `${courses.length}`, label: tk('courses') },
              { value: '98%', label: t({ en: 'Success Rate', om: 'Sadarkaa Milkaa\'inaa', am: 'የስኬት መጠን' }) },
              { value: '5+', label: t({ en: 'Years', om: 'Waggootaa', am: 'ዓመታት' }) },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Sections - Mobile App Style */}
      <div className="pb-20"> {/* Add padding for bottom navigation */}
        
        {/* Courses Section */}
        <section id="courses" className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{t({ en: 'Our Courses', om: 'Koorsiiwwan Keenya', am: 'የእኛ ኮርሶች' })}</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                {tk('viewAll')}
              </Button>
            </div>
            
            {coursesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeCourses.slice(0, 4).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Card className="hover:shadow-md transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                            {course.category}
                          </Badge>
                          <Badge className="bg-green-500/10 text-green-600 text-xs">
                            {course.duration}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">{course.courseName}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-xl font-bold text-primary mb-3">
                          {course.monthlyPrice} ETB <span className="text-sm font-normal text-muted-foreground">/ month</span>
                        </div>
                        <Button className="w-full gap-2" size="sm" onClick={() => handleRegister(course.id)}>
                          <BookOpen className="w-4 h-4" />
                          {t({ en: 'Register', om: 'Galmaa\'i', am: 'ይመዝገቡ' })}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Announcements Section */}
        <section id="announcements" className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{tk('announcements')}</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                {tk('viewAll')}
              </Button>
            </div>
            
            {announcementsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : publicAnnouncements.length > 0 ? (
              <div className="space-y-3">
                {publicAnnouncements.slice(0, 3).map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground text-sm line-clamp-1">{announcement.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {announcement.language.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {announcement.content}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(announcement.createdAt, 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {tk('noAnnouncements')}
              </div>
            )}
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{t({ en: 'Latest News', om: 'Oduu Haaraa', am: 'የቅርብ ጊዜ ዜና' })}</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                {tk('viewAll')}
              </Button>
            </div>
            
            {newsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : latestNews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestNews.slice(0, 4).map((newsItem, index) => (
                  <motion.div
                    key={newsItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="hover:shadow-md transition-all overflow-hidden">
                      {newsItem.imageUrl && (
                        <div className="relative">
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src={newsItem.imageUrl}
                              alt={newsItem.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </AspectRatio>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Newspaper className="w-4 h-4 text-primary" />
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(newsItem.createdAt, 'MMM dd')}
                          </div>
                        </div>
                        <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2">{newsItem.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {newsItem.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t({ en: 'No news available.', om: 'Oduu hin jiru.', am: 'ዜና የለም።' })}
              </div>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{t({ en: 'Photo Gallery', om: 'Gaalerii Suuraa', am: 'የፎቶ ጋለሪ' })}</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                {tk('viewAll')}
              </Button>
            </div>
            
            {galleryLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : recentGallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recentGallery.slice(0, 8).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-all">
                      <AspectRatio ratio={1}>
                        <img
                          src={item.imageUrl}
                          alt={item.category}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/placeholder.svg') {
                              target.src = '/placeholder.svg';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-2 left-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </AspectRatio>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t({ en: 'No gallery images available.', om: 'Suuraalee gaalerii hin jiran.', am: 'የጋለሪ ምስሎች የሉም።' })}
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-3">{t({ en: 'About ORO DIGITAL', om: 'Waa\'ee ORO DIGITAL', am: 'ስለ ORO DIGITAL' })}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                {t({ en: 'We provide comprehensive training programs designed to prepare you for the digital world.', om: 'Sagantaalee leenjii bal\'aa addunyaa dijitaalaa keessatti si qopheessan ni kennina.', am: 'ለዲጂታል ዓለም የሚያዘጋጁዎት ሰፊ የስልጠና ፕሮግራሞችን እንሰጣለን።' })}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: t({ en: 'Expert Instructors', om: 'Barsiisota Ogummaa', am: 'ባለሙያ አስተማሪዎች' }),
                  description: t({ en: 'Learn from industry professionals with years of experience.', om: 'Ogeeyyii industirii muuxannoo waggootaa qaban irraa baradhu.', am: 'ከዓመታት ልምድ ካላቸው የኢንዱስትሪ ባለሙያዎች ይማሩ።' }),
                },
                {
                  icon: Users,
                  title: t({ en: 'Hands-on Training', om: 'Leenjii Harkaan', am: 'ተግባራዊ ስልጠና' }),
                  description: t({ en: 'Practical, project-based learning for real-world skills.', om: 'Barnoota pirojektii irratti hundaa\'e, dandeettii addunyaa dhugaa argachuuf.', am: 'ለእውነተኛ ዓለም ክህሎቶች ተግባራዊ፣ በፕሮጀክት ላይ የተመሰረተ ትምህርት።' }),
                },
                {
                  icon: Award,
                  title: t({ en: 'Certified Programs', om: 'Sagantaalee Ragaa Qaban', am: 'የተረጋገጡ ፕሮግራሞች' }),
                  description: t({ en: 'Receive recognized certificates upon completion.', om: 'Xumura booda ragaa beekamaa argadhu.', am: 'ሲጨርሱ የተረጋገጠ ሰርተፍኬት ይቀበላሉ።' }),
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-3">{t({ en: 'Get In Touch', om: 'Nu Quunnamaa', am: 'ያግኙን' })}</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                {t({ en: 'Ready to start your journey? Contact us today for more information.', om: 'Imala keessan jalqabuuf qophaa\'aa? Odeeffannoo dabalataa argachuuf har\'a nu quunnamaa.', am: 'ጉዞዎን ለመጀመር ዝግጁ ነዎት? ለተጨማሪ መረጃ ዛሬ ያግኙን።' })}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    {t({ en: 'Contact Information', om: 'Odeeffannoo Quunnamtii', am: 'የመገናኛ መረጃ' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">{t({ en: 'Location', om: 'Bakka', am: 'አድራሻ' })}</div>
                      <div className="font-medium text-foreground">{t({ en: 'Oromia, Ethiopia', om: 'Oromiyaa, Itoophiyaa', am: 'ኦሮሚያ፣ ኢትዮጵያ' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">{t({ en: 'Email', om: 'Imeelii', am: 'ኢሜይል' })}</div>
                      <div className="font-medium text-foreground">info@orodigital.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">{tk('phone')}</div>
                      <div className="font-medium text-foreground">+251 911 234 567</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t({ en: 'Quick Actions', om: 'Gochaalee Saffisaa', am: 'ፈጣን እርምጃዎች' })}</CardTitle>
                  <CardDescription className="text-sm">
                    {t({ en: 'Get started with these quick actions', om: 'Gochaalee saffisaa kanaan jalqabaa', am: 'በእነዚህ ፈጣን እርምጃዎች ይጀምሩ' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full gap-2" onClick={() => handleRegister()}>
                    <BookOpen className="w-4 h-4" />
                    {tk('registerCourses')}
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={() => window.open('/login', '_blank')}>
                    <LogIn className="w-4 h-4" />
                    {t({ en: 'Admin Portal', om: 'Balbala Bulchaa', am: 'የአድሚን ፖርታል' })}
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={() => window.open('https://maps.google.com/?q=Oromia,Ethiopia', '_blank')}>
                    <MapPin className="w-4 h-4" />
                    {t({ en: 'View Location', om: 'Bakka Ilaali', am: 'አድራሻ ይመልከቱ' })}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </div>

      {/* Mobile App Style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-1 py-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 ${
                activeSection === 'courses' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
              onClick={() => scrollToSection('courses')}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">{tk('courses')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 ${
                activeSection === 'announcements' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
              onClick={() => scrollToSection('announcements')}
            >
              <Bell className="w-5 h-5" />
              <span className="text-xs">{tk('announcements')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 ${
                activeSection === 'news' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
              onClick={() => scrollToSection('news')}
            >
              <Newspaper className="w-5 h-5" />
              <span className="text-xs">{tk('news')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 ${
                activeSection === 'gallery' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
              onClick={() => scrollToSection('gallery')}
            >
              <Camera className="w-5 h-5" />
              <span className="text-xs">{tk('gallery')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer - Simplified for mobile */}
      <footer className="py-6 px-4 border-t border-border bg-background">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-3">
            <img src={logo} alt="ORO DIGITAL Logo" className="h-8 w-auto" />
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ORO DIGITAL. All rights reserved.
          </p>
        </div>
      </footer>

      <StudentRegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)}
      />
    </div>
  );
};

export default Index;
