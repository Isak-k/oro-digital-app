import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="relative mb-8">
          <div className="text-[150px] font-bold gradient-text leading-none">
            404
          </div>
          <div className="absolute inset-0 blur-3xl opacity-20 gradient-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="gradient-primary gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
