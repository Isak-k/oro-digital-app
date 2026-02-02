import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegistrationFormData {
  fullName: string;
  phone: string;
}

const StudentRegistrationModal = ({ isOpen, onClose }: StudentRegistrationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RegistrationFormData>();

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'student_requests'), {
        fullName: data.fullName,
        phone: data.phone,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      
      toast.success('Registration submitted successfully! We will review your request.');
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Student Registration</DialogTitle>
          <DialogDescription>
            Fill out the form below to register. Your request will be reviewed by an admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              {...register('fullName', { required: 'Full name is required' })}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter your phone number"
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9+ ]+$/,
                  message: 'Please enter a valid phone number'
                }
              })}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Register Now'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentRegistrationModal;
