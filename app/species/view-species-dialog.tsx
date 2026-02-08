"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useState } from "react";
import EditSpeciesDialog from "./edit-species-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface ViewSpeciesDialogProps {
  species: Species;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function ViewSpeciesDialog({ species, open, onOpenChange, userId }: ViewSpeciesDialogProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const isAuthor = species.author === userId;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{species.scientific_name}</DialogTitle>
            <DialogDescription>
              {species.common_name ? `Common name: ${species.common_name}` : "Species information"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full items-center gap-4">
            {species.image && (
              <div className="relative h-64 w-full">
                <Image
                  src={species.image}
                  alt={species.scientific_name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
            )}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Scientific Name</h3>
                <p className="text-lg">{species.scientific_name}</p>
              </div>
              {species.common_name && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Common Name</h3>
                  <p className="text-lg italic">{species.common_name}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Kingdom</h3>
                <p className="text-lg">{species.kingdom}</p>
              </div>
              {species.total_population !== null && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Total Population</h3>
                  <p className="text-lg">{species.total_population.toLocaleString()}</p>
                </div>
              )}
              {species.description && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
                  <p className="text-lg">{species.description}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              {isAuthor && (
                <Button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    setEditDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <EditSpeciesDialog
        species={species}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}
