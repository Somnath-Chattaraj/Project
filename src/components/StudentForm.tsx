import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Student } from '@/types/student';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  codeforcesHandle: z.string().min(1, 'Codeforces handle is required'),
  emailNotifications: z.boolean().default(true),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormValues & { currentRating: number; maxRating: number }) => void;
  initialData?: Student | null;
  isEditing?: boolean;
}

export default function StudentForm({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing = false 
}: StudentFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      codeforcesHandle: '',
      emailNotifications: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        codeforcesHandle: initialData.codeforcesHandle,
        emailNotifications: initialData.emailNotifications,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        codeforcesHandle: '',
        emailNotifications: true,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: StudentFormValues) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        currentRating: initialData?.currentRating || 0,
        maxRating: initialData?.maxRating || 0,
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codeforcesHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codeforces Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Codeforces handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Email Notifications</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Receive email reminders for inactivity
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Student'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}