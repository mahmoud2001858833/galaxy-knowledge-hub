
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "الاسم يجب أن يكون على الأقل حرفين",
  }),
  email: z.string().email({
    message: "يرجى إدخال بريد إلكتروني صحيح",
  }),
  subject: z.string().min(5, {
    message: "الموضوع يجب أن يكون على الأقل 5 أحرف",
  }),
  message: z.string().min(10, {
    message: "الرسالة يجب أن تكون على الأقل 10 أحرف",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // تحويل البيانات إلى JSON وإرسالها إلى قاعدة البيانات
      const messageData = JSON.stringify(values);
      
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            message_text: messageData,
            sender_id: null  // للمستخدمين غير المسجلين
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "تم الإرسال بنجاح",
        description: "لقد تم إرسال رسالتك بنجاح، سنقوم بالرد عليك في أقرب وقت ممكن",
      });
      
      // إعادة ضبط النموذج
      form.reset();
      
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">الاسم</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسمك" {...field} className="bg-white/10 border-white/20" />
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
                <FormLabel className="text-white">البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@domain.com" {...field} className="bg-white/10 border-white/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">الموضوع</FormLabel>
              <FormControl>
                <Input placeholder="موضوع الرسالة" {...field} className="bg-white/10 border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">الرسالة</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="اكتب رسالتك هنا..." 
                  {...field} 
                  className="bg-white/10 border-white/20 min-h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            "إرسال الرسالة"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;
