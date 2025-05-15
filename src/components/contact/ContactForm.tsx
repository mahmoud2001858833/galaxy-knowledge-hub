
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يتكون الاسم من حرفين على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  subject: z.string().min(5, { message: "يجب أن يتكون الموضوع من 5 أحرف على الأقل" }),
  message: z.string().min(10, { message: "يجب أن تتكون الرسالة من 10 أحرف على الأقل" }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // إرسال الرسالة إلى قاعدة البيانات
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: null, // للمستخدمين غير المسجلين
            message_text: JSON.stringify({
              name: data.name,
              email: data.email,
              subject: data.subject,
              message: data.message
            }),
          }
        ]);

      if (error) throw error;

      setSubmitSuccess(true);
      form.reset();
      
      toast({
        title: "تم إرسال رسالتك بنجاح",
        description: "سنقوم بالرد عليك في أقرب وقت ممكن",
      });
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إرسال رسالتك، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {submitSuccess ? (
        <Alert className="bg-green-500/20 border-green-500/50 mb-6">
          <AlertTitle className="text-green-300 text-right">تم إرسال رسالتك بنجاح</AlertTitle>
          <AlertDescription className="text-right">
            شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.
          </AlertDescription>
          <Button 
            className="mt-4 w-full" 
            onClick={() => setSubmitSuccess(false)}
          >
            إرسال رسالة أخرى
          </Button>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسمك" {...field} className="text-right" />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل بريدك الإلكتروني" {...field} className="text-right" />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">الموضوع</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل موضوع الرسالة" {...field} className="text-right" />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">الرسالة</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب رسالتك هنا..."
                      className="min-h-[150px] text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ContactForm;
