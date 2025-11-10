import {
  FileText,
  Video,
  Image as ImageIcon,
  Mic,
  BarChart3,
  Folder,
} from "lucide-react";
import type { ContentType } from "../types";

export const CONTENT_TYPES: ContentType[] = [
  {
    id: "all",
    label: "Tout le contenu",
    icon: Folder,
    color: "text-muted-foreground",
  },
  { id: "article", label: "Articles", icon: FileText, color: "text-primary" },
  { id: "video", label: "Vidéos", icon: Video, color: "text-red-600" },
  { id: "image", label: "Images", icon: ImageIcon, color: "text-green-600" },
  { id: "audio", label: "Audio", icon: Mic, color: "text-purple-600" },
  { id: "data", label: "Données", icon: BarChart3, color: "text-orange-600" },
  {
    id: "social-post",
    label: "Posts réseaux",
    icon: FileText,
    color: "text-blue-600",
  },
];
