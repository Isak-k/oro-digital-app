import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  CalendarDays, 
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { useRegistrations } from '@/hooks/useRegistrations';
import { usePayments } from '@/hooks/usePayments';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const DashboardHome = () => {
  const { admin } = useAuth();
  const { students } = useStudents();
  const { courses } = useCourses();
  const { registrations } = useRegistrations();
  const { payments } = usePayments();

  const currentMonthDate = new Date();
  const currentMonth = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonthIndex = currentMonthDate.getMonth() + 1; // 1-12
  const currentYear = currentMonthDate.getFullYear();

  // Calculate stats
  const totalStudents = students.length;
  const activeCourses = courses.length; // Assuming all courses are active
  
  const monthlyRegistrations = registrations.filter(r => {
    // Check if registration date is in current month/year
    // Note: Registration type has month/year fields, but they might refer to the registered semester.
    // Let's use the createdAt timestamp if available, or fall back to month/year fields.
    const regDate = r.createdAt;
    return regDate && regDate.getMonth() === currentMonthDate.getMonth() && regDate.getFullYear() === currentYear;
  }).length;

  const revenueThisMonth = payments
    .filter(p => {
        // Similar logic for payments
        const payDate = p.createdAt;
        return payDate && payDate.getMonth() === currentMonthDate.getMonth() && payDate.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      change: 'Total registered',
      trend: 'up',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Courses',
      value: activeCourses.toString(),
      change: 'Available now',
      trend: 'up',
      icon: BookOpen,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Monthly Registrations',
      value: monthlyRegistrations.toString(),
      change: 'This month',
      trend: 'up',
      icon: CalendarDays,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Revenue This Month',
      value: `ETB ${revenueThisMonth.toLocaleString()}`,
      change: 'This month',
      trend: 'up',
      icon: CreditCard,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Welcome back, {admin?.name || 'Admin'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening at ORO DIGITAL this month
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              {currentMonth}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.title}</h3>
            <div className="text-2xl font-bold text-foreground mt-1">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activities Section - Placeholder for now as we don't have a centralized activity log yet */}
      <motion.div variants={itemVariants}>
        <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent System Status</h2>
            <div className="space-y-4">
                 <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 mt-2 rounded-full bg-success shrink-0" />
                    <div>
                        <p className="text-sm font-medium">System Operational</p>
                        <p className="text-xs text-muted-foreground">All systems are running smoothly.</p>
                    </div>
                 </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
