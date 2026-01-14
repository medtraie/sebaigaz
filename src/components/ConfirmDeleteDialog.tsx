
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDeleteDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  triggerButtonText: string;
  isDestructive?: boolean;
}

export function ConfirmDeleteDialog({
  title,
  description,
  onConfirm,
  triggerButtonText,
  isDestructive = true
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={isDestructive ? "destructive" : "outline"}
          className={cn(
            "flex items-center gap-2 rounded-xl h-10 px-4 font-bold transition-all",
            isDestructive 
              ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white" 
              : "border-gray-200 hover:bg-gray-50"
          )}
        >
          <Trash2 className="h-4 w-4" />
          {triggerButtonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <AlertDialogTitle className="text-2xl font-black text-center text-gray-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-500 text-base font-medium leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
          <AlertDialogCancel className="rounded-2xl h-12 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-2xl h-12 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 transition-all px-8"
          >
            Confirmer la suppression
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
