import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyButton({ label, copyText }: { label: string; copyText: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(copyText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset trạng thái sau 2s
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    return (
        <Button onClick={handleCopy} variant="outline" size="sm" className="p-0 border-none rounded-none border-white hover:bg-white text-blue-500 hover:text-red-500">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 " />}
            <span className="underline ">{label}</span>
        </Button>
    );
}
