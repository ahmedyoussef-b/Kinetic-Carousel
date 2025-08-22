// src/components/wizard/ScenarioManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
    loadDraftsFromStorage,
    saveDraftToStorage,
    setActiveDraft,
    deleteDraftFromStorage,
    selectAllDrafts,
    selectActiveDraft,
} from '@/lib/redux/features/scheduleDraftSlice';
import useWizardData from '@/hooks/useWizardData';

// UI Components
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Loader2, CheckCircle, Trash2, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { setInitialData } from '@/lib/redux/features/wizardSlice';


export default function ScenarioManager() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const drafts = useAppSelector(selectAllDrafts);
  const activeDraft = useAppSelector(selectActiveDraft);
  const wizardData = useWizardData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDesc, setNewScenarioDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isDialogOpen) {
      dispatch(loadDraftsFromStorage());
    }
  }, [isDialogOpen, dispatch]);

  const handleCreate = async () => {
    if (!newScenarioName.trim()) {
      toast({ variant: 'destructive', title: 'Nom du scénario requis' });
      return;
    }
    setLoading(true);
    
    const newDraft = {
        id: `draft_${Date.now()}`,
        name: newScenarioName,
        description: newScenarioDesc,
        data: wizardData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    dispatch(saveDraftToStorage(newDraft));
    dispatch(setActiveDraft(newDraft));
    
    toast({ title: 'Nouveau scénario créé et activé' });
    setNewScenarioName('');
    setNewScenarioDesc('');
    setIsDialogOpen(false);
    setLoading(false);
  };

  const handleLoad = (draftId: string) => {
    const draftToLoad = drafts.find(d => d.id === draftId);
    if (draftToLoad) {
        dispatch(setActiveDraft(draftToLoad));
        dispatch(setInitialData(draftToLoad.data)); // Hydrate Redux with draft data
        toast({ title: 'Scénario activé', description: "Les données du scénario ont été chargées." });
        setIsDialogOpen(false);
    }
  };

  const handleDelete = (draftId: string) => {
    setDeletingId(draftId);
    dispatch(deleteDraftFromStorage(draftId));
    toast({ title: 'Scénario supprimé' });
    setDeletingId(null);
  };
  
  const handleSave = () => {
    if (!activeDraft) return;
    setLoading(true);
    
    const updatedDraft = {
      ...activeDraft,
      data: wizardData,
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(saveDraftToStorage(updatedDraft));
    dispatch(setActiveDraft(updatedDraft));

    toast({ title: 'Scénario sauvegardé', description: `Vos modifications pour "${activeDraft.name}" ont été sauvegardées localement.`});
    setLoading(false);
  };


  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handleSave} disabled={loading || !activeDraft}>
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button><PlusCircle className="mr-2 h-4 w-4"/>Gérer les Scénarios</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gérer les Scénarios d'Emploi du Temps</DialogTitle>
            <DialogDescription>
              Créez, chargez ou supprimez différents scénarios pour expérimenter avec votre emploi du temps. Tout est sauvegardé dans votre navigateur.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold">Nouveau Scénario</h4>
              <div className="space-y-2">
                <Label htmlFor="scenario-name">Nom</Label>
                <Input 
                  id="scenario-name" 
                  value={newScenarioName} 
                  onChange={(e) => setNewScenarioName(e.target.value)} 
                  placeholder="Ex: Plan A - Semestre 1"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-desc">Description (Optionnel)</Label>
                <Input 
                  id="scenario-desc" 
                  value={newScenarioDesc} 
                  onChange={(e) => setNewScenarioDesc(e.target.value)}
                  placeholder="Avec contraintes pour les examens..."
                  disabled={loading}
                />
              </div>
              <Button onClick={handleCreate} disabled={loading || !newScenarioName.trim()} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer et Activer
              </Button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Scénarios Locaux</h4>
              <ScrollArea className="h-64 border rounded-lg p-2">
                {drafts.length > 0 ? drafts.map(draft => (
                  <div key={draft.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {draft.name}
                          {draft.isActive && <CheckCircle className="h-4 w-4 text-green-500"  />}
                        </p>
                        <p className="text-xs text-muted-foreground">{draft.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleLoad(draft.id)} disabled={draft.isActive || loading}>
                            Charger
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" disabled={loading || deletingId === draft.id}>
                                {deletingId === draft.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action supprimera définitivement le scénario "{draft.name}" de votre navigateur.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(draft.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                  </div>
                )) : <p className="text-sm text-center text-muted-foreground py-10">Aucun scénario sauvegardé.</p>}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
