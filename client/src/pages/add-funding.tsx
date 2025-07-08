import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertFundingOpportunitySchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertFundingOpportunitySchema.extend({
  sectorsString: z.string().min(1, "Au moins un secteur est requis"),
}).omit({ sectors: true });

type FormData = z.infer<typeof formSchema>;

export default function AddFunding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      fundingProgram: "",
      description: "",
      eligibilityCriteria: "",
      requiredDocuments: "",
      externalLink: "",
      deadline: new Date(),
      minAmount: undefined,
      maxAmount: undefined,
      fundingType: "Don",
      status: "Ouvert",
      sectorsString: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { sectorsString, ...rest } = data;
      const sectors = sectorsString.split(",").map(s => s.trim()).filter(Boolean);
      
      const response = await apiRequest("POST", "/api/funding-opportunities", {
        ...rest,
        sectors,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "L'appel à projet a été ajouté avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/funding-opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/funding-statistics"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'appel à projet",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un appel à projet manuellement</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'appel</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'appel à projet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fundingProgram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fonds/Programme</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Green Climate Fund" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="externalLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien vers l'appel</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date limite</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant minimum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant maximum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fundingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de financement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Don">Don</SelectItem>
                            <SelectItem value="Subvention">Subvention</SelectItem>
                            <SelectItem value="Prêt">Prêt</SelectItem>
                            <SelectItem value="Mixte">Mixte</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ouvert">Ouvert</SelectItem>
                            <SelectItem value="À venir">À venir</SelectItem>
                            <SelectItem value="Fermé">Fermé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="sectorsString"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secteurs (séparés par des virgules)</FormLabel>
                      <FormControl>
                        <Input placeholder="Environnement, Agriculture, Santé" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eligibilityCriteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critères d'éligibilité</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez les critères d'éligibilité..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description du projet..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredDocuments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documents requis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Listez les documents requis..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setLocation("/")}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Ajout en cours..." : "Ajouter l'appel"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
