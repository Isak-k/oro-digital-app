import React from 'react';
import { useNetworkStatus } from '@/hooks/useOffline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineIndicator: React.FC = () => {
  const { isOnline, connectionType } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-0 right-0 z-40 px-4"
        >
          <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You're offline. Some features may be limited.</span>
              <CloudOff className="h-4 w-4 ml-2" />
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      {isOnline && connectionType === 'slow-2g' && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-0 right-0 z-40 px-4"
        >
          <Alert className="bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-200">
            <Wifi className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Slow connection detected. App optimized for offline use.</span>
              <Cloud className="h-4 w-4 ml-2" />
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;