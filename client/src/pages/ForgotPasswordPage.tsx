import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JetSalesLogo } from "@/components/layout/JetSalesLogo";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const schema = z.object({ email: z.string().min(1, "Informe o email").email("Email inválido") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const mutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success("Se o email existir, você receberá instruções em instantes.");
      form.reset();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 0) {
        toast.error("Backend não configurado.");
      } else {
        toast.error("Não foi possível processar a solicitação.");
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[480px] overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="h-1 bg-primary" />
        <div className="px-8 py-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <JetSalesLogo className="mb-6" />
            <h1 className="text-2xl font-semibold text-primary">Recuperar senha</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Informe seu email cadastrado para receber as instruções
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v.email))} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="seu@email.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full uppercase tracking-wide" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                  Voltar para o login
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
