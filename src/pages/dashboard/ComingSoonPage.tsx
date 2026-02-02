import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

const ComingSoonPage = ({ title, description }: ComingSoonPageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Construction className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl mb-2">Coming Soon</CardTitle>
          <CardDescription className="text-center max-w-md">
            This feature is currently under development and will be available soon. 
            Check back later for updates!
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ComingSoonPage;
