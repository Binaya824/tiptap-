import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react";

export function SearchDialog({handleSubmit, setPrompt, setHtmlArray, loading , isDialogOpen , setIsDialogOpen , setResult}: {
  handleSubmit: (e: { preventDefault: () => void }) => void;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  setHtmlArray: React.Dispatch<React.SetStateAction<string[]>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setResult: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;}) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">AI Search</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Search</DialogTitle>
          <DialogDescription>
            Search your Document with AI.
          </DialogDescription>
        </DialogHeader>
        <div
            className="flex flex-col gap-4 p-4 justify-center items-center"
          >
            <Input
              type="text"
              placeholder="Search"
              onChange={(e) => setPrompt(e.target.value)}
              autoFocus
              className="outline-none focus:outline-0"
            />
            
          </div>
        <DialogFooter>
        <div className="flex gap-4">
              <Button
                variant="secondary"
                className="w-fit cursor-pointer"
                onClick={handleSubmit}
              >
                {loading && <Loader2 className="animate-spin" />}
                AI Search
              </Button>

              <Button
                variant="secondary"
                onClick={(e) =>{e.preventDefault(); setHtmlArray([]) ;setResult('');}}
                className="w-fit cursor-pointer"
              >
                Upload new Doc
              </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
