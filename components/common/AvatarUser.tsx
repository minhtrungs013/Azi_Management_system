import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  interface AvatarUserProps {
    url?: string |  undefined,
    name?: string | "AM",
    className?: string
  }
   
  export function AvatarUser({ url, name, className }: AvatarUserProps) {
    return (
      <Avatar className={`w-10 h-10 ${className}`} >
        <AvatarImage src={url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_s87zYsrB1nvFfUvNPUJm6KlFP5wIYz0Nxg&s"} alt="@shadcn" />
        <AvatarFallback>{name}</AvatarFallback>
      </Avatar>
    )
  }