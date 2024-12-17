import { members } from "@/types/auth";
import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleUploadCloudinary = async (files: FileList) => {
  if (files.length > 0) {
    let newImages: string[] = []
    for (let i = 0; i < files.length; i++) {
      const fromData = new FormData()
      fromData.append("file", files[i])
      fromData.append("upload_preset", "kozqobqt")
      await axios.post(`https://api.cloudinary.com/v1_1/dax8xvyhi/upload`, fromData)
        .then((res) => {
          newImages.push(res.data.url);
        }).catch((error) => {
          console.log(error);
        })
    }
    return newImages
  }
};

export const checkRuleAccess = async (rule: string[], RuleAccess: members) => {
   // Kiểm tra rule truyền vào có tồn tại trong permissions của RuleAccess
   const hasAccess = rule.every((ruleName) =>
    RuleAccess.permissions.some((perm) => perm.name === ruleName)
  );
console.log(RuleAccess);

  return hasAccess;
};
