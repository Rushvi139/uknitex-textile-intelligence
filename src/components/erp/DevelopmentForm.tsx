import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSourcing } from "@/lib/sourcing-reference";

export function DevelopmentForm() {
  const [open, setOpen] = useState(false);
  const { add } = useSourcing();
  const navigate = useNavigate();
  return <><Button onClick={() => setOpen(true)}><Plus />New development</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogTitle>New development</DialogTitle><DialogDescription>Product identity</DialogDescription>
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const id = add(String(data.get("title")).trim(), String(data.get("category")), String(data.get("collection"))); setOpen(false); void navigate({ to: "/sourcing/developments/$id", params: { id } }); }}>
        <label className="block text-xs font-medium">Development name<input name="title" required className="reference-input mt-1" placeholder="Fabric or development name" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Category<select name="category" className="reference-input mt-1"><option>PLAIN</option><option>STRIPER</option><option>JACQUARD</option></select></label><label className="text-xs font-medium">Collection<input name="collection" className="reference-input mt-1" placeholder="Collection" /></label></div>
        <div className="flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create development</Button></div>
      </form></DialogContent></Dialog></>;
}