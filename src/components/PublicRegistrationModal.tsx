import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStudents } from '@/hooks/useStudents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useCourses } from '@/hooks/useCourses';
import { Course } from '@/types';

const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Phone number must be at least 9 characters'),
  courseId: z.string().min(1, 'Please select a course'),
});

type FormData = z.infer<typeof formSchema>;

interface PublicRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCourseId?: string;
}

const PublicRegistrationModal = ({ isOpen, onClose, preSelectedCourseId }: PublicRegistrationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addStudent } = useStudents({ enableFetch: false });
  const { addRegistration } = useRegistrations(undefined, { enableFetch: false });
  const { courses } = useCourses();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      courseId: preSelectedCourseId || '',
    },
  });

  // Update courseId if preSelectedCourseId changes
  if (preSelectedCourseId) {
    setValue('courseId', preSelectedCourseId);
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Create Student
      const studentId = await addStudent({
        fullName: data.fullName,
        phone: data.phone,
        status: 'active' // Or 'inactive' depending on business logic
      });

      if (!studentId) throw new Error('Failed to create student record');

      // 2. Create Registration
      const date = new Date();
      await addRegistration({
        studentId,
        courseId: data.courseId,
        month: date.getMonth() + 1, // 1-12
        year: date.getFullYear(),
        paymentStatus: 'unpaid'
      });

      toast({
        title: "Registration Successful!",
        description: "We have received your registration. We will contact you shortly.",
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration Failed",
        description: "There was an error processing your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register for a Course</DialogTitle>
          <DialogDescription>
            Join ORO DIGITAL today. Fill out the form below to secure your spot.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register('fullName')} placeholder="Enter your full name" />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register('phone')} placeholder="0911..." />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course">Select Course</Label>
            <Select 
              onValueChange={(value) => setValue('courseId', value)}
              defaultValue={preSelectedCourseId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id || ''}>
                    {course.courseName} - {course.monthlyPrice} ETB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseId && <p className="text-sm text-red-500">{errors.courseId.message}</p>}
          </div>
          
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Submit Registration'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PublicRegistrationModal;
